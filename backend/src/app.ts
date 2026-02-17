import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';

const app: Application = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────
app.use('/api', authRoutes);  // /api/auth/register, /api/auth/login
app.use('/api', bookRoutes);  // /api/books (all protected)

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;