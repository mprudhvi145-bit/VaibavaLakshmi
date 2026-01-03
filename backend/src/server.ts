
import express from 'express';
import cors from 'cors';
import "reflect-metadata"; // Required for TypeORM
import { DataSource } from "typeorm";
import { User } from "./models/user";
import { AuditLog } from "./models/audit-log";
import { Order, LineItem } from "./models/order";
import { NotificationLog } from "./models/notification-log";
import { AnalyticsEvent } from "./models/analytics-event"; // New Entity
import productRoutes from './routes/products.route';
import categoryRoutes from './routes/categories.route';
import searchRoutes from './routes/search.route';
import adminRoutes from './routes/admin.route';
import healthRoutes from './routes/health.route';
import authRoutes from './routes/auth.route';
import checkoutRoutes from './routes/checkout.route';
import analyticsRoutes from './routes/analytics.route'; // New Route
import { AuthService } from './services/auth.service';

const app = express();
const PORT = process.env.PORT || 9000;

// Database Connection
const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/medusa_db",
    entities: [User, AuditLog, Order, LineItem, NotificationLog, AnalyticsEvent],
    synchronize: true, 
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }) as any);

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

// Start
AppDataSource.initialize().then(async () => {
    console.log("[Database] Connected");
    
    const authService = new AuthService({ manager: AppDataSource.manager });
    await authService.seedInitialUser();

    app.listen(PORT, () => {
        console.log(`[Server] Running on http://localhost:${PORT}`);
        console.log(`[Server] Catalog loaded in memory.`);
    });
}).catch(error => console.log("[Database] Error: ", error));
