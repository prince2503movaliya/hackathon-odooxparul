const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const prisma = require('../config/prisma');

/**
 * Authenticates the request by verifying the JWT access token.
 * Attaches the user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePhoto: true,
        languagePreference: true,
      },
    });

    if (!user) return next(new UnauthorizedError('User no longer exists'));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(new UnauthorizedError('Token expired'));
    if (err.name === 'JsonWebTokenError') return next(new UnauthorizedError('Invalid token'));
    next(err);
  }
};

/**
 * Middleware factory to enforce role-based access.
 * @param {...string} roles - allowed roles (e.g., 'ADMIN')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError('Insufficient permissions'));
  }
  next();
};

module.exports = { authenticate, authorize };
