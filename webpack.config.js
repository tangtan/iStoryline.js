const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './app/static/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: "./app/js/index.js",
  output: {
    //path: path.resolve('dist'),
    path: path.resolve(__dirname, "dist"),
    filename: "index_bundle.js"
  },
  module: {
    loaders: [
      {
        test: require.resolve("snapsvg"),
        loader: "imports-loader?this=>window,fix=>module.exports=0"
      }
    ]
  },
  plugins: [HtmlWebpackPluginConfig],
  resolve: {
    // temp fix for using d3 and d3-selection-multi together
    alias: {
      d3: "d3/index.js"
    }
  }
};