import userService from './user.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/v1/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const result = await userService.getAllUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
  });

  ApiResponse.ok(res, 'Users retrieved successfully', result);
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  ApiResponse.ok(res, 'User retrieved successfully', { user });
});

/**
 * @desc    Update user role
 * @route   PATCH /api/v1/users/:id/role
 * @access  Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await userService.updateUserRole(req.params.id, role);
  ApiResponse.ok(res, 'User role updated successfully', { user });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  ApiResponse.ok(res, 'User deleted successfully');
});
