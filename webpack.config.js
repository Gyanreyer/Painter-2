const path = require("path");
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  entry: ["@babel/polyfill", "./src/index.js"],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-proposal-class-properties"]
          }
        }
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: "worker-loader",
          options: { fallback: true, inline: true }
        }
      },
      {
        test: /\.glsl$/,
        use: ["raw-loader", "glslify-loader"]
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin(),
    new MiniCssExtractPlugin({
      filename: "bundle.css"
    }),
    new OptimizeCssAssetsPlugin()
  ]
};
