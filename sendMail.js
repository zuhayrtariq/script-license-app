const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure : true,
    auth: {
      user: "zuhayrtariq4@gmail.com",
      pass: "gzaa xkhk wint toym"
    }
  });

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(subject,emailHTML,sendMailTo) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'test@gmail.com', // sender address
    to: "zuhayr.tariq@prime-pakistan.com", // list of receivers
    subject: subject + sendMailTo, // Subject line
   
    html:emailHTML, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

module.exports = sendMail;