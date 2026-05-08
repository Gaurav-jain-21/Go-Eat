const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// base HTML email template — looks professional
const emailTemplate = (title, body) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 30px auto; background: #fff;
                   border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .header { background: #1D9E75; padding: 24px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 22px; }
      .body { padding: 28px 32px; color: #333; line-height: 1.6; }
      .footer { background: #f9f9f9; padding: 16px; text-align: center;
                font-size: 12px; color: #999; border-top: 1px solid #eee; }
      .btn { display: inline-block; background: #1D9E75; color: #fff;
             padding: 12px 28px; border-radius: 6px; text-decoration: none;
             font-weight: bold; margin-top: 16px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>🍔 FoodApp</h1></div>
      <div class="body">
        <h2>${title}</h2>
        ${body}
      </div>
      <div class="footer">© 2024 FoodApp · You're receiving this because you placed an order.</div>
    </div>
  </body>
  </html>
`;

const sendEmail = async ({ to, subject, title, body }) => {
  try {
    await transporter.sendMail({
      from:    `"FoodApp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html:    emailTemplate(title, body),
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

module.exports = sendEmail;