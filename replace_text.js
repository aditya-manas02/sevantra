const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

walkDir('d:/Sevantra/apps/web/src', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.match(/text-gray-[89]00|text-slate-[89]00|text-black/g)) {
      content = content.replace(/text-gray-[89]00|text-slate-[89]00|text-black/g, 'text-[var(--text-primary)]');
      changed = true;
  }
  if (content.match(/text-gray-[56]00|text-slate-[56]00/g)) {
      content = content.replace(/text-gray-[56]00|text-slate-[56]00/g, 'text-[var(--text-secondary)]');
      changed = true;
  }
  if (content.match(/bg-gray-50|bg-slate-50|bg-red-50|bg-amber-50|bg-green-50|bg-purple-50|bg-blue-50/g)) {
      content = content.replace(/bg-gray-50|bg-slate-50|bg-red-50|bg-amber-50|bg-green-50|bg-purple-50|bg-blue-50/g, 'bg-[var(--background)]');
      changed = true;
  }
  if (content.match(/bg-gray-100|bg-slate-100/g)) {
      content = content.replace(/bg-gray-100|bg-slate-100/g, 'bg-[var(--surface)]');
      changed = true;
  }
  if (content.match(/border-gray-200|border-slate-200|border-red-200/g)) {
      content = content.replace(/border-gray-200|border-slate-200|border-red-200/g, 'border-[var(--border)]');
      changed = true;
  }
  if (changed) {
      fs.writeFileSync(file, content);
      console.log('Updated ' + file);
  }
});
