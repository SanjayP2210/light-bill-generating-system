import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import customersRoute from './routes/customers.js';
import billsRoute from './routes/bills.js';
import authRoute from './routes/auth.js';
import usersRoute from './routes/users.js';
import mastersRoute from './routes/masters.js';
import { protect } from './middleware/auth.js';
import connectDB from './config/db.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config — resolved relative to this file so it loads no matter which
// directory the server is started from.
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "config/config.env") });
}

// Behind Vercel's proxy the client IP arrives in X-Forwarded-For. Without
// this every visitor looks like the same IP, so the login rate limiter
// would block all users together.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));

// Known default origins (local dev + this app's Vercel domain) plus any
// extra origins supplied via CLIENT_URL (comma-separated — useful for a
// custom domain or preview deployments). Kept as an explicit allowlist
// rather than "*" because the API relies on credentialed (cookie) requests.
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
  'https://bill-generation-system.vercel.app',
];
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];
const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header (server-to-server calls, curl, same-origin in some browsers)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Outside production, allow any local dev port (vite picks a new one
    // whenever 5173 is busy) instead of hardcoding a single port.
    if (process.env.NODE_ENV !== 'production' && isLocalOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  // Let browsers cache the CORS preflight for 10 minutes instead of sending
  // an extra OPTIONS round trip before every cross-origin API call.
  maxAge: 600,
}));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Start connecting at boot so the connection is usually ready before the
// first request; every API request then awaits the same cached promise.
connectDB().catch(() => {});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database is unavailable, please try again shortly', isError: true });
  }
});

app.use(express.static(path.join(__dirname, "../client/dist"), {
  // Vite emits content-hashed file names under /assets, so they can be cached forever.
  setHeaders: (res, filePath) => {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));
app.use('/uploads', express.static(path.join(__dirname, "uploads"), { maxAge: '7d' }));

app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/customers', protect, customersRoute);
app.use('/api/bills', protect, billsRoute);
app.use('/api/masters', protect, mastersRoute);

// Unknown API paths get a JSON 404 instead of the SPA's index.html.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found', isError: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
});

// Errors passed to next(err) (multer, body-parser, CORS, …) return JSON
// instead of Express's default HTML error page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server]', err?.message);
  if (res.headersSent) return;
  const status = err?.status || err?.statusCode || (err?.message === 'Not allowed by CORS' ? 403 : 500);
  res.status(status).json({ message: status === 500 ? 'Something went wrong' : err.message, isError: true });
});

// Log instead of exiting: exiting kills every in-flight request, which
// Vercel reports to the browser as a 502.
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err?.stack || err}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err?.stack || err}`);
});

// Vercel invokes the exported app directly; only listen when running as a
// normal long-lived server (local dev, VPS, …).
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
