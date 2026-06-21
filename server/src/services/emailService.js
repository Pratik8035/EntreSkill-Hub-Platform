const nodemailer = require('nodemailer');

/**
 * Sends an email notification. Fallbacks to console printout if SMTP is unconfigured.
 * @param {object} options - { to, subject, text, html }
 */
const sendEmail = async (options) => {
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'no-reply@entreskillhub.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent email to ${options.to}`);
  } else {
    // Falls back to logging for development, staging, or testing ease
    console.log('\n================== EMAIL OUTBOX (FALLBACK) ==================');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text:    ${options.text}`);
    if (options.html) {
      console.log(`HTML:    ${options.html}`);
    }
    console.log('=============================================================\n');
  }
};

module.exports = { sendEmail };
