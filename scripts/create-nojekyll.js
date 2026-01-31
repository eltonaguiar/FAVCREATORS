import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const nojekyllPath = path.join(distDir, '.nojekyll');

if (fs.existsSync(distDir)) {
    fs.writeFileSync(nojekyllPath, '');
    console.log('.nojekyll file created in dist/');
} else {
    console.error('dist directory not found. Run build first.');
    process.exit(1);
}
