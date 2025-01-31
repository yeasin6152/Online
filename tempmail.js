const puppeteer = require('puppeteer');
const path = require('path');

// সেশন সেভ করার পাথ
const USER_DATA_DIR = path.join(__dirname, 'user_data');
let browserInstance = null;
let pageInstance = null;

// ব্রাউজার ইনিশিয়ালাইজেশন (সহজে সেশন রিস্টোর)
const initializeBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ],
      userDataDir: USER_DATA_DIR // একই সেশন রিস্টোর
    });
  }
  return browserInstance;
};

// পেজ ইনিশিয়ালাইজেশন (একই ট্যাব রিইউজ)
const initializePage = async () => {
  if (!pageInstance) {
    const browser = await initializeBrowser();
    pageInstance = await browser.newPage();
    await pageInstance.goto('https://tempmail.io/', { waitUntil: 'networkidle2' });
    await pageInstance.waitForSelector('.message__email-text', { timeout: 60000 });
  }
  return pageInstance;
};

// ইমেইল ভ্যালু পাওয়ার ফাংশন
const getEmailValue = async () => {
  const page = await initializePage();
  const emailValue = await page.$eval('.message__email-text', input => input.value);
  console.log('Email Value:', emailValue);
  return emailValue;
};

// Change বাটন ক্লিক
const changeEmail = async () => {
  const page = await initializePage();
  await page.click('.message__toggle--change');
  console.log('Change button clicked');
};

// Refresh বাটন ক্লিক
const refreshEmails = async () => {
  const page = await initializePage();
  await page.click('.message__toggle--refresh');
  console.log('Refresh button clicked');
};

// Delete বাটন ক্লিক
const deleteEmail = async () => {
  const page = await initializePage();
  await page.click('.message__toggle--delete');
  console.log('Delete button clicked');
};

// মোট ইমেইল সংখ্যা
const getTotalEmailCount = async () => {
  const page = await initializePage();
  const totalEmails = await page.$eval('#messages_count', div => div.getAttribute('data-count'));
  console.log('Total Emails:', totalEmails);
  return parseInt(totalEmails, 10);
};



const openMessageLinkByIndex = async (index) => {
  const page = await initializePage();
  // সমস্ত লিংক সংগ্রহ করুন
  const links = await page.$$eval('.message__link', links => 
    links.map(link => {
      const href = link.getAttribute('href');
      // যদি href null বা undefined হয়, তাহলে একটি ডিফল্ট ভ্যালু রিটার্ন করুন
      return href ? (href.startsWith('http') ? href : `https://tempmail.io${href}`) : null;
    }).filter(href => href !== null) // শুধু ভ্যালিড লিংক রাখুন
  );

  // যদি কোনো লিংক না থাকে
  if (links.length === 0) {
    throw new Error('No emails found in the list!');
  }

  // ইনডেক্স ভ্যালিডেশন
  if (index < 1 || index > links.length) {
    throw new Error(`Invalid index! Available emails: ${links.length}`);
  }

  // নতুন ট্যাবে লিংক ওপেন করুন
  const newPage = await browserInstance.newPage();
  await newPage.goto(links[index - 1], { waitUntil: 'networkidle2' });

  // মেসেজ টেক্সট এক্সট্রাক্ট করুন
  await newPage.waitForSelector('.message-text', { timeout: 60000 });
  const messageText = await newPage.$eval('.message-text', el => el.innerText.trim());

  // নতুন ট্যাব বন্ধ করুন
  await newPage.close();

  return messageText;
};



// ব্রাউজার বন্ধ করার অপশন
const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    pageInstance = null;
  }
};

// মেইন ফাংশন (টেস্টিং এর জন্য)
const main = async () => {
  try {
    const page = await initializePage();
    console.log(await getEmailValue());
    console.log(await getTotalEmailCount());
    // await changeEmail(); // ইমেইল চেঞ্জ করতে চাইলে আনকমেন্ট করুন
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await closeBrowser(); // ব্রাউজার বন্ধ করতে চাইলে আনকমেন্ট করুন
  }
};

// এক্সপোর্ট
module.exports = {
  getEmailValue,
  changeEmail,
  refreshEmails,
  deleteEmail,
  getTotalEmailCount,
  openMessageLinkByIndex,
  closeBrowser,
  main
};

// সরাসরি রান করলে মেইন ফাংশন কল হবে
if (require.main === module) {
  main();
}