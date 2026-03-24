const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  { regex: /(?<!dark:)text-gray-900(?![ \t]+dark:)/g, replacement: 'text-gray-900 dark:text-gray-50' },
  { regex: /(?<!dark:)text-gray-800(?![ \t]+dark:)/g, replacement: 'text-gray-800 dark:text-gray-200' },
  { regex: /(?<!dark:)text-gray-600(?![ \t]+dark:)/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { regex: /(?<!dark:)text-gray-500(?![ \t]+dark:)/g, replacement: 'text-gray-500 dark:text-gray-400' },
  { regex: /(?<!dark:)text-zinc-900(?![ \t]+dark:)/g, replacement: 'text-zinc-900 dark:text-zinc-50' },
  { regex: /(?<!dark:)text-zinc-600(?![ \t]+dark:)/g, replacement: 'text-zinc-600 dark:text-zinc-400' },
  { regex: /(?<!dark:)text-zinc-500(?![ \t]+dark:)/g, replacement: 'text-zinc-500 dark:text-zinc-400' },
  { regex: /(?<!dark:)text-green-700(?![ \t]+dark:)/g, replacement: 'text-green-700 dark:text-green-400' },
  { regex: /(?<!dark:)text-green-800(?![ \t]+dark:)/g, replacement: 'text-green-800 dark:text-green-300' },
  { regex: /(?<!dark:)bg-white(?![ \t]+dark:)/g, replacement: 'bg-white dark:bg-zinc-950' },
  { regex: /(?<!dark:)bg-slate-50(?![ \t]+dark:)/g, replacement: 'bg-slate-50 dark:bg-zinc-900' },
  { regex: /(?<!dark:)bg-gray-50(?![ \t]+dark:)/g, replacement: 'bg-gray-50 dark:bg-zinc-900' },
  { regex: /(?<!dark:)bg-green-50(?!\w|[ \t]+dark:)/g, replacement: 'bg-green-50 dark:bg-green-900/20' },
  { regex: /(?<!dark:)bg-green-100(?!\w|[ \t]+dark:)/g, replacement: 'bg-green-100 dark:bg-green-900/30' },
  { regex: /(?<!dark:)border-gray-100(?!\w|[ \t]+dark:)/g, replacement: 'border-gray-100 dark:border-zinc-800' },
  { regex: /bg-inherit/g, replacement: 'bg-inherit' } // dummy, actually not needed
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const replace of replacements) {
        content = content.replace(replace.regex, replace.replacement);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('Class replacement done.');
