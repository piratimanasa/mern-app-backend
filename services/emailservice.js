const nodemailer = require('nodemailer');

// Create a transporter object with SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,  // e.g., smtp.gmail.com
    port: process.env.SMTP_PORT,  // e.g., 587 for TLS or 465 for SSL
    secure: process.env.SMTP_PORT == 465, // Use secure SSL for port 465, false for TLS on 587
    service:'gmail',
    auth: {
        user: process.env.SMTP_USER, // Your Gmail address or any SMTP service user
        pass: process.env.SMTP_PASS, // App password (not your main Gmail password)
    },
});

// Function to send email
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.SMTP_USER,  // Sender's email address
        to,  // Recipient's email address
        subject,  // Subject of the email
        text,  // Text content of the email
    };

    // Send the email and handle success/error
    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email sent: ' + info.response); // Log the response on success
            return info;
        })
        .catch(err => {
            // Enhanced error logging
            console.error('Error sending email:', err.response || err.message);  // Detailed error log
            if (err.response) {
                console.error('SMTP Error:', err.response);
            }
            throw new Error('Failed to send email');  // Throwing a custom error
        });
};

module.exports = { sendEmail };
