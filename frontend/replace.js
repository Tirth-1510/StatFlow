import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) { 
            results.push(file);
        }
    });
    return results;
}
let changed = 0;
walk(path.join(__dirname, 'src')).forEach(f => {
   let text = fs.readFileSync(f, 'utf8');
   if (text.includes('http://localhost:3000')) {
       fs.writeFileSync(f, text.replace(/http:\/\/localhost:3000/g, ''));
       console.log('Modified:', f);
       changed++;
   }
});
console.log('Total files modified:', changed);
