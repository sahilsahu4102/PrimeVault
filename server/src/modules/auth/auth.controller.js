import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  // Set refresh token in httpOnly cookie
  setRefreshTokenCookie(res, result.refreshToken);

  ApiResponse.created(res, 'User registered successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  // Set refresh token in httpOnly cookie
  setRefreshTokenCookie(res, result.refreshToken);

  ApiResponse.ok(res, 'Logged in successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refreshToken(refreshToken);

  // Set new refresh token in httpOnly cookie
  setRefreshTokenCookie(res, result.refreshToken);

  ApiResponse.ok(res, 'Token refreshed successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'assetion',
    sameSite: 'strict',
  });

  ApiResponse.ok(res, 'Logged out successfully');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ApiResponse.ok(res, 'Profile retrieved successfully', { user });
});

/**
 * Helper: Set refresh token as httpOnly cookie
 */
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'assetion',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
