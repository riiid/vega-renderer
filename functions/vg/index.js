import Aws from 'aws-sdk';
import hash from 'object-hash';
import Rx from 'rx';
import {PassThrough} from 'stream';
import {post$} from 'post';
import {spec$} from 'vg';

const s3 = new Aws.S3();
const upload$ = Rx.Observable.fromNodeCallback(s3.upload, s3);

export default (event, ctx, cb) => {
  if (!event.spec) {
    return cb('Error: you should provide "spec" prop. Error.');
  }
  const {spec, isLite} = event;
  const filename = hash(spec);

  spec$(spec, isLite)
    .map(chart => {
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
