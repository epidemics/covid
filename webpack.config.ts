import { Configuration } from "webpack";
import * as path from "path";

let config: Configuration = {
  entry: "./frontend/index.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "frontend/tsconfig.json"
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist/")
  },
  externals: {
    jQuery: "jQuery",
    d3: "d3",
    "plotly.js": "Plotly",
    moment: "moment",
    "chroma-js": "chroma",
    react: "React",
    "react-dom": "ReactDOM",
    "react-plotly.js": "createPlotlyComponent.default(Plotly)"
  }
};

export default config;
