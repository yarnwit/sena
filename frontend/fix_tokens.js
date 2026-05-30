const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'app');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove localStorage.getItem("accessToken")
    content = content.replace(/try\s*\{\s*return\s*localStorage\.getItem\((?:'|")accessToken(?:'|")\)[^}]+\}\s*catch\s*\{\s*return\s*(?:'|")(?:'|")\s*;\s*\}/g, 'return "";');
    content = content.replace(/const\s+token\s*=\s*localStorage\.getItem\((?:'|")accessToken(?:'|")\);?/g, '');
    
    // 2. Remove localStorage.removeItem("accessToken")
    content = content.replace(/localStorage\.removeItem\((?:'|")accessToken(?:'|")\);?/g, '');

    // 3. Remove Authorization header from authHeaders or direct headers
    content = content.replace(/Authorization:\s*`Bearer \$\{getToken\(\)\}`\s*,?\s*/g, '');
    content = content.replace(/Authorization:\s*`Bearer \$\{token\}`\s*,?\s*/g, '');
    content = content.replace(/Authorization:\s*`Bearer \$\{localStorage\.getItem\((?:'|")accessToken(?:'|")\)\}`\s*,?\s*/g, '');

    // 4. Update fetch calls to include credentials: "include" if they have an options object
    // This regex looks for fetch(..., { ... }) and injects credentials: "include",
    content = content.replace(/fetch\(([^,]+),\s*\{/g, 'fetch($1, { credentials: "include",');
    
    // 5. Update fetch calls that don't have an options object
    // This is tricky, but let's try a simple approach: if it's fetch(url) we change to fetch(url, { credentials: "include" })
    content = content.replace(/fetch\(([^,]+)\)/g, 'fetch($1, { credentials: "include" })');

    // 6. In some files, token is checked for existence: `if (!token) return;` 
    // We should be careful. If `const token = ...` is removed, `if (!token)` will cause a ReferenceError.
    // So let's replace `if (!token)` with `if (false)` or just remove it if it was right after.
    // Better yet, instead of removing `const token = ...`, let's replace it with `const token = "http-only-cookie";` so it evaluates to true.
    content = content.replace(/const\s+token\s*=\s*localStorage\.getItem\((?:'|")accessToken(?:'|")\);?/g, 'const token = "http-only-cookie";');

    // Rollback the empty removal to replace it properly
    original = fs.readFileSync(filePath, 'utf8');
    content = original;

    content = content.replace(/try\s*\{\s*return\s*localStorage\.getItem\((?:'|")accessToken(?:'|")\)[^}]+\}\s*catch\s*\{\s*return\s*(?:'|")(?:'|")\s*;\s*\}/g, 'return "http-only-cookie";');
    content = content.replace(/const\s+token\s*=\s*localStorage\.getItem\((?:'|")accessToken(?:'|")\);?/g, 'const token = "http-only-cookie";');
    content = content.replace(/let\s+token\s*=\s*localStorage\.getItem\((?:'|")accessToken(?:'|")\);?/g, 'let token = "http-only-cookie";');
    
    content = content.replace(/localStorage\.removeItem\((?:'|")accessToken(?:'|")\);?/g, '');

    content = content.replace(/Authorization:\s*`Bearer \$\{getToken\(\)\}`\s*,?\s*/g, '');
    content = content.replace(/Authorization:\s*`Bearer \$\{token\}`\s*,?\s*/g, '');
    content = content.replace(/Authorization:\s*`Bearer \$\{localStorage\.getItem\([^)]+\)\}`\s*,?\s*/g, '');

    // Replace fetch with credentials
    content = content.replace(/fetch\(([^,]+),\s*\{/g, 'fetch($1, { credentials: "include",');
    // For fetch without options, we replace fetch(xxx) with fetch(xxx, { credentials: "include" })
    // Careful not to match fetch(xxx, { credentials: "include", ...)
    content = content.replace(/fetch\(([^,]+)\)/g, (match, p1) => {
        // if it already has credentials, leave it
        if (p1.includes('credentials')) return match;
        // else inject
        return `fetch(${p1}, { credentials: "include" })`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(filePath);
        }
    }
}

walk(directory);
console.log("Done updating frontend files.");
