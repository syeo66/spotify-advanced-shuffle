const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// webpack.config.js
module.exports = () => {
    return {
        mode: 'development',
        entry: './src/index.js',
        node: {
            fs: "empty"
        },
        plugins: [
          new webpack.HashedModuleIdsPlugin(),
          new HtmlWebpackPlugin({
            hash: true,
            title: 'Spotify Advanced Shuffle',
            template: './src/index.orig.html',
          }),
          new Dotenv({
              path: path.resolve(__dirname, './.env'),
          })
        ],
        output: {
          filename: 'js/[name].[contenthash].js',
          chunkFilename: 'js/[name].[contenthash].js',
          path: path.resolve(__dirname, 'src'),
        },
        optimization: {
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  // get the name. E.g. node_modules/packageName/not/this/part.js
                  // or node_modules/packageName
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `npm.${packageName.replace('@', '')}`;
                },
              },
            },
          },
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env','@babel/preset-react'],
                            plugins: [
                                "@babel/transform-runtime",
                                "@babel/transform-async-to-generator",
                                "@babel/plugin-proposal-class-properties"
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        }
    }
};
