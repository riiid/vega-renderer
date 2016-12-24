import vg from 'vega';
import vl from 'vega-lite';
import Rx from 'rxjs';
import {PassThrough} from 'stream';

const HEADER = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`;

export const spec$ = (spec, isLite = false) => {
  const result = isLite ? vl.compile(spec).spec : spec;
  return Rx.Observable.create(observer => {
    vg.parse.spec(result, (err, chart) => {
      if (err) {
        observer.error(err);
      } else {
        observer.next(chart);
        observer.complete();
      }
    });
  });
};

export const png = (chart, filename) => {
  const view = chart({renderer: 'canvas'}).update();
  const canvas = view.canvas();
  const stream = canvas.pngStream();
  const passthrough = new PassThrough();
  stream.pipe(passthrough);
  return {
    Bucket: 'vega-renderer',
    Key: filename,
    ACL: 'public-read',
    Body: passthrough,
    ContentType: 'image/png'
  };
};

export const svg = (chart, filename) => {
  const view = chart({renderer: 'svg'}).update();
  const svg = HEADER + view.svg();
  return {
    Bucket: 'vega-renderer',
    Key: filename,
    ACL: 'public-read',
    Body: svg,
    ContentType: 'image/svg+xml'
  };
};
