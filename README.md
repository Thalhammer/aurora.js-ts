Aurora.js
=========

Aurora.js is a framework that makes writing audio decoders in JavaScript easier.  It handles common 
tasks for you such as dealing with binary data, and the decoding pipeline from source to demuxer to 
decoder, and finally to the audio hardware itself by abstracting browser audio APIs.  Aurora contains 
two high level APIs for inspecting and playing back decoded audio, and it is easily extendible to support 
more sources, demuxers, decoders, and audio devices.

**This repo contains a port of Aurora.js to Typescript and fixes some of the issues in the original project.
It was built because the original project seems abandoned and Coffeescript is hard to maintain.**

You can find the original project [here](https://github.com/audiocogs/aurora.js).

It aims to be api compatible with the original code, while still providing a better base for extensions and adding features where appropriate.

## Authors

Aurora.js was written by [@jensnockert](https://github.com/jensnockert) and [@devongovett](https://github.com/devongovett) 
of [Audiocogs](https://github.com/audiocogs/).
It was ported to Typescript by [@Thalhammer](https://github.com/Thalhammer).

## Usage

As far as Javascript usage is concerned, it should be a drop in replacement for AuroraJS.
NOTE: None of the external codecs (flac, alac, aac or mp3) is ported until now and the original releases wont work.
This will however be done in the near future.

## Building

To build a browser lib use:
```
npm run browser-mode
npm run build
```

to build for node:
```
npm run node-mode
npm run build
```

## License

Aurora.js is released under the MIT license.