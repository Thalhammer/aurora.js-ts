// JavaScript Audio Resampler
// Copyright (C) 2011-2015 Grant Galitz
// Released to Public Domain
// Ported to Typescript by Dominik Thalhammer, 2019
export class Resampler {

	private resampler: (a: Float32Array) => Float32Array;
	private ratioWeight: number;
	private lastWeight: number;
	private outputBuffer: Float32Array;
	private lastOutput: Float32Array;
	private tailExists: boolean;

	constructor(
		private fromSampleRate: number,
		private toSampleRate: number,
		private channels: number,
		private inputBufferLength: number
	) {
		if (!this.channels) {
			this.channels = 0;
		}

		if (!(this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0)) {
			throw (new Error('Invalid settings specified for the resampler.'));
		}
		this.initialize();
	}

	private initialize() {
		// Perform some checks:
		if (this.fromSampleRate === this.toSampleRate) {
			// Setup a resampler bypass:
			this.resampler = this.bypassResampler;    // Resampler just returns what was passed through.
			this.ratioWeight = 1;
		} else {
			this.ratioWeight = this.fromSampleRate / this.toSampleRate;
			if (this.fromSampleRate < this.toSampleRate) {
				/*
				  Use generic linear interpolation if upsampling,
				  as linear interpolation produces a gradient that we want
				  and works fine with two input sample points per output in this case.
				*/
				this.compileLinearInterpolationFunction();
				this.lastWeight = 1;
			} else {
				/*
				  Custom resampler I wrote that doesn't skip samples
				  like standard linear interpolation in high downsampling.
				  This is more accurate than linear interpolation on downsampling.
				*/
				this.compileMultiTapFunction();
				this.tailExists = false;
				this.lastWeight = 0;
			}

			const ceil = Math.ceil(this.inputBufferLength * this.toSampleRate / this.fromSampleRate / this.channels * 1.01);
			const outputBufferSize = (ceil * this.channels) + this.channels;
			this.outputBuffer = new Float32Array(outputBufferSize);
			this.lastOutput = new Float32Array(this.channels);
		}
	}

	private bypassResampler(inputBuffer: Float32Array): Float32Array {
		return inputBuffer;
	};

	private compileLinearInterpolationFunction() {
		let toCompile = 'var outputOffset = 0;\
          var bufferLength = buffer.length;\
          if (bufferLength > 0) {\
            var weight = this.lastWeight;\
            var firstWeight = 0;\
            var secondWeight = 0;\
            var sourceOffset = 0;\
            var outputOffset = 0;\
            var outputBuffer = this.outputBuffer;\
            for (; weight < 1; weight += ' + this.ratioWeight + ') {\
              secondWeight = weight % 1;\
              firstWeight = 1 - secondWeight;';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'outputBuffer[outputOffset++] = (this.lastOutput[' + channel + '] '
				+ '* firstWeight) + (buffer[' + channel + '] * secondWeight);';
		}
		toCompile += '}\
            weight -= 1;\
            for (bufferLength -= ' + this.channels + ', sourceOffset = Math.floor(weight) * '
			+ this.channels + '; sourceOffset < bufferLength;) {\
              secondWeight = weight % 1;\
              firstWeight = 1 - secondWeight;';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'outputBuffer[outputOffset++] = (buffer[sourceOffset'
				+ ((channel > 0) ? (' + ' + channel) : '')
				+ '] * firstWeight) + (buffer[sourceOffset + ' + (this.channels + channel) + '] * secondWeight);';
		}
		toCompile += 'weight += ' + this.ratioWeight + ';\
              sourceOffset = Math.floor(weight) * ' + this.channels + ';\
            }';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'this.lastOutput[' + channel + '] = buffer[sourceOffset++];';
		}
		toCompile += 'this.lastWeight = weight % 1;\
          }\
          return this.outputBuffer;';

		this.resampler = Function('buffer', toCompile) as (a: Float32Array) => Float32Array;
	}

	private compileMultiTapFunction() {
		let toCompile = 'var outputOffset = 0;\
          var bufferLength = buffer.length;\
          if (bufferLength > 0) {\
            var weight = 0;';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'var output' + channel + ' = 0;';
		}
		toCompile += 'var actualPosition = 0;\
            var amountToNext = 0;\
            var alreadyProcessedTail = !this.tailExists;\
            this.tailExists = false;\
            var outputBuffer = this.outputBuffer;\
            var currentPosition = 0;\
            do {\
              if (alreadyProcessedTail) {\
                weight = ' + this.ratioWeight + ';';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'output' + channel + ' = 0;';
		}
		toCompile += '}\
              else {\
                weight = this.lastWeight;';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'output' + channel + ' = this.lastOutput[' + channel + '];';
		}
		toCompile += 'alreadyProcessedTail = true;\
              }\
              while (weight > 0 && actualPosition < bufferLength) {\
                amountToNext = 1 + actualPosition - currentPosition;\
                if (weight >= amountToNext) {';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'output' + channel + ' += buffer[actualPosition++] * amountToNext;';
		}
		toCompile += 'currentPosition = actualPosition;\
                  weight -= amountToNext;\
                }\
                else {';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'output' + channel + ' += buffer[actualPosition' + ((channel > 0) ? (' + ' + channel) : '') + '] * weight;';
		}
		toCompile += 'currentPosition += weight;\
                  weight = 0;\
                  break;\
                }\
              }\
              if (weight <= 0) {';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'outputBuffer[outputOffset++] = output' + channel + ' / ' + this.ratioWeight + ';';
		}
		toCompile += '}\
              else {\
                this.lastWeight = weight;';
		for (let channel = 0; channel < this.channels; ++channel) {
			toCompile += 'this.lastOutput[' + channel + '] = output' + channel + ';';
		}
		toCompile += 'this.tailExists = true;\
                break;\
              }\
            } while (actualPosition < bufferLength);\
          }\
          return this.outputBuffer;';

		this.resampler = Function('buffer', toCompile) as (a: Float32Array) => Float32Array;
	};
};
