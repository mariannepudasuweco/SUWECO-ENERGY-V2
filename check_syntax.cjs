const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  fs.writeFileSync('script_content.js', scriptMatch[1]);
  try {
    const vm = require('vm');
    new vm.Script(scriptMatch[1]);
    console.log("Syntax OK");
  } catch (e) {
    console.error("Syntax Error:", e);
  }
} else {
  console.log("No script found");
}
