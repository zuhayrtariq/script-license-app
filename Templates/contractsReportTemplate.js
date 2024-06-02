const { convertDateMMMFormat } = require("../helpers/date.helper")
const formatToCurrency = require("../helpers/formatToCurrency.hook")

const contractsReportEmailTemplate = async(data) =>{
  let emailHTML = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

<head>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
  <style>
  td {
      min-height: 200px;
  }
  </style>
</head>

<body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="border:1px solid #eee;border-radius:10px;box-shadow:0 5px 10px rgba(20,50,70,.2);margin-top:20px;width:90%;min-width:800px;margin:0 auto;padding:30px 15px;background-color:rgb(250,249,246)">
    <tbody>
      <tr style="width:100%">
        <td><img alt="Prime Logo" src="https://piogcl.com/site2/wp-content/uploads/2023/11/prime-main-logo.png" style="display:block;outline:none;border:none;text-decoration:none;margin-top:0px;margin-bottom:0px;margin-left:auto;margin-right:auto" height="60" />
          <p style="font-size:14px;line-height:24px;margin:16px 0">Dear Team,</p>
          <p style="font-size:14px;line-height:24px;margin:16px 0">The Contracts below have either expired or are expiring with-in ${process.env.Contract_Expiry_Limit_Months} months. You are requested to kindly raise requisition against the contracts. If the requisition is raised, kindly provide the updated status against the on-going requisitions.</p>
          <table align="center" width="100%" class="" border="0" cellPadding="0" cellSpacing="0" role="presentation">
            <tbody>
              <tr>
                <td>
                  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" >
                    <tbody style="width:100%">
                      <tr  style="background-color:rgb(54,153,70);text-align:center;color:rgb(255,255,255);font-weight:700;border-radius:5em;overflow:hidden;fontSize:16px;border: 5px solid black;">
                      
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;width:40px;font-size: 15px;padding-top:0.5em;padding-bottom:0.5em;">#</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;width:80px;font-size: 15px;">Section</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;font-size: 15px;min-width:120px;">Contract No.</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;font-size: 15px;">Title</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;font-size: 15px;">Vendor Name</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;font-size: 15px;">End Date</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;font-size: 15px;min-width:120px;">Requisition No.</td>
                        <td style="letter-spacing: 0.5px;font-family:Arial,sans-serif;font-size: 15px;">Remaining</td>
                     
              </tr>
           
  `

  for(let i = 0 ; i< data.length; i++)
    {
        if(i%2 == 0)
            {
                emailHTML +=  `
                <tr style="text-align:center;border-radius:0.25em;padding-top:0.25em;padding-bottom:0.25em;background-color:rgb(249,250,251);padding-top:2em;padding-bottom:2em;">
               
               `
            }
            else{
                emailHTML +=  ` 
                <tr style="text-align:center;border-radius:0.25em;padding-top:0.25em;padding-bottom:0.25em;background-color:rgb(243,244,246)">
             
               `
            }
            emailHTML+= `

           
              <td style="padding-top:1em;padding-bottom:1em;" >${i+1}</td>
              <td >${data[i].sectionCode}</td>
              <td >${data[i].contractNo}</td>
              <td >${data[i].title}</td>
              <td >${data[i].vendorName}</td>
              <td style="width:120px;color:rgb(239,68,68);font-weight:700">${convertDateMMMFormat(data[i].endDate,'YYYY-MM-DD') }</td>
              <td>${data[i].reqNo || 'Not Raised'}</td>
              <td >${formatToCurrency(data[i].contractOpenValue,data[i].contractCurrency)} </td>
            </tr>
   
`
    }

    emailHTML += `
    </tbody>
        </table>
    <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#e6ebf1;margin-top:40px" />
    <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center;font-weight:700">Your timely response is highly appreciated.</p>
    <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">Contact<!-- --> <a href="mailto:zuhayr.tariq@prime-pakistan.com" style="color:#444;text-decoration:underline" target="_blank">here</a> <!-- -->, If you have any queries</p>
    </td>
    </tr>
    </tbody>
    </table>
    <p style="font-size:1.125em;line-height:1.75em;margin:0;letter-spacing:0;border-radius:20px;margin-top:20px;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;text-align:center;text-transform:uppercase;margin-left:auto;margin-right:auto;font-weight:700"><a href="http://localhost:3000/preview/contractsMonthly?view=desktop" class=" shadow-black" style="border-radius:10px;color:rgb(255,255,255);text-decoration-line:none;background-color:rgb(140,198,63);padding-left:1em;padding-right:1em;padding-top:0.5em;padding-bottom:0.5em;box-shadow:0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0,0,0,0.1), 0 4px 6px -4px rgb(0,0,0,0.1)">View Dashboard</a></p>
  </body>

</html>`
    return emailHTML;
}

module.exports = contractsReportEmailTemplate;