try {
  const puppeteer = require('puppeteer');
  console.log('puppeteer is available');
} catch (e) {
  console.log('puppeteer is NOT available:', e.message);
}

try {
  const playwright = require('playwright');
  console.log('playwright is available');
} catch (e) {
  console.log('playwright is NOT available:', e.message);
}
