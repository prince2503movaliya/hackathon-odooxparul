const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

const isAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }

  next();
};

module.exports = isAdmin;
