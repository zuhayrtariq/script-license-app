const fs = require('fs');
cron = require('node-cron');
const { readExcelFile } = require('./readExcelFile');
const { contractEmailReport, contractDailyEmail } = require('./EmailFunctions/contracts.emailfunction');
const sendMail = require('./sendMail');
const { coffDailyEmail, coffEmailReport } = require('./EmailFunctions/coff.emailfunction');
const { sesEmailReport, sesDailyEmail } = require('./EmailFunctions/ses.emailfunction');
let fileWatch = false;
require('dotenv').config({ path: `./${process.env.NODE_ENV}.env` });
const WatchFileChange = (filePath) =>
  fs.watch(`${filePath}`, (eventType, fileName) => {
    if (fileWatch) return;
    fileWatch = true;

    setTimeout(async () => {
      fileWatch = false;
      await readExcelFile(fileName);
    }, 100);
    if (eventType == 'change') {
      console.log(
        'The file ',
        fileName,
        ' was modified at ',
        new Date().toLocaleString(),
      );
    }
  });

console.log('Script File Running : ' + process.env.NODE_ENV);
console.log('Email Alerts : ' + process.env.emailAlerts);

try {
  WatchFileChange('./data/ses.XLS');
  WatchFileChange('./data/contracts.XLS');
  WatchFileChange('./data/coffs.XLS');
} catch (e) {
  console.log('Error in Watch File Change', e.message);
}

if (process.env.emailAlerts == 'on') {
  cron.schedule(process.env.contractEmailCronJob, () => {
    console.log('Contract Monthly Report : ');
    contractEmailReport();
   
  });
  cron.schedule(process.env.coffEmailCronJob, () => {
    console.log('Call-off Weekly Report : ');
    coffEmailReport()
  });
  cron.schedule(process.env.sesEmailCronJob, () => {
    console.log('SES Weekly Report : ');
    sesEmailReport()
  });
  cron.schedule(process.env.requisitionEmailCronJob, () => {
    console.log('Requisition Monthly Report : ');
  });

  cron.schedule(process.env.dailyCronJob, () => {
    console.log("Daily Expiry Report : ")
    contractDailyEmail();
    coffDailyEmail();
   
  })
}
sesDailyEmail()
