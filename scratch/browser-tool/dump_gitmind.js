const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const cookies = [
  {"domain":".gitmind.com","name":"_bl_uid","path":"/","value":"60mamo74tv1rOX2k0hp3m3b379n7"},
  {"domain":".gitmind.com","name":"_gcl_au","path":"/","value":"1.1.1028195565.1779851364"},
  {"domain":".gitmind.com","name":"_ga","path":"/","value":"GA1.1.1795038888.1778053376"},
  {"domain":".gitmind.com","name":"_gid","path":"/","value":"GA1.1.1795038888.1778053376"},
  {"domain":".gitmind.com","name":"apptype","path":"/","value":"saas-index"},
  {"domain":".gitmind.com","name":"_uetsid","path":"/","value":"76d65a50597911f1bc111754fb2ae4b2"},
  {"domain":".gitmind.com","name":"_uetvid","path":"/","value":"2e813410491f11f18d665bfdbc22125f"},
  {"domain":".gitmind.com","name":"Hm_lvt_960ef17df44dacb2a038ecfdc57c6bf5","path":"/","value":"1778053371,1779851365"},
  {"domain":".gitmind.com","name":"HMACCOUNT","path":"/","value":"27DD4362E010AC5D"},
  {"domain":".gitmind.com","name":"_ga_V607FGN3LY","path":"/","value":"GS2.1.s1779851364$o1$g1$t1779851465$j53$l0$h0"},
  {"domain":".gitmind.com","name":"_ga_Q7D4BH6P0F","path":"/","value":"GS2.1.s1779851364$o1$g1$t1779851465$j53$l0$h0"},
  {"domain":".gitmind.com","name":"Hm_lpvt_960ef17df44dacb2a038ecfdc57c6bf5","path":"/","value":"1779851466"}
];

(async () => {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Setting cookies...');
    await page.setCookie(...cookies);

    console.log('Navigating to GitMind...');
    await page.goto('https://gitmind.com/app/docs/mxaotj65', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('Waiting 8 seconds for map to fully render...');
    await new Promise(r => setTimeout(r, 8000));

    // Capture screenshot
    const screenshotPath = path.join(__dirname, '..', 'gitmind_screenshot.png');
    console.log('Taking screenshot...');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Screenshot saved to:', screenshotPath);

    // Extract page text or node text
    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);

    // Let's dump all text found on the page to see what's in the nodes
    const pageText = await page.evaluate(() => {
      // Look for text in SVG or div elements
      const elements = Array.from(document.querySelectorAll('text, div, span, p'));
      return elements.map(el => el.textContent.trim()).filter(t => t.length > 0);
    });

    // Filter unique texts to find nodes
    const uniqueTexts = Array.from(new Set(pageText));
    fs.writeFileSync(path.join(__dirname, '..', 'gitmind_text.json'), JSON.stringify(uniqueTexts, null, 2));
    console.log('Extracted texts saved. Total unique texts:', uniqueTexts.length);

  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
