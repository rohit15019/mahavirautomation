const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (
                content.includes('role = "admin"') || 
                content.includes("role = 'admin'") || 
                content.includes('req.body.role') || 
                content.includes('role = role ||') || 
                content.includes('updateOne({}') || 
                content.includes('findOneAndReplace')
            ) {
                console.log('FOUND IN:', fullPath);
            }
        }
    }
}

search('d:/Another');
