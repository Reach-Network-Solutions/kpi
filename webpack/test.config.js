// const path = require('path');
// const webpack = require('webpack');
// const WebpackCommon = require('./webpack.common');

// module.exports = WebpackCommon({
//   mode: 'development',
//   entry: path.resolve(__dirname, '../test/index.js'),
//   output: {
//     library: 'tests',
//     path: path.resolve(__dirname, '../test/compiled/'),
//     filename: 'webpack-built-tests.js'
//   },
//   // mainly for hiding stylelint output
//   stats: {
//     all: false,
//     maxModules: 0,
//     errors: true,
//     errorDetails: true
//   }
// });

const path = require('path');
const webpack = require('webpack');
const webpackCommon = require('./webpack.common');
const WebpackCommon = require('./webpack.common');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

module.exports = webpackCommon({
    mode: mode,
    entry: './jsapp/js/app.es6',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    }, 

    module: {
        rules: [
           {
              test: /\.js$/, 
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader'
              }
           } 
        ]
    },

    devtool: 'source-map',
    devServer: {
        contentBase: './public'
    }
})
