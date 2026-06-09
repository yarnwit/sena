const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const appDir = path.join(__dirname, 'frontend/app');
const files = walk(appDir);

let modifiedCount = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('"http-only-cookie"')) {
    const newContent = content.replace(/"http-only-cookie"/g, "sessionStorage.getItem('accessToken')");
    fs.writeFileSync(file, newContent);
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Modified ${modifiedCount} files.`);
