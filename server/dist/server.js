"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const auth_1 = __importDefault(require("./routes/auth"));
const feed_1 = __importDefault(require("./routes/feed"));
const database_1 = require("./database");
const helmet_1 = __importDefault(require("helmet"));
const path = require('path');
const app = (0, express_1.default)();
app.options('*', (0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://letterss.net"],
    credentials: true,
    optionsSuccessStatus: 200
}));
//serve static files
// app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(helmet_1.default.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        // Add more directives as needed, like fontSrc, frameSrc, etc.
    },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Setup database connection
(0, database_1.setupDatabase)();
// Routes
app.use("/auth", auth_1.default);
app.use("/feed", feed_1.default);
//cath-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
const server = app.listen(3000, () => {
    console.log("app listening at localhost:3000");
});
process.on("SIGTERM", () => {
    server.close(() => {
        console.log("server terminated");
    });
});
exports.default = server;
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
