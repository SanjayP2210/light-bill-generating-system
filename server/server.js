import express from 'express';
import mongoose from 'mongoose';
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

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "server/config/config.env" });
}

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
}));
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.log(err);
    if (err?.syscall === 'querySrv') {
      console.log(
        '\nThis looks like a DNS SRV lookup failure, not a bad connection string.\n' +
        'Your network/DNS resolver may not support the "_mongodb._tcp" SRV record ' +
        'used by mongodb+srv:// URIs (common with some routers/ISPs/VPNs/antivirus).\n' +
        'Try: (1) switch your DNS to 8.8.8.8 / 1.1.1.1 and run "ipconfig /flushdns", ' +
        'or (2) disable any VPN/firewall and retry, or (3) use the non-SRV standard ' +
        'connection string from Atlas (Database > Connect > Drivers) instead of MONGO_URI.\n'
      );
    }
  });


app.use(express.static(path.join(__dirname, "../client/dist")));
app.use('/uploads', express.static(path.join(__dirname, "uploads")));

app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/customers', protect, customersRoute);
app.use('/api/bills', protect, billsRoute);
app.use('/api/masters', protect, mastersRoute);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
});


// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err?.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
