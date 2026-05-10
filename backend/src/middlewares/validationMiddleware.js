const { ValidationError } = require('../utils/errors');

/**
 * Middleware factory that validates req.body against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Validation failed', messages));
    }
    next(err);
  }
};

/**
 * Validates query string params against a Zod schema.
 */
const validateQuery = (schema) => async (req, res, next) => {
  try {
    req.query = await schema.parseAsync(req.query);
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Query validation failed', messages));
    }
    next(err);
  }
};

module.exports = { validate, validateQuery };
