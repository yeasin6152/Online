const puppeteer = require('puppeteer');

// Launch the browser and open a new page
const initializeBrowser = async () => {
  const browser = await puppeteer.launch({
     headless: true, // Change to false if you want to see the browser
     executablePath: '/usr/bin/chromium', // Path to installed Chromium
     args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
     ]
  });
  const page = await browser.newPage();
  await page.goto('https://tempmail.io/');
  await page.waitForSelector('.message__email-text');
  return { browser, page };
};

// Function to get the email value
const getEmailValue = async (page) => {
  const emailValue = await page.$eval('.message__email-text', input => input.value);
  console.log('Email Value:', emailValue);
  return emailValue;
};

// Function to click the Change button
const changeEmail = async (page) => {
  await page.click('.message__toggle--change');
  console.log('Change button clicked');
};

// Function to click the Refresh button
const refreshEmails = async (page) => {
  await page.click('.message__toggle--refresh');
  console.log('Refresh button clicked');
};

// Function to click the Delete button
const deleteEmail = async (page) => {
  await page.click('.message__toggle--delete');
  console.log('Delete button clicked');
};

// Main function to use the above functions
const main = async () => {
  const { browser, page } = await initializeBrowser();

  // Call functions as needed
  await getEmailValue(page);
  await changeEmail(page);
  await refreshEmails(page);
  await deleteEmail(page);

  // Close the browser
  await browser.close();
};

// Export the functions for external use
module.exports = {
  initializeBrowser,
  getEmailValue,
  changeEmail,
  refreshEmails,
  deleteEmail,
  main,
};

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}