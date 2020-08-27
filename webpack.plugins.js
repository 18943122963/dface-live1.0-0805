// const webpack = require("webpack");
const path = require("path");

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
// const CompressionWebpackPlugin = require('compression-webpack-plugin')

const BuildEnv = {
  Prod: process.env.VUE_APP_BUILD_ENV === "prod",
  Pre: process.env.VUE_APP_BUILD_ENV === "pre",
  Dev: process.env.VUE_APP_BUILD_ENV === "dev"
};

// webpackPlugin
let webpackPlugins = [
  // new webpack.ProvidePlugin({
  //   _: 'lodash'
  // })
  // new webpack.DllReferencePlugin({
  //   context: process.cwd(),
  //   manifest: require('./public/vendor/vendor-manifest.json')
  // }),
  // new AddAssetHtmlPlugin({
  //   // dll文件位置
  //   filepath: path.resolve(__dirname, './public/vendor/*.js'),
  //   // dll 引用路径
  //   publicPath: '/vendor',
  //   // dll最终输出的目录
  //   outputPath: '/vendor'
  // })
];

// nexus
if (BuildEnv.Prod) {
  let zipPlugin, nexusDeployer;
  var ZipPlugin = require("zip-webpack-plugin");
  var NexusDeployer = require("dface-nexus-deployer-webpack-plugin");
  var rc = require("rc");
  var npm = rc("npm", null, []);
  var pkg = require("./package.json");
  zipPlugin = new ZipPlugin({
    path: path.resolve(__dirname, "./dist"),
    filename: pkg.name + ".zip"
  });

  let NexusUrl = "https://nexus-npm-prei.dface.cn/repository/npm-raw-release";

  nexusDeployer = new NexusDeployer({
    groupId: "releases",
    artifactId: pkg.name,
    version: pkg.version + "." + pkg.devVersion,
    packaging: "zip",
    auth: {
      username: npm["email"] || "",
      password: npm["password"] || ""
    },
    pomDir: "dist/pom",
    url: NexusUrl,
    artifact: "dist/" + pkg.name + ".zip"
  });
  webpackPlugins.push(zipPlugin);
  webpackPlugins.push(nexusDeployer);
}

// if (BuildEnv.Prod) {
//   webpackPlugins.push(
//     new CompressionWebpackPlugin({
//       algorithm: 'gzip',
//       test: /\.(js|css)$/, // 匹配文件名
//       threshold: 10000, // 对超过10k的数据压缩
//       deleteOriginalAssets: false, // 不删除源文件
//       minRatio: 0.8 // 压缩比
//     })
//   )
// }

// minimizer
let minimizer = [];

if (BuildEnv.Prod) {
  minimizer.push(
    new UglifyJsPlugin({
      exclude: /\.min\.js$/,
      extractComments: false,
      uglifyOptions: {
        compress: {
          // warnings: false,
          drop_debugger: true,
          drop_console: true
        }
      },
      sourceMap: false,
      parallel: true
    })
  );
}

module.exports = {
  minimizer,
  webpackPlugins
};
