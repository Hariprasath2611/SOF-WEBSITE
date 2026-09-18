import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.js';
import { googleSheetsService } from './services/googleSheetsService.js';
import { EVENTS } from './config/events.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting: allow up to 120 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Middlewares
app.use(limiter);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SFD 2026 Event Registration API',
    timestamp: new Date().toISOString(),
    googleSheetsConnected: googleSheetsService.isConfigured()
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start listening
app.listen(PORT, async () => {
  console.log(`🚀 SFD 2026 Registration Server running on http://localhost:${PORT}`);
  console.log(`📊 Google Sheets integration: ${googleSheetsService.isConfigured() ? 'CONFIGURED & CONNECTED' : 'LOCAL FALLBACK ACTIVE (Configure .env to sync with Google Cloud)'}`);

  // Initialize sheets if Google credentials configured
  if (googleSheetsService.isConfigured()) {
    try {
      await googleSheetsService.initMasterSpreadsheet();
      for (const ev of EVENTS) {
        await googleSheetsService.initEventSpreadsheet(ev);
      }
      console.log('✅ Google Sheets headers & tabs checked / initialized.');
    } catch (err) {
      console.warn('Google Sheets startup initialization check warning:', err.message);
    }
  }
});
