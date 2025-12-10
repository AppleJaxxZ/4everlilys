const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '../public/images/pastImages');
const outputFile = path.join(__dirname, '../src/data/mediaList.js');

// Read all files from directory
const files = fs.readdirSync(mediaDir);

// Filter and categorize media files
const mediaFiles = files
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.mp4', '.mov'].includes(ext);
  })
  .map(file => {
    const ext = path.extname(file).toLowerCase();
    const type = ['.mp4', '.mov'].includes(ext) ? 'video' : 'image';
    return {
      src: `/images/pastImages/${file}`,
      type: type
    };
  });

// Generate JavaScript file
const output = `// Auto-generated file - do not edit manually
// Run 'node scripts/generateMediaList.js' to update

const mediaFiles = ${JSON.stringify(mediaFiles, null, 2)};

export default mediaFiles;
`;

fs.writeFileSync(outputFile, output);
console.log(`✅ Generated media list with ${mediaFiles.length} files`);
console.log(`📁 Output: ${outputFile}`);