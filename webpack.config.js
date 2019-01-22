const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

// webpack.config.js
module.exports = () => {
    return {
        mode: 'development',
        entry: './src/index.js',
        node: {
            fs: "empty"
        },
        plugins: [
            new Dotenv({
                path: path.resolve(__dirname, './.env'),
            })
        ],
        output: {
            filename: 'js/[name].bundle.js',
            chunkFilename: 'js/[name].bundle.js',
            path: path.resolve(__dirname, 'src')
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