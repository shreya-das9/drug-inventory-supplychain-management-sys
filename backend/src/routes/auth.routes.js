const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

const signupValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('role').isIn(['ADMIN','WAREHOUSE','RETAILER','USER']).withMessage('Invalid role specified'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Please provide a valid phone number'),
  body('companyName')
    .if(body('role').isIn(['WAREHOUSE','RETAILER']))
    .notEmpty().withMessage('Company name is required for warehouse and retailer accounts'),
  body('licenseNumber')
    .if(body('role').equals('RETAILER'))
    .notEmpty().withMessage('License number is required for retailer accounts')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/signup', signupValidation, validateRequest, authController.signup);
router.post('/login',  loginValidation,  validateRequest, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
