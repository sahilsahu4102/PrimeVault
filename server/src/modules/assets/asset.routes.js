import { Router } from 'express';
import {
  createAsset,
  getAllCrypto Assets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getCategories,
} from './asset.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createAssetSchema,
  updateAssetSchema,
  assetQuerySchema,
} from './asset.validation.js';

const router = Router();

// All asset routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/v1/assets/categories:
 *   get:
 *     tags: [Crypto Assets]
 *     summary: Get all asset categories
 *     description: Returns a list of distinct asset categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/categories', getCategories);

/**
 * @openapi
 * /api/v1/assets:
 *   get:
 *     tags: [Crypto Assets]
 *     summary: Get all assets
 *     description: Returns paginated assets with optional search, category filter, and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, stock, category]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Crypto Assets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     assets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Asset'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', validate({ query: assetQuerySchema }), getAllCrypto Assets);

/**
 * @openapi
 * /api/v1/assets:
 *   post:
 *     tags: [Crypto Assets]
 *     summary: Create a new asset
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Widget
 *               description:
 *                 type: string
 *                 example: A high-quality widget for all your needs
 *               price:
 *                 type: number
 *                 example: 29.99
 *               category:
 *                 type: string
 *                 example: Electronics
 *               stock:
 *                 type: integer
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate({ body: createAssetSchema }), createAsset);

/**
 * @openapi
 * /api/v1/assets/{id}:
 *   get:
 *     tags: [Crypto Assets]
 *     summary: Get asset by ID
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
 *         description: Asset retrieved successfully
 *       404:
 *         description: Asset not found
 */
router.get('/:id', getAssetById);

/**
 * @openapi
 * /api/v1/assets/{id}:
 *   put:
 *     tags: [Crypto Assets]
 *     summary: Update asset (Owner or Admin)
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       403:
 *         description: Not owner or admin
 *       404:
 *         description: Asset not found
 */
router.put('/:id', validate({ body: updateAssetSchema }), updateAsset);

/**
 * @openapi
 * /api/v1/assets/{id}:
 *   delete:
 *     tags: [Crypto Assets]
 *     summary: Delete asset (Owner or Admin)
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
 *         description: Asset deleted successfully
 *       403:
 *         description: Not owner or admin
 *       404:
 *         description: Asset not found
 */
router.delete('/:id', deleteAsset);

export default router;
