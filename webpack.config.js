const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
let PugFiles = [];
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FlowWebpackPlugin = require('flow-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ImageminPlugin = require('imagemin-webpack-plugin').default;
// const webpack = require('webpack');

// To read file tpye of Pug
fs.readdirSync('./src/pug', { withFileTypes: true }).forEach(function(elementName) {
    let array = elementName.split(".");
    // Check that is a file or folder
    if(array.length == 2) {
        PugFiles.push(
            new HtmlWebpackPlugin({
                template: `./src/pug/${ elementName }`,
                filename:`./${ array[0]}.html`
            })
        )
    }
});

module.exports = (env, argv) => {
    return {
        devServer: {
            contentBase: path.join(__dirname, 'dest'),
            compress: true,
            port: 3000,
            open: true,
            overlay: {
                errors: true
            }
        },
        entry: [
            './src/js/index.js',
            './src/scss/style.scss'
        ],
        output: {
            filename: 'js/bundle.js',
            path: path.resolve(__dirname, './dest'),
            publicPath: '/',
        },
        module: {
            rules: [
                {
                    test: /\.pug$/,
                    use: ['html-loader','pug-html-loader']
                },
                {
                    test: /\.(scss)$/,
                    use: [
                        argv.mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                        "css-loader",
                        "postcss-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: [  
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        },
                        {
                            loader: 'eslint-loader',
                        }
                    ]
                },
                {   // For css
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                        }
                    }]
                },
                {   // For css
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                        }
                    }]
                },
                {
                    test: require.resolve("jquery"),
                    use: [
                        {
                            loader: 'expose-loader',
                            options: '$'
                        },
                        {
                            loader: 'expose-loader',
                            options: 'jQuery'
                        }
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "css/style.css",
            }),
            new CopyWebpackPlugin([
                { 
                    from: 'src/assets/images', 
                    to: 'images/' 
                },
                // {   from: 'src/assets/video',
                //     to: 'video/' 
                // }
            ]),
            new ImageminPlugin(
                { 
                    test: /\.(jpe?g|png|gif|svg)$/i ,
                    disable: argv.mode !== 'production',
                    pngquant: {
                        quality: '60-80'
                    }
                }
            ),
            new CleanWebpackPlugin(['dest']),
            new FlowWebpackPlugin(),
            new OptimizeCSSAssetsPlugin({}),
        ].concat(PugFiles),
    }
}
