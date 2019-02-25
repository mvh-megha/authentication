/**
 * This file consists of nodemailer configuration and email sending function
 */

const nodeMailer = require('nodemailer');

var email = {
    user: "testing.email.for.hope@gmail.com",
    password: "Test@123"
};

var transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: email.user,
        pass: email.password
    }
});

/**
 * This function send email to the receiver
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} text
 */
module.exports.sendEmail = function (toEmail, subject, text) {
    var mailOptions = {
        from: email.user,
        to: toEmail,
        subject: subject,
        text: text
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            throw error
        } else {
            return true;
        }
    });
}

// module.exports = sendEmail;