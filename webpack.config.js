import { resolve as _resolve } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import fs from 'fs';
import path from 'path';

class CombineHeaderPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CombineHeaderPlugin', () => {
      const distDir = path.resolve('dist');
      const tampermonkeyHeaderPath = path.resolve('src', 'js', 'header-tampermonkey.js');
      const mainJsPath = path.resolve('src', 'js', 'main.js');
      const cssPath = path.join(distDir, 'temp-styles.css');
      
      // Check if CSS file exists before processing
      if (!fs.existsSync(cssPath)) {
        console.log('⚠️ CSS file not found, skipping header combination');
        return;
      }
      
      try {
        // Read header, main script, and CSS content
        const tampermonkeyHeader = fs.readFileSync(tampermonkeyHeaderPath, 'utf8');
        const mainJsCode = fs.readFileSync(mainJsPath, 'utf8');
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // Create tampermonkey version using main.js file
        const tampermonkeyContent = tampermonkeyHeader + '\n\n' + 
          mainJsCode.replace('CSS_CONTENT_PLACEHOLDER', JSON.stringify(cssContent));
        
        fs.writeFileSync(path.join(distDir, 'KG_Dark_Theme.js'), tampermonkeyContent);
        
        console.log('✅ Generated KG_Dark_Theme.js for Tampermonkey');
      } catch (error) {
        console.error('❌ Error in CombineHeaderPlugin:', error.message);
      }
    });
  }
}

export default {
  entry: './src/main.scss',
  output: {
    path: _resolve(fileURLToPath(import.meta.url), '..', 'dist'),
    clean: false,
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
      filename: 'temp-styles.css',
    }),
    new CombineHeaderPlugin(),
  ],
  mode: 'development',
  // Add watch options for better error handling
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000, // Check for changes every second
  },
};