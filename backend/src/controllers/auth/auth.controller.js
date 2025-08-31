const User = require('../../models/UserModel');
const jwt = require('jsonwebtoken');
const logger = require('../../config/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  return { accessToken, refreshToken };
};

const signup = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, role,
      phone, address, companyName, licenseNumber
    } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Role-specific requirements
    if ((role === 'WAREHOUSE' || role === 'RETAILER') && !companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required for warehouse and retailer accounts' });
    }
    if (role === 'RETAILER' && !licenseNumber) {
      return res.status(400).json({ success: false, message: 'License number is required for retailer accounts' });
    }

    const user = await User.create({
      firstName, lastName, email, password, role: role || 'USER',
      phone, address, companyName, licenseNumber
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.lastLogin = new Date();
    await user.save();

    logger.info(`New user registered: ${email} (${user.role})`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: user.toJSON(), accessToken, refreshToken }
    });
  } catch (err) {
    logger.error('Signup error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email} (${user.role})`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), accessToken, refreshToken }
    });
  } catch (err) {
    logger.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token is required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const tokens = generateTokens(user._id);
    return res.status(200).json({ success: true, message: 'Tokens refreshed', data: tokens });
  } catch (err) {
    logger.error('Refresh token error:', err);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

const logout = async (_req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: { user: user.toJSON() } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { signup, login, refreshToken, logout, getProfile };
