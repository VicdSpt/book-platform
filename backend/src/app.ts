import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

// Middleware - functions that run on every request
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Test route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

export default app;