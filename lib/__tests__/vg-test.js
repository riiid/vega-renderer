import fs from 'fs';
import {spec$, png, svg} from 'vg';

const VEGA_LITE_SPEC = {
  data: {
    url: "http://vega.github.io/vega-lite/data/seattle-weather.csv"
  },
  mark: "tick",
  encoding: {
    x: {
      field: "precipitation",
      type: "quantitative"
    }
  }
};

describe('vg.js', () => {
  it('should spec$ pass a function', () => {
    return spec$(VEGA_LITE_SPEC, true)
      .toPromise()
      .then(result => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('function');
      });
  });

  it('should png pass bucket object', () => {
    return spec$(VEGA_LITE_SPEC, true)
      .map(chart => png(chart, 'test.png'))
      .toPromise()
      .then(result => {
        expect(result).toBeDefined();
        expect(result).toMatchObject({
          Bucket: 'vega-renderer',
          Key: 'test.png',
          ACL: 'public-read',
          ContentType: 'image/png'
        });
        expect(result.Body._readableState.length).toBeDefined();

        const stream = fs.createWriteStream('./lib/__tests__/test.png');
        result.Body.pipe(stream);

        expect(fs.existsSync('./lib/__tests__/test.png')).toBeTruthy();
      });
  });

  it('svg', () => {
    return spec$(VEGA_LITE_SPEC, true)
      .map(chart => svg(chart, 'test.svg'))
      .toPromise()
      .then(result => {
        expect(result).toBeDefined();
        expect(result).toMatchObject({
          Bucket: 'vega-renderer',
          Key: 'test.svg',
          ACL: 'public-read',
          ContentType: 'image/svg+xml'
        });
        expect(typeof result.Body).toBe('string');

        fs.writeFileSync('./lib/__tests__/test.svg', result.Body);
        expect(fs.existsSync('./lib/__tests__/test.svg')).toBeTruthy();
      });
  });
});
