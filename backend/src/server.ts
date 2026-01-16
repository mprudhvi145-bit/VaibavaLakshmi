import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import "reflect-metadata"; 
import { DataSource } from "typeorm";
import { User } from "./models/user";
import { AuditLog } from "./models/audit-log";
import { Order, LineItem } from "./models/order";
import { NotificationLog } from "./models/notification-log";
import { AnalyticsEvent } from "./models/analytics-event";
import productRoutes from './routes/products.route';
import categoryRoutes from './routes/categories.route';
import searchRoutes from './routes/search.route';
import adminRoutes from './routes/admin.route';
import healthRoutes from './routes/health.route';
import authRoutes from './routes/auth.route';
import checkoutRoutes from './routes/checkout.route';
import analyticsRoutes from './routes/analytics.route';
import { AuthService } from './services/auth.service';

// Environment Config
const PORT = process.env.PORT || 9000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Structured Logger
const log = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  if (NODE_ENV === 'production') {
    console.log(JSON.stringify({ timestamp, level, message, ...meta }));
  } else {
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
  }
};

const app = express();

// --- SECURITY & PERFORMANCE MIDDLEWARE ---
app.use(helmet() as any); // Secure HTTP headers
app.use(compression() as any); // Gzip compression
app.use(cors({
  origin: process.env.STORE_CORS ? process.env.STORE_CORS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}) as any);
app.use(express.json({ limit: '10mb' })); // Body parser limit

// Database Connection
const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/medusa_db",
    entities: [User, AuditLog, Order, LineItem, NotificationLog, AnalyticsEvent],
    synchronize: true, // Auto-migration (Disable in strict prod if using migrations)
    logging: false
});

// Dependency Injection Middleware
app.use((req, res, next) => {
    (req as any).scope = {
        resolve: (name: string) => {
            if (name === "manager") return AppDataSource.manager;
            return null;
        }
    };
    next();
});

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log('info', 'request_completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip
    });
  });
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Vaibava Lakshmi Canonical Backend API v1.0');
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  log('error', 'unhandled_error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Startup Logic
AppDataSource.initialize().then(async () => {
    log('info', 'database_connected');
    
    // Seed Owner
    const authService = new AuthService({ manager: AppDataSource.manager });
    await authService.seedInitialUser();

    const server = app.listen(PORT, () => {
        log('info', 'server_started', { port: PORT, env: NODE_ENV });
    });

    // Graceful Shutdown
    const shutdown = async () => {
      log('info', 'shutdown_signal_received');
      server.close(() => {
        AppDataSource.destroy().then(() => {
          log('info', 'server_stopped');
          (process as any).exit(0);
        });
      });
    };

    (process as any).on('SIGTERM', shutdown);
    (process as any).on('SIGINT', shutdown);

}).catch(error => log('error', 'database_connection_failed', { error }));