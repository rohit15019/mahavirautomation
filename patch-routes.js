const fs = require('fs');
const path = require('path');

const routesDir = 'd:/Another/back-end/routes';
const files = fs.readdirSync(routesDir);

for (const file of files) {
  if (!file.endsWith('.routes.js')) continue;

  const fullPath = path.join(routesDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (content.includes('{ auth, admin }')) {
    content = content.replace('{ auth, admin }', '{ authenticateUser, authorizeAdmin }');
    changed = true;
  }
  
  if (content.includes(', auth, admin,')) {
    content = content.split(', auth, admin,').join(', authenticateUser, authorizeAdmin,');
    changed = true;
  }

  if (file === 'admin.routes.js') {
    const target = `    if (user.role === 'Admin') {`;
    const replacement = `    if (user.email === 'mahavirautomation111@gmail.com') {
      return res.status(403).json({ message: 'Protected administrator account cannot be deleted.' });
    }

    if (user.role === 'Admin') {`;
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated:', file);
  }
}
