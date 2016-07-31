# vega-renderer

An AWS Lambda function that render [vega](https://vega.github.io/vega/) & [vega-lite](http://vega.github.io/vega-lite/) spec into image(png, svg).

## development

```bash
$ git clone riiid/vega-renderer
$ cd vega-renderer
$ npm install
$ npm run lint
```

## deploy

### prerequisites

* [apex](http://apex.run/)
* [terraform](https://www.terraform.io/)

deploy functions

```bash
$ apex deploy
```

deploy infra (s3, api gateway)

```bash
$ apex infra get
$ apex infra apply
```

> update [project_name](https://github.com/riiid/vega-renderer/blob/master/infrastructure/dev/variables.tf#L2) variable to change s3 bucket & api gateway name.

## invoke

### with `apex invoke` command

create `test.json` with following content.

```json
{
  "isLite": true,
  "spec": {
    "data": {
      "url": "http://vega.github.io/vega-lite/data/seattle-weather.csv"
    },
    "mark": "tick",
    "encoding": {
      "x": {
        "field": "precipitation",
        "type": "quantitative"
      }
    }
  }
}
```

then invoke lambda function with it.

```bash
$ apex invoke png < test.json
{"result":"https://<PROJECT_NAME>.s3-ap-northeast-1.amazonaws.com/309ce6a75790c0753426753a991702cd65961d5b"}
```

### in other lambda function

```js
import Rx from 'rx';
import Aws from 'aws-sdk';

const SPEC = {
  "isLite": true,
  "spec": {
    "data": {
      "url": "http://vega.github.io/vega-lite/data/seattle-weather.csv"
    },
    "mark": "tick",
    "encoding": {
      "x": {
        "field": "precipitation",
        "type": "quantitative"
      }
    }
  }
}

const lambda = new Aws.Lambda();
const invoke$ = (FunctionName, Payload, InvocationType = 'RequestResponse') => {
  return Rx.Observable.fromNodeCallback(lambda.invoke, lambda)({
    FunctionName,
    Payload,
    InvocationType
  });
};

export default (event, ctx, cb) => {
  return invoke$('vega-renderer_png', JSON.stringify({spec: SPEC}))
    .subscribe(result => {
      cb(null, result);
    }, err => {
      cb(err);
    });
};
```
