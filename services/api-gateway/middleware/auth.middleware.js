const jwt = require('jsonwebtoken');
const PUBLIC_ROUTES = [
  { path: '/api/auth/register',        method: 'POST' },
  { path: '/api/auth/login',           method: 'POST' },
  { path: '/api/auth/verify-email',    method: 'GET'  },
  { path: '/api/auth/forgot-password', method: 'POST' },
  { path: '/api/auth/reset-password',  method: 'POST' },
  { path: '/api/hotels',               method: 'GET'  },
  { path: '/api/foods',                method: 'GET'  },
  { path: '/api/location/nearby',      method: 'GET'  },
  { path: '/api/ai/chat',              method: 'POST' },
  { path: '/api/ai/health',            method: 'GET'  },
];
const isPublicRoute = (req) => {
  return PUBLIC_ROUTES.some(route =>
    req.path.startsWith(route.path) &&
    (route.method === req.method || route.method === 'ALL')
  );
};

const verifyToken = (req, res, next) => {
  if (isPublicRoute(req)) return next();
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Access denied. No token provided.'
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.headers['x-user-id']   = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (err) {
    return res.status(403).json({
      message: 'Invalid or expired token'
    });
  }
};

module.exports = verifyToken;