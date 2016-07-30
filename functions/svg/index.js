import Aws from 'aws-sdk';
import hash from 'object-hash';
import Rx from 'rx';
import {post$} from 'post';
import {spec$} from 'vg';

const s3 = new Aws.S3();
const upload$ = Rx.Observable.fromNodeCallback(s3.upload, s3);
const HEADER = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`;

export default (event, ctx, cb) => {
  if (!event.spec) {
    return cb('Error: you should provide "spec" prop. Error.');
  }
  const {spec, isLite} = event;
  const filename = hash(spec);

  spec$(spec, isLite)
    .map(chart => {
      const view = chart({renderer: 'svg'}).update();
      const svg = HEADER + view.svg();
      return {
        Bucket: 'vega-renderer',
        Key: filename,
        ACL: 'public-read',
        Body: svg,
        ContentType: 'image/svg+xml'
      };
    })
    .flatMap(params => upload$(params))
    .flatMap(data => post$(event, data.Location))
    .subscribe(result => {
      cb(null, result);
    }, err => {
      console.log(err);
      cb(err);
    });
};
