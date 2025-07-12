import { resolve as _resolve } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default {
  entry: './src/main.scss',
  output: {
    path: _resolve(fileURLToPath(import.meta.url), '..', 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.scss', '.css'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'KG_Dark_Theme.css',
    }),
  ],
  mode: 'development',
};
