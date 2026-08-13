const fs = require('fs');
const html = fs.readFileSync('scratch/gitmind.html', 'utf8');

// Find all matches for "window." or "__" in script tags
const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
let match;
while ((match = regex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('__') || content.includes('window.') || content.includes('JSON.parse')) {
    console.log('--- FOUND MATCHING SCRIPT ---');
    console.log(content.substring(0, 1500));
    console.log('-----------------------------');
  }
}
