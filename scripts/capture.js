const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set a good viewport size for the screenshot
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('Navigating to http://localhost:3000...');
    // networkidle0 waits until there are no more than 0 network connections for at least 500 ms.
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const screenshotPath = path.join(__dirname, 'frontend_screenshot.png');
    console.log(`Taking screenshot: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await browser.close();
    console.log('Screenshot captured successfully.');
  } catch (err) {
    console.error('Error taking screenshot:', err);
    process.exit(1);
  }
})();
