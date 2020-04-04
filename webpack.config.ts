import {Configuration} from "webpack";
import * as path from 'path';

let config: Configuration = {
  entry: './src/frontend/index.ts',
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/'),
  },
  externals: {
    jQuery: "jQuery", 
    d3: "d3", 
    "plotly.js": "Plotly", 
    "moment": "moment"
  }
};

export default config;