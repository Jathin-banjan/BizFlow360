import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './common/errors.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import supplierRoutes from './modules/suppliers/supplier.routes.js';
import purchaseOrderRoutes from './modules/purchase-orders/purchaseOrder.routes.js';
import customerOrderRoutes from './modules/orders/customerOrder.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import requirementRoutes from './modules/requirements/requirement.routes.js';
import exportRoutes from './modules/exports/export.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    status: isDbConnected ? 'UP' : 'DATABASE_DOWN',
    timestamp: new Date().toISOString(),
    service: 'BizFlow 360 API',
    database: {
      status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
      readyState: mongoose.connection.readyState,
    },
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/orders', customerOrderRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/requirements', requirementRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/audit', auditRoutes);

// Unmatched Route Handler
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Resource not found at ${req.originalUrl}`));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
