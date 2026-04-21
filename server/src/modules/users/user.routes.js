import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUser } from './user.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { updateRoleSchema, userQuerySchema } from './user.validation.js';

const router = Router();

// All user routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     description: Returns paginated list of users with optional search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Admin only)
 */
router.get('/', validate({ query: userQuerySchema }), getAllUsers);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);

/**
 * @openapi
 * /api/v1/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', validate({ body: updateRoleSchema }), updateUserRole);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', deleteUser);

export default router;
