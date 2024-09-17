import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from './routes/auth';
import feedRoutes from './routes/feed';
import { setupDatabase } from "./database";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup database connection
setupDatabase();

// Routes
app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

const server = app.listen(3000, () => {
  console.log("app listening at http://localhost:3000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("server terminated");
  });
});

export default server;


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