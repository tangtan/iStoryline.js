const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: "./app/static/index.html",
  filename: "index.html",
  inject: "body"
});

module.exports = {
  entry: "./app/js/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index_bundle.js"
  },
  module: {
    rules: [
      {
        test: require.resolve("snapsvg"),
        use: "imports-loader?this=>window,fix=>module.exports=0"
      }
    ]
  },
  plugins: [HtmlWebpackPluginConfig]
};
