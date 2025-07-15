import fs from 'fs';
import path from 'path';

function incrementVersion(versionString) {
  const parts = versionString.split('.');
  const patch = parseInt(parts[2]) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

function updateVersionInFile(filePath, isStylish = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const versionRegex = isStylish 
    ? /@version\s+(.+)/
    : /@version\s+(.+)/;
  
  const match = content.match(versionRegex);
  if (!match) {
    console.error(`Version not found in ${filePath}`);
    return;
  }
  
  const currentVersion = match[1].trim();
  const newVersion = incrementVersion(currentVersion);
  
  const updatedContent = content.replace(versionRegex, `@version        ${newVersion}`);
  
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated ${path.basename(filePath)}: ${currentVersion} → ${newVersion}`);
}

// Update both header files
const stylishHeaderPath = path.resolve('src', 'header-stylish.js');
const tampermonkeyHeaderPath = path.resolve('src', 'header-tampermonkey.js');

updateVersionInFile(stylishHeaderPath, true);
updateVersionInFile(tampermonkeyHeaderPath, false);

console.log('✅ Version increment completed!');