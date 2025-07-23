import { resolve as _resolve } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import fs from 'fs';
import path from 'path';

class CombineHeaderPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CombineHeaderPlugin', () => {
      const distDir = path.resolve('dist');
      const stylishHeaderPath = path.resolve('src', 'header-stylish.js');
      const tampermonkeyHeaderPath = path.resolve('src', 'header-tampermonkey.js');
      const cssPath = path.join(distDir, 'temp-styles.css');
      
      // Read headers and CSS content
      const stylishHeader = fs.readFileSync(stylishHeaderPath, 'utf8');
      const tampermonkeyHeader = fs.readFileSync(tampermonkeyHeaderPath, 'utf8');
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Create stylish version (CSS with UserStyle header and @-moz-document wrapper)
      const wrappedCssContent = `@-moz-document domain("klavogonki.ru") {\n\n${cssContent}\n}`;
      const stylishContent = stylishHeader + '\n\n' + wrappedCssContent;
      fs.writeFileSync(path.join(distDir, 'KG_Dark_Theme.css'), stylishContent);
      
      // Create tampermonkey version (JS with UserScript header that injects CSS)
      const tampermonkeyContent = tampermonkeyHeader + '\n\n' + 
        '(function() {\n' +
        '    \'use strict\';\n' +
        '    \n' +
        '    function loadDarkTheme() {\n' +
        '        const css = ' + JSON.stringify(cssContent) + ';\n' +
        '        \n' +
        '        const style = document.createElement(\'style\');\n' +
        '        style.className = \'kg-dark-theme\';\n' +
        '        style.textContent = css;\n' +
        '        \n' +
        '        // Try to append to head, fallback to documentElement\n' +
        '        const target = document.head || document.documentElement;\n' +
        '        target.appendChild(style);\n' +
        '    }\n' +
        '    \n' +
        '    // Execute immediately if possible\n' +
        '    if (document.head) {\n' +
        '        loadDarkTheme();\n' +
        '    } else {\n' +
        '        // Wait for head to be available\n' +
        '        const observer = new MutationObserver((mutations, obs) => {\n' +
        '            if (document.head) {\n' +
        '                loadDarkTheme();\n' +
        '                obs.disconnect();\n' +
        '            }\n' +
        '        });\n' +
        '        observer.observe(document.documentElement, {\n' +
        '            childList: true,\n' +
        '            subtree: true\n' +
        '        });\n' +
        '    }\n' +
        '})();';
      
      fs.writeFileSync(path.join(distDir, 'KG_Dark_Theme.js'), tampermonkeyContent);
      
      console.log('✅ Generated KG_Dark_Theme.css for Stylish');
      console.log('✅ Generated KG_Dark_Theme.js for Tampermonkey');
    });
  }
}

export default {
  entry: './src/main.scss',
  output: {
    path: _resolve(fileURLToPath(import.meta.url), '..', 'dist'),
    clean: false,
  },
  devServer: {
    devMiddleware: {
      writeToDisk: true 
    }
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
};