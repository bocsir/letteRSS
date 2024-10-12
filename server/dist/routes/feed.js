"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const opml = require('opml');
const database_1 = require("../database");
const auth_1 = require("../auth");
const rss_1 = require("../rss");
const utils_1 = require("../utils");
const router = express_1.default.Router();
function updateFeedDB(newURLs, userID) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield (0, database_1.getConnection)();
        const data = yield getFeedData(null, userID);
        let feedURLs = [];
        let names = [];
        if (data) {
            feedURLs = data[0];
            names = data[1];
        }
        names = yield Promise.all(names.map((name, index) => __awaiter(this, void 0, void 0, function* () { return (name === null) ? name : yield (0, rss_1.getDefaultFeedName)(feedURLs[index]); })));
        const uniqueURLs = newURLs.filter((url) => !feedURLs.includes(url));
        feedURLs = [...new Set([...feedURLs, ...newURLs])];
        const query = "INSERT INTO url (user_id, url, name) VALUES (?, ?, ?)";
        for (const url of uniqueURLs) {
            const feedName = yield (0, rss_1.getDefaultFeedName)(url);
            yield connection.execute(query, [userID, url, feedName]);
        }
        return (0, rss_1.renderFeed)(names, feedURLs);
    });
}
//get names and urls and folders from db
function getFeedData(req, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield (0, database_1.getConnection)();
        const userId = req ? (0, utils_1.getUserId)(req) : id;
        let urls = [];
        let names = [];
        let folders = [];
        try {
            const query = "SELECT url, name, folder FROM url WHERE user_id = ?";
            const rows = yield connection.execute(query, [userId]);
            rows.forEach((item) => {
                urls.push(item.url);
                names.push(item.name);
                folders.push(item.folder);
            });
        }
        catch (err) {
            console.error(err);
        }
        return [urls, names, folders];
    });
}
//need to also get folders
router.get("/getFeedNames", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield getFeedData(req);
    res.send(data);
}));
//endpoint to parse feeds individually
router.post("/getRenderedFeedData", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const renderedFeed = yield (0, rss_1.parse)(data.url, data.name);
    res.send(renderedFeed);
}));
router.post("/newFeed", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedUrl = req.body.feedUrl;
        if (!feedUrl) {
            console.log('no feed url');
            return res.status(400).json({ message: "Invalid feedURL provided" });
        }
        const userId = (0, utils_1.getUserId)(req);
        yield updateFeedDB([feedUrl], userId);
        res.status(200).json({ message: "Data received successfully" });
    }
    catch (err) {
        console.error("Error processing new feed:", err);
        res.status(500).json({
            message: "An error occurred while processing the request",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
router.post("/changeFeedName", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, database_1.getConnection)();
    const query = "UPDATE url SET name = ? WHERE name = ?";
    const values = [req.body.newName, req.body.oldName];
    console.log(req);
    console.log(values);
    try {
        yield connection.execute(query, values);
        res.status(200).json({ message: "DB updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating feed name" });
    }
}));
// File upload configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const name = file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname);
        cb(null, name);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "text/x-opml" ||
        file.originalname.toLowerCase().endsWith(".opml") ||
        file.mimetype === "text/xml" ||
        file.originalname.toLowerCase().endsWith(".xml")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only .opml and .xml files are allowed!"));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});
router.post('/updateFolderStatus', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const folderName = req.body.folderName;
    const feeds = req.body.feedsInFolder;
    console.log('feeds: ', feeds);
    console.log('folder: ', folderName);
    const query = `UPDATE url SET folder = ? WHERE name IN (${feeds.map((feed) => `'${feed}'`).join(',')})`;
    const connection = yield (0, database_1.getConnection)();
    try {
        yield connection.execute(query, [folderName]);
        res.status(200).json({ message: "folder status updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500);
    }
}));
router.post("/fileImport", auth_1.authenticateToken, upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        try {
            const opmlContent = fs_1.default.readFileSync(req.file.path, 'utf8');
            opml.parse(opmlContent, (err, theOutline) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.error("Error parsing OPML:", err);
                    return res.status(400).json({ message: "Error parsing OPML file" });
                }
                const feeds = theOutline.opml.body.subs;
                const newURLs = feeds.map((item) => item.xmlUrl);
                const userId = (0, utils_1.getUserId)(req);
                yield updateFeedDB(newURLs, userId);
                // Delete the uploaded file
                fs_1.default.unlinkSync(req.file.path);
                res.status(200).json({
                    message: "File uploaded and processed successfully",
                    filename: req.file.filename,
                });
            }));
        }
        catch (err) {
            console.error("Error processing uploaded file:", err);
            res.status(500).json({ message: "Error processing uploaded file" });
        }
    }
    else {
        return res.status(400).json({ message: "File upload failed" });
    }
}));
router.post('/deleteFeeds', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const names = req.body;
    const formattedValues = names.map((name) => `'${name.replace(/'/g, "''")}'`).join(', ');
    const query = `DELETE FROM url WHERE name IN (${formattedValues})`;
    console.log('formatted vals: ', formattedValues);
    const connection = yield (0, database_1.getConnection)();
    try {
        yield connection.execute(query, formattedValues);
        res.status(200).json({ message: "RSS feed successfully removed" });
    }
    catch (err) {
        console.error(err);
        res.status(500);
    }
}));
// Error handling middleware
router.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File size is too large. Max limit is 5MB" });
        }
    }
    if (err.message === "Only .opml and .xml files are allowed") {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
});
exports.default = router;
