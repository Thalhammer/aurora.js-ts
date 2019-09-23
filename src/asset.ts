/*
The Asset class is responsible for managing all aspects of the 
decoding pipeline from source to decoder.  You can use the Asset
class to inspect information about an audio file, such as its 
format, metadata, and duration, as well as actually decode the
file to linear PCM raw audio data.
*/
import {EventEmitter} from './core/event-emitter';
import { HTTPSource, FileSource, BufferSource } from './sources';
import {Demuxer} from './demuxer';
import {Decoder} from './decoder';
import {ISource} from './source';

export class Asset extends EventEmitter {

    private buffered : number = 0;
    private duration : number = null;
    private format : any = null;
    private metadata : any = null;
    private active : boolean = false;
    private shouldDecode: boolean;
    private demuxer : Demuxer = null;
    public decoder : Decoder = null;

    constructor(private source: ISource) {
        super();
                
        this.source.once('data', this.probe.bind(this));
        this.source.on('error', (err) => {
            this.emit('error', err);
            this.stop();
        });
            
        this.source.on('progress', (buffered: number) => {
            this.buffered = buffered;
            this.emit('buffer', this.buffered);
        });
    }

    static fromURL(url, opts) {
        return new Asset(new HTTPSource(url, opts));
    }

    static fromFile(file) {
        return new Asset(new FileSource(file));
    }
        
    static fromBuffer(buffer) {
        return new Asset(new BufferSource(buffer));
    }
        
    start(decode? : boolean) {
        if(this.active) return;

        this.shouldDecode = (decode == undefined) ? false : !(!decode);
        
        this.active = true;
        this.source.start();
        
        if(this.decoder && this.shouldDecode)
            this._decode();
    }

    stop() {
        if(!this.active) return;
        
        this.active = false
        this.source.pause();
    }

    get(event: 'format'|'duration'|'metadata', callback) {
        if(['format', 'duration', 'metadata'].indexOf(event)==-1) return;
        if(this[event]) return callback(this[event]);
        
        this.once(event, (value) => {
            this.stop();
            callback(value);
        });
        this.start();
    }
            
    decodePacket(){
        this.decoder.decode();
    }
        
    decodeToBuffer(callback) {
        let length = 0;
        let chunks = [];
        let dataHandler = (chunk) => {
            length += chunk.length;
            chunks.push(chunk);
        };
        this.on('data', dataHandler);          
        this.once('end', () => {
            let buf = new Float32Array(length)
            let offset = 0

            chunks.forEach(chunk => {
                buf.set(chunk, offset);
                offset += chunk.length;
            });
                
            this.off('data', dataHandler);
            callback(buf);
        });
        this.start();
    }
    
    probe(chunk) {
        if(!this.active) return;
        
        let demuxer = Demuxer.find(chunk);
        if(!demuxer)
            return this.emit('error', 'A demuxer for this container was not found.');
            
        this.demuxer = new demuxer(this.source, chunk);
        this.demuxer.on('format', this.findDecoder.bind(this));
        
        this.demuxer.on('duration', (duration) => {
            this.duration = duration;
            this.emit('duration', this.duration);
        });

        this.demuxer.on('metadata', (metadata) => {
            this.metadata = metadata;
            this.emit('metadata', this.metadata);
        });

        this.demuxer.on('error', (err) => {
            this.emit('error', err);
            this.stop();
        });
    }

    findDecoder(format) {
        this.format = format;
        if(!this.active) return;
        
        this.emit('format', this.format);
        
        let decoderType = Decoder.find(this.format.formatID);
        if(!decoderType)
            return this.emit('error', "A decoder for #{@format.formatID} was not found.");

        this.decoder = new decoderType(this.demuxer, this.format);
        
        if(this.format.floatingPoint) {
            this.decoder.on('data', (buffer) => {
                this.emit('data', buffer);
            });
        } else {
            let div = Math.pow(2, this.format.bitsPerChannel - 1);
            this.decoder.on('data', (buffer) => {
                let buf = new Float32Array(buffer.length);
                for(let i=0; i<buffer.length; i++)
                    buf[i] = buffer[i] / div;
                    
                this.emit('data', buf);
            });
        }
        this.decoder.on('error', (err) =>{
            this.emit('error', err);
            this.stop();
        });
            
        this.decoder.on('end', () => {
            this.emit('end');
        });
            
        this.emit('decodeStart');
        if(this.shouldDecode) this._decode();
    }

    private _decode() {
        while(this.active && this.decoder.decode());
        if(this.active) this.decoder.once("data", this._decode.bind(this));
    }
        
    destroy() {
        this.stop()
        if(this.demuxer) this.demuxer.off();
        if(this.decoder) this.decoder.off();
        if(this.source) this.source.off();
        this.off()
    }
}