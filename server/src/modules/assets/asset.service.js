import { PrismaClient } from '@prisma/client';
import ApiError from '../../utils/ApiError.js';
import logger from '../../config/logger.js';

const prisma = new PrismaClient();

class AssetService {
  /**
   * Create a new asset
   */
  async createAsset(data, userId) {
    const asset = await prisma.asset.create({
      data: { ...data, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.info(`Asset created: ${asset.name} by user ${userId}`);
    return asset;
  }

  /**
   * Get all assets with pagination, search, filter, sort
   */
  async getAllCryptoAssets({ page = 1, limit = 10, search = '', category = '', sortBy = 'createdAt', order = 'desc', isActive = '' }) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== '' && isActive !== undefined) {
      where.isActive = isActive;
    }

    // Build orderBy
    const orderBy = { [sortBy]: order };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!asset) {
      throw ApiError.notFound('Asset not found');
    }

    return asset;
  }

  /**
   * Update asset (owner or admin only)
   */
  async updateAsset(id, data, userId, userRole) {
    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw ApiError.notFound('Asset not found');
    }

    // Check ownership (unless admin)
    if (asset.userId !== userId && userRole !== 'ADMIN') {
      throw ApiError.forbidden('You can only update your own assets');
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.info(`Asset updated: ${updatedAsset.name} by user ${userId}`);
    return updatedAsset;
  }

  /**
   * Delete asset (owner or admin only)
   */
  async deleteAsset(id, userId, userRole) {
    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw ApiError.notFound('Asset not found');
    }

    // Check ownership (unless admin)
    if (asset.userId !== userId && userRole !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own assets');
    }

    await prisma.asset.delete({ where: { id } });
    logger.info(`Asset deleted: ${asset.name} by user ${userId}`);
  }

  /**
   * Get distinct categories
   */
  async getCategories() {
    const categories = await prisma.asset.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => c.category);
  }
}

export default new AssetService();
