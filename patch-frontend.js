const fs = require('fs');
const path = require('path');

const srcDir = 'd:/Another/front-end/src';
const files = fs.readdirSync(srcDir);

for (const file of files) {
  if (!file.endsWith('.jsx') && !file.endsWith('.js')) continue;

  const fullPath = path.join(srcDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  const target1 = "'X-User-Role': localStorage.getItem('role') || 'User'";
  const replacement1 = "'Authorization': `Bearer ${localStorage.getItem('token')}`";

  const target2 = '"X-User-Role": localStorage.getItem("role") || "User"';
  const replacement2 = '"Authorization": `Bearer ${localStorage.getItem("token")}`';

  if (content.includes(target1)) {
    content = content.split(target1).join(replacement1);
    changed = true;
  }
  if (content.includes(target2)) {
    content = content.split(target2).join(replacement2);
    changed = true;
  }

  // Also replace anywhere there is just `headers: { 'X-User-Role': localStorage.getItem('role') || 'User' }`
  // The simple string replacement above should catch almost all of them since it's the exact substring.

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated:', file);
  }
}
