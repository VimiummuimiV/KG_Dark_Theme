import fs from 'fs';
import path from 'path';

function incrementVersion(versionString) {
  const parts = versionString.split('.');
  const patch = parseInt(parts[2]) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

function updateVersionInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  const versionRegex = /@version\s+(.+)/;
  
  const match = content.match(versionRegex);
  if (!match) {
    console.error(`Version not found in ${filePath}`);
    return;
  }
  
  const currentVersion = match[1].trim();
  const newVersion = incrementVersion(currentVersion);
  
  // Always use 6 spaces for consistent formatting
  const updatedContent = content.replace(versionRegex, `@version        ${newVersion}`);
  
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated ${path.basename(filePath)}: ${currentVersion} → ${newVersion}`);
}

// Update both header files
const stylishHeaderPath = path.resolve('src', 'header-stylish.js');
const tampermonkeyHeaderPath = path.resolve('src', 'header-tampermonkey.js');

updateVersionInFile(stylishHeaderPath);
updateVersionInFile(tampermonkeyHeaderPath);

console.log('✅ Version increment completed!');