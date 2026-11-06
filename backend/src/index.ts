import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import contractRoutes from './routes/contractRoutes';
import projectRoutes from './routes/projectRoutes';
import contractorRoutes from './routes/contractorRoutes';
import qrRoutes from './routes/qrRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import thresholdRoutes from './routes/thresholdRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded evidence, inspection photos, and documents statically
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'SmartRoad AI Enterprise Backend',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/thresholds', thresholdRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SmartRoad AI Backend running on http://localhost:${PORT}`);
  console.log(`📂 Serving uploaded static media from ${uploadsPath}`);
});

export default app;

