
import webpackConfig from './webpack.config';
import { execSync } from 'child_process';
import { resolve } from 'path';
import * as webpack from 'webpack';

let dist = resolve(__dirname, "./dist");

execSync(`rm -rf ${dist}`)

execSync("cp -r ./static ./dist", {cwd: __dirname})

webpackConfig.mode = process.env.NODE_ENV === "development" ? "development" : "production";
webpack(webpackConfig, (err, stats) => {
    console.log(stats.toString({colors: true}));
    process.exit(stats.hasErrors() ? 1 : 0);
})
