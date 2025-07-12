import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const headerPath = path.resolve('src', 'header.js');
const cssPath = path.join(distDir, 'KG_Dark_Theme.css');
const outputCssPath = cssPath;

const headerContent = fs.readFileSync(headerPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const combinedContent = `${headerContent}\n\n${cssContent}`;
fs.writeFileSync(outputCssPath, combinedContent);
