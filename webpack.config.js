const path = require('path');

module.exports = {
  entry: './src/scripts/index.ts',
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'src/static'),
  },
  externals: {jQuery: "jQuery", d3: "d3", "plotly.js": "Plotly", "moment": "moment"}
};