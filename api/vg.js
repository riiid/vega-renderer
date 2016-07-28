import vg from 'vega';
import vl from 'vega-lite';

export const spec$ = (spec, isLite = false) => {
  const result = isLite ? vl.compile(spec).spec : spec;
  return Rx.Observable.create(observer => {
    vg.parse.spec(result, (err, chart) => {
      if (err) {
        observer.onError(err);
      } else {
        observer.onNext(chart);
        observer.onCompleted();
      }
    });
  });
};
