import webpackConfig from "./webpack.config";
import { execFileSync, execSync } from "child_process";
import { resolve } from "path";
import webpack from "webpack";

let dist = resolve(__dirname, "./dist");

execFileSync("rm", ["-rf", dist]);

execSync("cp -r ./static ./dist", { cwd: __dirname });

webpackConfig.mode =
  process.env.NODE_ENV === "development" ? "development" : "production";
webpack(webpackConfig, (err, stats) => {
  console.log(
    stats.toString({
      colors: true,
      exclude: undefined,
      maxModules: Infinity,
      modulesSort: "!size"
    })
  );
  process.exit(stats.hasErrors() ? 1 : 0);
});
