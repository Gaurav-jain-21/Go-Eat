const paypal = require('@paypal/checkout-server-sdk');

const environment = () => {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // use SandboxEnvironment for testing, LiveEnvironment for production
  return process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => new paypal.core.PayPalHttpClient(environment());

module.exports = { client, paypal };