const nodemailer = require("nodemailer");
let fromMail = 'noreply@meetingsApp.com';
let toMail = "dhruvkhann38@gmail.com";
let subject = "Verify Email";
let text = `Verify your account by clicking on the following link`;

const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "dhruvk.me.16@nsit.net.in" ,
            pass: 
        }
        });
let mailOptions = {
            from: fromMail,
            to: toMail,
            subject: subject,
            text: text
            };

transporter.sendMail(mailOptions);