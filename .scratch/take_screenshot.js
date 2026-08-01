const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // 1. Visit Route Page
  console.log('Navigating to route page...');
  await page.goto('http://localhost:3030/twa/heartbeat-express-1-2h', { waitUntil: 'networkidle' });
  const screenshotPath1 = path.join(__dirname, 'route_page_390x844.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log('Saved screenshot 1 to:', screenshotPath1);

  // 2. Click Map Launcher button to open MapProviderBottomSheet
  console.log('Opening MapProviderBottomSheet...');
  const mapBtn = page.locator('button[aria-label="Open Map Launcher"]').first();
  if (await mapBtn.isVisible()) {
    await mapBtn.click();
    await page.waitForTimeout(500);
    const screenshotPath2 = path.join(__dirname, 'map_bottom_sheet_390x844.png');
    await page.screenshot({ path: screenshotPath2 });
    console.log('Saved screenshot 2 to:', screenshotPath2);
  } else {
    console.log('Map button not visible!');
  }

  await browser.close();
})();
