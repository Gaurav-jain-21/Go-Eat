const rateLimit = require('express-rate-limit');
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max:      100,
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders:   false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max:      10,               
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders:   false,
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,  
  max:      20,         
  message: {
    message: 'Too many AI requests. Please slow down.'
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };