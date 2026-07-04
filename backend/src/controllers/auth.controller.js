const asyncHandler = require('../middlewares/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  const { user, accessToken, refreshToken } = await authService.register({ name, email, password, college, role });
  res.status(201).json({ success: true, accessToken, refreshToken, user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const { user, accessToken, refreshToken } = await authService.login({ email, password });
  res.status(200).json({ success: true, accessToken, refreshToken, user });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  res.status(200).json({ success: true, ...tokens });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = { register, login, refresh, logout, getMe };