const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({ to, message }) => {
  try {
    // Twilio needs number in E.164 format: +919876543210
    const formattedNumber = to.startsWith('+') ? to : `+91${to}`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   formattedNumber,
    });

    console.log(`SMS sent to ${formattedNumber}`);
    return true;
  } catch (err) {
    console.error('SMS error:', err.message);
    return false;  // don't crash if SMS fails — it's not critical
  }
};

module.exports = sendSMS;