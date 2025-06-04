// save as tree.js and run with `node tree.js`

const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    const pointer = isLast ? '└── ' : '├── ';
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    console.log(prefix + pointer + item);

    if (stats.isDirectory()) {
      printTree(fullPath, prefix + (isLast ? '    ' : '│   '));
    }
  });
}

printTree(process.cwd());