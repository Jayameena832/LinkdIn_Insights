const { default: puppeteer } = require('puppeteer');
const openPage = require('./srapper/openPage');
const login = require('./srapper/login');
const profile = require('./srapper/profile');
const CONFIG = require('./config/config.json');

const delay = (min, max) => {
  const delayTime = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delayTime));
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

async function scrapePeople() {
  const links = [];
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  await login(browser, CONFIG.credentials.email, CONFIG.credentials.password);

  const pages = await browser.pages();
  const cookies = await pages[0].cookies();

  const searchUrl='';

  const page = await openPage(browser, cookies, searchUrl);

  while (true) {
    await page
    .waitForSelector('ul.reusable-search__entity-result-list li.reusable-search__result-container a.app-aware-link', { timeout: 10000 })
    .catch(() => {
      console.log('profile', 'profile selector was not found');
    }); //it is to wait for all the profiles in the next page to get the data for all the profiles if not used then we will get 4-5 profiles only
    
    const currentLinks = await page.$$eval('ul.reusable-search__entity-result-list li.reusable-search__result-container a.app-aware-link', async (elements) => {
      const uniqueLinks = new Set();
    
      for (const element of elements) {
        const url = new URL(element.href);
        const pathname = url.pathname;
        const profileName = pathname.split('/').pop();
    
        if (profileName && !profileName.startsWith('ACoAA')) {
          url.search = '';
          const link = url.toString();
          uniqueLinks.add(link);
        }
      }
    
      return Array.from(uniqueLinks);
    });// this will get all the links in current page and will contain all unique links also removed links not starting with name
  
  
    const shuffledLinks = shuffleArray(currentLinks);

    for (const link of shuffledLinks) {
      await profile(browser, link);
      await delay(5000, 10000); // Delay between each profile scraping request (random delay between 2 to 5 seconds)
      
    }  
    
  links.push(...currentLinks);
   
    
    await page
    .waitForSelector('.artdeco-pagination__button--next', { timeout: 10000 })
    .catch(() => {
      console.log('profile', 'profile selector was not found');
    });// wait for not having navigation timeout

    const nextPageButton = await page.$('.artdeco-pagination__button--next');
if (nextPageButton) {
  const currentUrl = page.url(); 
  console.log('Current URL:', currentUrl);
  
  await Promise.all([
    page.waitForNavigation({ timeout: 10000 }), 
    nextPageButton.click(),
    delay(3000, 5000),
  ]);// moving to the next page and working on it

  const newUrl = page.url();
  console.log('New URL:', newUrl);

} else {
  break;
}
  
}

  console.log(links);
  await browser.close();
}
scrapePeople();