const fs = require('fs');
const file = 'd:/Sevantra/apps/web/src/app/(dashboard)/events/[eventId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/bg-white/g, 'bg-[var(--surface)]');
fs.writeFileSync(file, content);
console.log('Done');
