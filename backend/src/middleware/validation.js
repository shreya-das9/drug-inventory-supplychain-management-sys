const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  next();
};

module.exports = { validateRequest };
