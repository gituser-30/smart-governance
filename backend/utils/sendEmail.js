// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   // If no SMTP details are strictly provided, setup Ethereal for Dev testing
//   let transporter;

//   if (process.env.SMTP_USER === 'test_user_will_be_generated') {
//     // Generate test SMTP service account from ethereal.email
//     const testAccount = await nodemailer.createTestAccount();
//     transporter = nodemailer.createTransport({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: testAccount.user, // generated ethereal user
//         pass: testAccount.pass, // generated ethereal password
//       },
//     });
//   } else {
//     // Production SMTP
//     transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       secure: process.env.SMTP_PORT === '465',
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });
//   }

//   const message = {
//     from: `${process.env.FROM_NAME || 'Smart Governance Alerts'} <${process.env.FROM_EMAIL || 'noreply@smartgovernance.local'}>`,
//     to: options.email,
//     subject: options.subject,
//     html: options.html,
//   };

//   const info = await transporter.sendMail(message);

//   if (process.env.SMTP_USER === 'test_user_will_be_generated') {
//     console.log('Message sent: %s', info.messageId);
//     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//   }
// };

// module.exports = sendEmail;

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail / SMTP user
    pass: process.env.EMAIL_PASS,   // App Password (not your real password)
  },
});

/**
 * Send a plain-text or HTML email.
 * @param {Object} options
 * @param {string} options.to        - Recipient address
 * @param {string} options.subject   - Email subject
 * @param {string} options.html      - HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"CertifyGov Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to} — MessageId: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;