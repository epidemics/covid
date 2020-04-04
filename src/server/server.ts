import * as express from "express";
import * as path from "path";
import * as compression from "compression";
import * as nunjucks from "nunjucks";

import * as webpack from "webpack";
import * as webpackDev from "webpack-dev-middleware";

import webpackConfig from "../../webpack.config";
import { router, navigation_bar } from "./routes";

let app = express()

// set up compression, threshold default is 1 kb
app.use(compression())

// set up nunjucks as templating engine
nunjucks.configure(path.join(__dirname, 'templates'), {
  autoescape: true,
  express: app
});

// set up the static file server, but only if we get no STATIC_URL
if(!process.env.STATIC_URL){
  let mount = "/static"

  app.locals.STATIC_URL = mount;
  app.use(
    mount,
    express.static(path.join(__dirname, '../static'))
  )
}else{
  app.locals.STATIC_URL = process.env.STATIC_URL;
}

if(app.get('env') === "development"){
  // on development we run webpack for serving bundles
  let publicPath = "/webpack"

  webpackConfig.mode = "development";
  let compiler = webpack(webpackConfig);

  app.use(webpackDev(compiler, { publicPath }));

  app.locals.BUNDLE_LOCATION = publicPath
}else{
  app.locals.BUNDLE_LOCATION = app.locals.STATIC_URL
}

// make the navigation structure availible and load the routes
app.locals.navigation_bar = navigation_bar;
app.use(router);

// finally serve
app.listen(8000, function(){
  console.log("Server started")
})
