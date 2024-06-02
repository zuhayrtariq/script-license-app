
const {getSectionDetails, getContractsExpiring, getCoffsExpiring, getSESExpiring } = require("../query");
const sendMail = require("../sendMail");
const coffDailyEmailTemplate = require("../Templates/coffDailyEmailTemplate");
const sesEmailTemplate = require("../Templates/sesEmailTemplate");

const sesEmailReport = async() =>{
    const data = await getSESExpiring(1);
   
    if(!data.length )
    { 
      console.log("No SES Expiring : SES Report") 
      return 0;}
    
  
  
    const emailHTML = await sesEmailTemplate(data);
    const subject = 'ICT SES Expiry Report'
    sendMail(subject,emailHTML,'zuhayr.tariq@prime-pakistan.com')
}

const sesDailyEmail = async() =>{
  const data = await getSESExpiring(2);
   
  if(!data.length )
  { 
    console.log("No SES Expiring") 
    return 0;}
  


  const emailHTML = await sesEmailTemplate(data);
  const subject = 'ICT SES Expiry Report'
  sendMail(subject,emailHTML,'zuhayr.tariq@prime-pakistan.com')
}

module.exports = {
    sesEmailReport,
    sesDailyEmail
  }