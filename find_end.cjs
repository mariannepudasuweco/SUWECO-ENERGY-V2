const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
let start = lines.findIndex(l => l.includes('window.renderExpenseOverview = function'));
let braces = 0;
for (let i = start; i < lines.length; i++) {
    braces += (lines[i].match(/\{/g) || []).length;
    braces -= (lines[i].match(/\}/g) || []).length;
    if (braces === 0) {
        console.log("Ends at line:", i + 1);
        break;
    }
}
