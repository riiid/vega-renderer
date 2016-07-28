# vega-renderer

An AWS Lambda function that render [vega](https://vega.github.io/vega/) & [vega-lite](http://vega.github.io/vega-lite/) spec into image.

## development

```
$ git clone riiid/vega-renderer
$ cd vega-renderer
$ npm install
$ npm run lint
```

## deploy

functions

```
$ apex deploy
```

infra (s3, api gateway)

```
$ apex infra get
$ apex infra apply -var 'project_name=<YOUR_PROJECT_NAME>'
```

> s3 bucket & api gateway will use `project_name` variable.

## invoke

create `test.json` with following content.

```
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

```
$ apex invoke vg < test.json
{"result":"https://<YOUR_PROJECT_NAME>.s3-ap-northeast-1.amazonaws.com/309ce6a75790c0753426753a991702cd65961d5b"}
```
