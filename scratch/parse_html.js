const fs = require('fs');
const html = fs.readFileSync('scratch/gitmind.html', 'utf8');

// Find all script tags
const scriptSrcs = html.match(/src="([^"]+)"/g) || [];
console.log('--- JS/Script Tags found: ---');
scriptSrcs.forEach(src => console.log(src));

console.log('\n--- Link Tags found: ---');
const hrefs = html.match(/href="([^"]+)"/g) || [];
hrefs.forEach(href => console.log(href));
