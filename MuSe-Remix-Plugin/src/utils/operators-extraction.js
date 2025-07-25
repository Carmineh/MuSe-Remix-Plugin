const fs = require('fs');
const path = require('path');

// Folder paths
const baseDir = path.join(__dirname, 'src', 'operators');
const folders = {
  genericOperators: 'Minimal',
  solidityOperators: 'Standard',
  securityOperators: 'MuSe'
};

function formatLabel(label) {
  let formatted = label.replace(/-/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function extractIdAndName(filePath) {
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let id = null, name = null;
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('this.ID')) {
        id = line.split('=')[1].replace(/[;"']/g, '').trim();
      }
      if (line.startsWith('this.name')) {
        name = line.split('=')[1].replace(/[;"']/g, '').trim();
      }
      if (id && name) break;
    }
    if (id && name) {
      return { value: id, label: formatLabel(name) };
    }
  } catch (e) {}
  return null;
}

const results = {};

for (const [arrayName, folderName] of Object.entries(folders)) {
  const dir = path.join(baseDir, folderName);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
  results[arrayName] = [];
  for (const file of files) {
    const operator = extractIdAndName(path.join(dir, file));
    if (operator) results[arrayName].push(operator);
  }
}

// Write the arrays to operators.js as ES module exports
const outputPath = path.join(__dirname, 'operators.js');
let fileContent = '';
for (const [arrayName, arr] of Object.entries(results)) {
  fileContent += `export const ${arrayName} = ${JSON.stringify(arr, null, 2)};\n\n`;
}
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Operators exported to ${outputPath}`);