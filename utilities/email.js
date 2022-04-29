const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tcssrocks@gmail.com',
        pass: '1a18886587c2'
    }
})

let sendEmail = (receiver, message) => {

    const emailParams = {
        form:'tcssrocks@gmail.com',
        to: receiver,
        subject: 'Confirm your email for some dumb app',
        text: message
    }

    transporter.sendMail(emailParams, function(error, info){
       if(error){
           console.log(error);
       }else{
           console.log("Email sent!");
       }
    });

}

module.exports = { 
    sendEmail
}