const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        
        console.log('Navigating to Home...');
        await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
        
        console.log('Checking Navbar links...');
        const menuLinkHref = await page.$eval('nav a[href="/menu"]', el => el.href).catch(() => null);
        const adminLinkHref = await page.$eval('nav a[href="/admin"]', el => el.href).catch(() => null);
        console.log('Menu link:', menuLinkHref);
        console.log('Admin link:', adminLinkHref);
        
        console.log('Navigating to Menu...');
        await Promise.all([
            page.waitForNavigation({waitUntil: 'networkidle0'}),
            page.click('nav a[href="/menu"]')
        ]);
        console.log('Successfully navigated to Menu page. URL:', page.url());
        await page.screenshot({path: 'menu_page_screenshot.png', fullPage: true});
        
        console.log('Navigating back to Home...');
        await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
        
        console.log('Navigating to Admin Login...');
        await Promise.all([
            page.waitForNavigation({waitUntil: 'networkidle0'}),
            page.click('nav a[href="/admin"]')
        ]);
        console.log('Successfully navigated to Admin page. URL:', page.url());
        await page.screenshot({path: 'admin_page_screenshot.png', fullPage: true});
        
        await browser.close();
        console.log('All menu interactions are fully functional!');
    } catch (err) {
        console.error('Error during testing:', err);
        process.exit(1);
    }
})();
