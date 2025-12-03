const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walk(filepath, filelist);
    } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx') || filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function checkImports(file) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /import .* from ['"](.*)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.includes('Client') || importPath.includes('client')) {
      console.log(`⚠️ Possible casing mismatch in ${file}: ${importPath}`);
    }
  }
}

const files = walk(path.join(__dirname, 'Client', 'src'));
files.forEach(checkImports);
