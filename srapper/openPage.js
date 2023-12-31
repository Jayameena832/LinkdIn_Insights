const agents = [
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
];

module.exports = async (browser, cookies, url) => {
  const page = await browser.newPage();

  if (cookies) {
    await page.setCookie(...cookies);
  }
  await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)]);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
  });
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.goto(url);

  return page;
};

