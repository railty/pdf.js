const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require("path");
module.exports = {
  entry: "./web/react/index.js",
  output: {
    path: path.join(__dirname, "/web/react/dist"),
    filename: "bundle.js",
    publicPath: "/web/react/dist/",
    assetModuleFilename: "assets/img/[hash][ext][query]",
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "./web/react/index.html",
      // favicon:"./src/asserts/images/logo.ico",
    }),
    new MiniCssExtractPlugin(),
  ],
  resolve: {
    fallback: {
      // Use can only include required modules. Also install the package.
      // for example: npm install --save-dev assert
      url: require.resolve("url"),
      fs: false, //require.resolve("fs"),
      assert: require.resolve("assert"),
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      buffer: require.resolve("buffer"),
      stream: require.resolve("stream-browserify"),
      zlib: "browserify-zlib",
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
      },
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "" },
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "defaults",
                  debug: true,
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
      },
    ],
  },
};
