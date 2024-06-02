
const {getSectionDetails, getContractsExpiring, getCoffsExpiring } = require("../query");
const sendMail = require("../sendMail");
const coffDailyEmailTemplate = require("../Templates/coffDailyEmailTemplate");
const coffReportTemplate = require("../Templates/coffReportTemplate");
const contractsDailyEmailTemplate = require("../Templates/contractsDailyEmailTemplate");
const contractsReportEmailTemplate = require("../Templates/contractsReportTemplate");

const coffEmailReport = async() =>{
    const data = await getCoffsExpiring();
   
    if(!data.length )
    { 
      console.log("No Call-off Expiring") 
      return 0;}
    const sectionData = await getSectionDetails();
    const sendEmailTo =  sectionData.filter(x =>{
        if(data.some(y=>y.sectionCode == x.sectionCode))
            {
               return x.sectionHeadEmail
            }
      
    })
    // console.log(sendEmailTo)
    const toEmail = sendEmailTo.map(x=>x.sectionHeadEmail)
    console.log(toEmail)
  
    const emailHTML = await coffReportTemplate(data);
    const subject = 'ICT Call-offs Expiry Report'
    sendMail(subject,emailHTML, toEmail)
}

const coffDailyEmail = async() =>{
  const sectionData = await getSectionDetails();

  for(let i = 0 ; i < sectionData.length; i++)
  {
    const data = await getCoffsExpiring(sectionData[i].sectionCode);
    if(data.length)
    { 
      console.log(data)
      const emailHTML = await  coffDailyEmailTemplate(data,sectionData[i].sectionHead);
      const subject = `${sectionData[i].sectionCode} - Call-offs Expiring Soon`
      sendMail(subject,emailHTML, sectionData[i].sectionHeadEmail)
    
    }
    else{
      console.log("Call-offs Not Expiring for Section : ",sectionData[i].sectionCode)
    }

  } 
}

module.exports = {
    coffEmailReport,
    coffDailyEmail
  }