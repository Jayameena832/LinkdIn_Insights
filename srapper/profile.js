const { default: puppeteer } = require('puppeteer');
const openPage = require('./openPage');

const agents = [
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
];

const fetchName = async (section) => {
  const nameContainer = await section.$('h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words');
  let name = null;
  if (nameContainer) {
    name = await (await nameContainer.getProperty('textContent')).jsonValue();
    name = name.trim();
  }
  return name;
};

const fetchAbout = async (section) => {
  const spans = await section.$$('span.visually-hidden');
  const span = spans[1];
  const about = await (await span.getProperty('innerHTML'))
    .jsonValue()
    .then((d) => d.replaceAll('<!---->', '').trim());
  return about;
};

// const fetchEmail = async (section) => {
//   const contactLink = await section.$('span.pv-text-details__separator > a.link-without-visited-state');
//   const emails=[];
//   if (contactLink) {
//     const linkHref = await (await contactLink.getProperty('href')).jsonValue();
//     if (linkHref) {
//       const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
//       const pages = await browser.pages();
//       const cookies = await pages[0].cookies();

//       const contactPage = await openPage(browser, cookies,linkHref);

//       const emailContainer = await contactPage.$('.pv-contact-info__ci-container > a.pv-contact-info__contact-link');
//       if (emailContainer) {
//         const email = await (await emailContainer.getProperty('textContent')).jsonValue();
//         await contactPage.close();
//         return email.trim();
//       }
//       emails.push(emailContainer)
//       await contactPage.close();
//     }
//   }

//   return emails;
// };



const fetchEducation = async (section) => {
  const lis = await section.$$('ul.pvs-list > li.artdeco-list__item');
  const educations = [];
  let currentYear = new Date().getFullYear();

  for (let i = 0; i < lis.length; i++) {
    const lit = lis[i];

    const spans = await lit.$$('span.visually-hidden');

    if (spans.length >= 3) {
      const collegeSpan = spans[0];
      const college = await collegeSpan.getProperty('textContent').then((prop) => prop.jsonValue());

      const degreeSpan = spans[1];
      const degree = await degreeSpan.getProperty('textContent').then((prop) => prop.jsonValue());

      const yearSpan = spans[2];
      const years = await yearSpan.getProperty('textContent').then((prop) => prop.jsonValue());

      const education = {
        college: college.trim(),
        degree: degree.trim(),
        startYear: years.trim().split(' - ')[0],
        endYear: years.trim().split(' - ')[1],
      };
      

      educations.push(education);
      
    } else if (spans.length === 2) {
      const collegeSpan = spans[0];
      const college = await collegeSpan.getProperty('textContent').then((prop) => prop.jsonValue());

      const degreeSpan = spans[1];
      const degree = await degreeSpan.getProperty('textContent').then((prop) => prop.jsonValue());

      const education = {
        college: college.trim(),
        degree: degree.trim(),
      };

      educations.push(education);
    } else {
      const collegeSpan = spans[0];
      const college = await collegeSpan.getProperty('textContent').then((prop) => prop.jsonValue());

      const education = {
        college: college.trim(),
      };

      educations.push(education);
    }
  }

  return educations;
};


const calculateTotalExperience = (educations) => {
  const currentYear = new Date().getFullYear();

  let totalExperience = 0;

  if (educations.length > 0) {
    const topmostEducation = educations[0];

    if (topmostEducation.endYear) {
      const yearRange = topmostEducation.endYear.split(' ');

      if (yearRange.length === 2) {
        const endYear = parseInt(yearRange[1], 10);

        totalExperience += currentYear-endYear ;

      } else if (yearRange.length === 1) {
        const endYear = parseInt(yearRange[0], 10);

        totalExperience += currentYear-endYear ;
      }
    }
  }

  return totalExperience > 0 ? `${totalExperience} years` : 'No experience';
};



const fetchExperience = async (section) => {
  const experienceList = await section.$$('ul.pvs-list > li.artdeco-list__item');
  const experiences = [];

  for (let i = 0; i < experienceList.length; i++) {
    const li = experienceList[i];

      const spans = await li.$$('span.visually-hidden');
      if(spans.length>=4){
      const Type = spans[0];
      const type = await (await Type.getProperty('innerHTML'))
        .jsonValue()
        .then((d) => d.replaceAll('<!---->', '').trim());
      const Company = spans[1];
      const company = await (await Company.getProperty('innerHTML'))
        .jsonValue()
        .then((d) => d.replaceAll('<!---->', '').trim());
      const yearSpan = spans[2];
      const years = await (await yearSpan.getProperty('innerHTML'))
        .jsonValue()
        .then((d) => d.replaceAll('<!---->', '').trim());
      const Location = spans[3];
      const location = await (await Location.getProperty('innerHTML'))
        .jsonValue()
        .then((d) => d.replaceAll('<!---->', '').trim());

        experiences.push({
        type,
        company,
        years,
        location,
      });
    }
  }

  return experiences;
};

const fetchLocation = async (section) => {
  const div = await section.$('.pv-text-details__left-panel.mt2');
  if (div) {
    const span = await div.$('.text-body-small.inline.t-black--light.break-words');
    if (span) {
      const location = await span.evaluate((element) => element.textContent.trim());
      return location;
    } else {
      throw new Error("Inner span element not found");
    }
  } else {
    throw new Error("Outer div element not found");
  }
};


const fetchVolunteer = async (section) => {
  const volunteerContainer = await section.$('div[tabindex="-1"] > span');
  let volunteers = [];
  if (volunteerContainer) {
    const data = await (
      await volunteerContainer.getProperty('innerHTML')
    ).jsonValue();
    volunteers = data
      .replaceAll('<!---->', '')
      .split('•')
      .map((v) => v.trim());
  }
  return volunteers;
};

const fetchLanguages = async (section) => {
  const languages = [];
  const lis = await section.$$('ul.pvs-list > li');

  for (let i = 0; i < lis.length; i++) {
    const li = lis[i];
    const span = await li.$('span.visually-hidden');
    const data = await (await span.getProperty('innerHTML')).jsonValue();
    languages.push(data.replaceAll('<!---->', ''));
  }

  return languages;
};

const fetchInfo = async (section) => {
  const infoContainer = await section.$('div.text-body-medium.break-words');
  let info = null;
  if (infoContainer) {
    const infoText = await (await infoContainer.getProperty('textContent')).jsonValue();
    info = infoText.trim();
  }
  return info;
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

  const sections = await page.$$('main > section');

  console.log('card', sections.length);

  const profile = {};
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    const name = await fetchName(section);
    if (name) {
      profile.name = name;
    }

    const infoDiv = await section.$('[id=profile-sticky-header-toggle]');
    if (infoDiv) {
      const info = await fetchInfo(section);
      profile.info = info;
    }
    
    const locationDiv = await section.$('[id=profile-sticky-header-toggle]');
    if (locationDiv) {
      const location = await fetchLocation(section);
      profile.location = location;
    }

    const aboutDiv = await section.$('[id=about]');
    if (aboutDiv) {
      const about = await fetchAbout(section);
      profile.about = about;
    }
    
    const experienceDiv = await section.$('[id=experience]');
    if (experienceDiv) {
      const experiences = await fetchExperience(section);
      profile.experiences = experiences;
    }

    const educationDiv = await section.$('[id=education]');
    if (educationDiv) {
      const educations = await fetchEducation(section);
      profile.educations = educations;
      const totalExperience = calculateTotalExperience(educations);
      profile.totalExperience=totalExperience;
    }

    const languagesDiv = await section.$('[id=languages]');
    if (languagesDiv) {
      const interests = await fetchLanguages(section);
      profile.interests = interests;
    }

    const volunteerDiv = await section.$('[id=volunteer_causes]');
    if (volunteerDiv) {
      const volunteers = await fetchVolunteer(section);
      profile.volunteers = volunteers;
    }
  }
  profile.url = url;

//   const email = await fetchEmail(page);
// profile.email = email;


  console.log(profile);
  //browser.close();
};
