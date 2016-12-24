module.exports = {
  entry: './index.js',
  target: 'node',
  externals: {
    '../build/Release/canvas': 'canvas',
    'aws-sdk': 'aws-sdk'
  },
  output: {
    path: './dist',
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    modulesDirectories: ['lib', 'node_modules']
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
}
