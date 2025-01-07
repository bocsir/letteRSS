import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from './routes/auth';
import feedRoutes from './routes/feed';
import { setupDatabase } from "./database";
import helmet from 'helmet';
import path from 'path';

const app: Express = express();

const allowedOrigins = ["http://localhost:5173", "https://letterss.net"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https://assets.amuniversal.com"],
    connectSrc: ["'self'", ...allowedOrigins, "http://localhost:3000"],
    fontSrc: ["'self'", "https:", "data:"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    frameSrc: ["*"],
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup database connection
setupDatabase();

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("Server terminated");
});

export default app;
