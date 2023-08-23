//This is the updated code to get all the cookies and for persisting login

const openPage = require('./openPage');
const fs = require('fs');

module.exports = async (browser, email, password) => {
  console.log('Login');
  const loginUrl = 'https://www.linkedin.com/login';
  
  // Check if cookies file exists
  const cookiesFilePath = './linkedin-cookies.json';
  const cookiesExist = fs.existsSync(cookiesFilePath);
  
  let page;
  
  if (cookiesExist) {
    // If cookies file exists, load the cookies and reuse the page
    const cookies = JSON.parse(fs.readFileSync(cookiesFilePath));
    page = await openPage(browser, cookies, loginUrl);
    console.log('Logged in with existing cookies');
  } else {
    // If cookies file doesn't exist, perform login and save the cookies
    page = await openPage(browser, undefined, loginUrl);
    console.log('Logging in...');
    console.log('login', `logging at: ${loginUrl}`);

    await page.goto(loginUrl);
    await page.waitForSelector('#username');

    await page.$('#username').then((emailElement) => emailElement.type(email));
    await page
      .$('#password')
      .then((passwordElement) => passwordElement.type(password));

    await page
      .$x("//button[contains(text(), 'Sign in')]")
      .then((button) => button[0].click());

    try {
      await page.waitForSelector('input[role=combobox]', { timeout: 15000 });
      console.log('login', 'logged feed page selector found');
    } catch (error) {
      console.log('login', 'successful login element was not found');
      const emailError = await page.evaluate(() => {
        const e = document.querySelector('div[error-for=username]');
        if (!e) {
          return false;
        }
        const style = window.getComputedStyle(e);
        return (
          style &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        );
      });

      const passwordError = await page.evaluate(() => {
        const e = document.querySelector('div[error-for=password]');
        if (!e) {
          return false;
        }
        const style = window.getComputedStyle(e);
        return (
          style &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        );
      });

      const manualChallengeRequested = await page.evaluate(() => {
        const e = document.querySelector('.flow-challenge-content');
        if (!e) {
          return false;
        }
        const style = window.getComputedStyle(e);
        return (
          style &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        );
      });

      if (emailError) {
        console.log('login', 'wrong username element found');
        throw new Error(`linkedin: invalid username: ${email}`);
      }

      if (passwordError) {
        console.log('login', 'wrong password element found');
        throw new Error('linkedin: invalid password');
      }

      if (manualChallengeRequested) {
        console.log('login', 'manual check was required');
        throw new Error(
          'linkedin: manual check was required, verify if your login is properly working manually or report this issue: https://github.com/leonardiwagner/scrapedin/issues'
        );
      }

      console.log('login', 'could not find any element to retrieve a proper error');
      throw newError('login is not working, please report: https://github.com/leonardiwagner/scrapedin/issues');
    }
    
    // Save the cookies to a file
    const cookies = await page.cookies();
    fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies));
    console.log('Login successful. Cookies saved.');
  }
  
  return page;
};


