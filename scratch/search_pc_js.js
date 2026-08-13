const http = require('https');
const fs = require('fs');

const url = 'https://cfcdn.apowersoft.info/local/gitmind.com/app/gitmindcom/static/js/pc.1809dbb2.js';

console.log('Downloading main bundle...');
http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Bundle loaded. Size:', data.length);
    fs.writeFileSync('scratch/pc.js', data);

    // Let's search for some keywords in pc.js
    const keywords = ['/api/', '/biz/', 'mxaotj65', 'docs/', 'share/', 'getmap', 'loadmap', 'mindmap', 'document', 'map/'];
    keywords.forEach(keyword => {
      let idx = 0;
      let count = 0;
      while ((idx = data.indexOf(keyword, idx)) !== -1) {
        count++;
        // Print surrounding context
        console.log(`Keyword: "${keyword}" (match ${count})`);
        console.log(data.substring(Math.max(0, idx - 100), Math.min(data.length, idx + 100)));
        console.log('-------------------------------');
        idx += keyword.length;
        if (count > 5) break; // Limit matches per keyword
      }
    });
  });
}).on('error', (e) => {
  console.error(e);
});
