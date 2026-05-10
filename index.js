/**
 * Simple middleware to sanitize request bodies
 */
const sanitize = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS prevention: remove <script> tags and similar
        req.body[key] = req.body[key]
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/[<>]/g, ""); // Remove angle brackets
      }
    }
  }
  next();
};

module.exports = sanitize;
