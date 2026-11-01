import { Product, IProduct } from './product.model.js';
import { Category, ICategory } from './category.model.js';
import { InventoryMovement } from '../inventory/inventoryMovement.model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors.js';
import { Types } from 'mongoose';

export class ProductService {
  static async getCategories(): Promise<ICategory[]> {
    return Category.find().sort({ name: 1 });
  }

  static async getProducts(filters: {
    search?: string;
    categoryId?: string;
    status?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: any[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { sku: searchRegex }, { description: searchRegex }];
    }

    if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
      query.categoryId = filters.categoryId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.lowStock === true) {
      query.$expr = { $lte: ['$currentStock', '$reorderThreshold'] };
    }

    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortDirection };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name code')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getProductById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid product ID');
    }

    const product = await Product.findById(id).populate('categoryId', 'name code').lean();
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    return product;
  }

  static async createProduct(
    data: {
      sku: string;
      name: string;
      categoryId: string;
      description?: string;
      unitCost: number;
      unitPrice: number;
      currentStock?: number;
      reorderThreshold?: number;
      leadTimeDays?: number;
    },
    userId?: string,
    userName?: string
  ): Promise<IProduct> {
    const cleanSku = data.sku.toUpperCase().trim();

    const existing = await Product.findOne({ sku: cleanSku });
    if (existing) {
      throw new ConflictError(`Product with SKU '${cleanSku}' already exists.`);
    }

    if (!Types.ObjectId.isValid(data.categoryId)) {
      throw new BadRequestError('Invalid category ID provided');
    }

    const initialStock = data.currentStock || 0;
    const product = await Product.create({
      ...data,
      sku: cleanSku,
      currentStock: initialStock,
      reorderThreshold: data.reorderThreshold ?? 10,
      leadTimeDays: data.leadTimeDays ?? 7,
      status: 'ACTIVE',
    });

    if (initialStock > 0) {
      await InventoryMovement.create({
        productId: product._id,
        movementType: 'RECEIPT',
        quantity: initialStock,
        previousStock: 0,
        newStock: initialStock,
        reason: 'Initial inventory creation',
        referenceType: 'PRODUCT_CREATION',
        referenceId: product.sku,
        performedBy: userId ? new Types.ObjectId(userId) : undefined,
        performedByName: userName || 'Admin',
      });
    }

    return product;
  }

  static async updateProduct(
    id: string,
    updates: Partial<{
      name: string;
      categoryId: string;
      description: string;
      unitCost: number;
      unitPrice: number;
      reorderThreshold: number;
      leadTimeDays: number;
      status: 'ACTIVE' | 'INACTIVE';
    }>
  ): Promise<IProduct> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid product ID');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    Object.assign(product, updates);
    await product.save();
    return product;
  }

  static async setProductStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<IProduct> {
    return this.updateProduct(id, { status });
  }
}
