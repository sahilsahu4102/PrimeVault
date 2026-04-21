import assetService from './asset.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Create a new asset
 * @route   POST /api/v1/assets
 * @access  Private (Auth)
 */
export const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body, req.user.id);
  ApiResponse.created(res, 'Asset created successfully', { asset });
});

/**
 * @desc    Get all assets (paginated, filterable, sortable)
 * @route   GET /api/v1/assets
 * @access  Private (Auth)
 */
export const getAllCrypto Assets = asyncHandler(async (req, res) => {
  const { page, limit, search, category, sortBy, order, isActive } = req.query;
  const result = await assetService.getAllCrypto Assets({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search,
    category,
    sortBy,
    order,
    isActive: isActive === '' ? '' : isActive,
  });

  ApiResponse.ok(res, 'Crypto Assets retrieved successfully', result);
});

/**
 * @desc    Get asset by ID
 * @route   GET /api/v1/assets/:id
 * @access  Private (Auth)
 */
export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  ApiResponse.ok(res, 'Asset retrieved successfully', { asset });
});

/**
 * @desc    Update asset
 * @route   PUT /api/v1/assets/:id
 * @access  Private (Owner or Admin)
 */
export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  ApiResponse.ok(res, 'Asset updated successfully', { asset });
});

/**
 * @desc    Delete asset
 * @route   DELETE /api/v1/assets/:id
 * @access  Private (Owner or Admin)
 */
export const deleteAsset = asyncHandler(async (req, res) => {
  await assetService.deleteAsset(req.params.id, req.user.id, req.user.role);
  ApiResponse.ok(res, 'Asset deleted successfully');
});

/**
 * @desc    Get all distinct categories
 * @route   GET /api/v1/assets/categories
 * @access  Private (Auth)
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await assetService.getCategories();
  ApiResponse.ok(res, 'Categories retrieved successfully', { categories });
});
