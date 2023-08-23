const { default: puppeteer } = require('puppeteer');
const openPage = require('./openPage');

const agents = [
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
];

const fetchName = async (section) => {
  const nameContainer = await section.$('h1.jobs-unified-top-card__job-title');
  let name = null;
  if (nameContainer) {
    name = await (await nameContainer.getProperty('textContent')).jsonValue();
    name = name.trim();
  }
  return name;
};

const fetchPrimaryDescription = async (section) => {
  const primaryDescriptionContainer = await section.$('.jobs-unified-top-card__primary-description');
  let primaryDescription = null;
  if (primaryDescriptionContainer) {
    const spanElements = await primaryDescriptionContainer.$$('span:not(span span)');
    primaryDescription = [];

    for (const spanElement of spanElements) {
      const text = await (await spanElement.getProperty('textContent')).jsonValue();
      const trimmedText = text.trim().replace(/\n\s+/g, ' ').trim();
      if (trimmedText !== "") {
        primaryDescription.push(trimmedText);
      }
    }
  }
  return primaryDescription;
};

const fetchInfo = async (section) => {
  const liElements = await section.$$('li.jobs-unified-top-card__job-insight');
  const infoList = [];

//   for (const liElement of liElements) {
//     const spanElement = await liElement.$('span');
//     const text = await (await spanElement.getProperty('textContent')).jsonValue();
//     const trimmedText = text.trim().replace(/\n\s+/g, ' ').trim();
//     if (trimmedText !== "") {
//       infoList.push(trimmedText);
//     }
//   }

for (const liElement of liElements) {
    try {
      const spanElement = await liElement.$('span');
      if (spanElement) {
        const text = await (await spanElement.getProperty('textContent')).jsonValue();
        const trimmedText = text.trim().replace(/\n\s+/g, ' ').trim();
        if (trimmedText !== "") {
          infoList.push(trimmedText);
        }
      }
    } catch (error) {
      // Handle the error, you can log it or perform other actions
      console.error("Error while processing element:", error.message);
    }
  }
  
  return infoList;
};

const fetchSkill = async (section) => {
  const skillElement = await section.$('a.app-aware-link.job-details-how-you-match__skills-item-subtitle');
  if (skillElement) {
    const text = await (await skillElement.getProperty('textContent')).jsonValue();
    const trimmedText = text.trim();
    return trimmedText;
  }
  return null;
  

};

module.exports = async (browser, url) => {
  const loginUrl = 'https://www.linkedin.com/login';
  const page = await openPage(browser, undefined, url);

  const profilePageIndicatorSelector = '.pv-profile-section';

  await page
    .waitForSelector(profilePageIndicatorSelector, { timeout: 5000 })
    .catch(() => {
      console.log('profile', 'profile selector was not found');
    });

  const sections = await page.$$('div > div.p5');

  console.log('card', sections.length);

  const jobprofile = {};
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    const title = await fetchName(section);
    if (title) {
      jobprofile.title=title;
    }

    const primaryDescription = await fetchPrimaryDescription(section);
    if (primaryDescription) {
      jobprofile.primaryDescription = primaryDescription;
    }

    const info = await fetchInfo(section);
    if (info.length > 0) {
      jobprofile.info = info;
    }
    
  }

  const sections1 = await page.$$('div > div.pt5');


  for (let i = 0; i < sections1.length; i++) {
    const section = sections1[i];

    const skills = await fetchSkill(section);
    if (skills) {
      jobprofile.skills = skills.split(',');
    }
  }

  jobprofile.url = url;


  console.log(jobprofile);
  // browser.close();
};
