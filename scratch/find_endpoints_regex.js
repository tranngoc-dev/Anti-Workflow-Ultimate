const fs = require('fs');
const data = fs.readFileSync('scratch/pc.js', 'utf8');

const regex = /"\/[^"]*?api\/[^"]*?"|'\/[^']*?api\/[^']*?'|"\/[^"]*?biz\/[^"]*?"|'\/[^']*?biz\/[^']*?'/g;
const matches = data.match(regex) || [];
console.log('Total matches found:', matches.length);

const uniqueMatches = Array.from(new Set(matches));
console.log('Sample of 100 endpoints:');
uniqueMatches.slice(0, 100).forEach(m => console.log(m));
