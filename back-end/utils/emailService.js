const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services or SMTP host details
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: `Mahavir Automation <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Optional HTML content
    };

    // Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error; // Let the caller handle the error
  }
};

module.exports = sendEmail;
