import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from './routes/auth';
import feedRoutes from './routes/feed';
import { setupDatabase } from "./database";
import helmet from 'helmet';
const path = require('path');

const app: Express = express();

app.options('*', cors({
    origin: "http://localhost:3000", //'https://letterss.net'
    credentials: true,
    optionsSuccessStatus: 200
  })
);

//serve static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      // Add more directives as needed, like fontSrc, frameSrc, etc.
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Setup database connection
setupDatabase();

// Routes
app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);
//cath-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});


const server = app.listen(3000, () => {
  console.log("app listening on port 3000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("server terminated");
  });
});

export default server;

app.use((req, res, next) => {
  console.log(`serving request for : ${req.url}`);
  next();
});

//strucutre:
/*
1. server.ts - main server file
2. database.ts - db connection and startup
3. auth.ts - auth-related functions and middleware
4. rss.ts - RSS feed handling functions
5. routes/auth.ts - auth routes
6. routes/feed.ts - feed routes
7. types.ts - type declarations
8. util.ts - utility functions
*/
