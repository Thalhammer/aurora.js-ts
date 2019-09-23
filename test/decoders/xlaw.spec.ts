import { decoderTest, decoderTestSkip } from './shared';

// TODO: Some tests are skipped until the correct demuxers are ported
describe('decoders/xlaw', () => {
  decoderTest('alaw', {
    file: 'au/alaw.au',
    data: '1543ac89',
    type: Int16Array
  });

  decoderTestSkip('ulaw', {
    file: 'm4a/ulaw.mov',
    data: '565b7fd',
    type: Int16Array
  });
});