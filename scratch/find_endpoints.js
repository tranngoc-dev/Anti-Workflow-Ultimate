const fs = require('fs');
const data = fs.readFileSync('scratch/pc.js', 'utf8');

// Let's search for API base URLs or paths
const regex = /"\/biz\/[^"]+"|'\/biz\/[^']+'|"\/api\/[^"]+"|'\/api\/[^']+'/g;
const matches = data.match(regex) || [];
console.log('Unique API routes in bundle:');
const unique = Array.from(new Set(matches)).sort();
unique.forEach(m => {
  if (m.includes('map') || m.includes('share') || m.includes('doc') || m.includes('view') || m.includes('file')) {
    console.log(m);
  }
});
