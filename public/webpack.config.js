const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

const jsPath= './js';
const cssPath = './scss';
const outputPath = 'build';
const entryPoints = {
  'index': [jsPath + '/index.js', cssPath + '/main.scss']
};

module.exports = {
  entry: entryPoints,
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: './js/[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './css/[name].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s?[c]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: true } },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          { loader: "sass-loader", options: { sourceMap: true } },
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
  },
};