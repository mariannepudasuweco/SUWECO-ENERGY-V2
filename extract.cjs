const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    fs.writeFileSync('test.js', scriptMatch[1]);
    console.log('Extracted script to test.js');
} else {
    console.log('No script found');
}
