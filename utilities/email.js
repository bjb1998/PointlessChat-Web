const nodemailer = require('nodemailer')

/**
 * TTransporter for the email via nodemailer
 * @param {string} service the service to send from, in this case gmail
 * @param {string} user the email address to send from
 * @param {string} pass the password to log in to the email
 */
const transporter = nodemailer.createTransport({
    host: 'mail.yahoo.com',
    service:'Yahoo',
    secure: false,
    port: 587,
    auth: {
        user: 'tcssrocks59',
        pass: 'vavrweluyqcpewlu'
    },
    debug: false,
    logger: true
})

/**
 * Creates a salted and hashed string of hexadecimal characters. Used to encrypt
 * "safely" store user passwords.
 * @param {string} receiver the person to send the email to
 * @param {string} message the contents of the the email to be sent
 */
let sendEmail = (receiver, message) => {

    const emailParams = {
        from:'tcssrocks59@yahoo.com',
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