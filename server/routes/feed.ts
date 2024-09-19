import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
const opml = require('opml');
import { getConnection } from "../database";
import { authenticateToken } from "../auth";
import { getDefaultFeedName, renderFeed } from '../rss';
import { getUserId } from '../utils';

const router = express.Router();

async function updateFeedDB(newURLs: string[], userID: number) {
  const connection = await getConnection();
  const data = await getFeedData(null, userID);
  let feedURLs: string[] = [];
  let names: string[] = [];

  if (data) {
    feedURLs = data[0];
    names = data[1];
  }

  names = await Promise.all(
    names.map(async (name: string, index: number) => 
      (name === null) ? name : await getDefaultFeedName(feedURLs[index])
    )
  );
  
  const uniqueURLs = newURLs.filter((url) => !feedURLs.includes(url));
  feedURLs = [...new Set([...feedURLs, ...newURLs])];

  const query = "INSERT INTO url (user_id, url, name) VALUES (?, ?, ?)";
  
  for (const url of uniqueURLs) {
    const feedName = await getDefaultFeedName(url);
    await connection.execute(query, [userID, url, feedName]);
  }

  return renderFeed(names, feedURLs);
}

async function getFeedData(req: any, id?: number): Promise<string[][]> {
  const connection = await getConnection();
  const userId = req ? getUserId(req) : id;

  let urls: string[] = [];
  let names: string[] = [];

  try {
    const query = "SELECT url, name FROM url WHERE user_id = ?";
    const rows = await connection.execute(query, [userId]);

    rows.forEach((item: {url: string, name: string}) => {
      urls.push(item.url);
      names.push(item.name);
    });

  } catch (err) {
    console.error(err);
  }

  return [urls, names];
}

router.get("/", authenticateToken, async (req, res) => {
  const data = await getFeedData(req);
  const urlList: string[] = data[0];
  const names: string[] = data[1];

  const renderedFeeds = await renderFeed(names, urlList);
  let formattedItems: { [key: string]: any } = {};

  renderedFeeds.forEach((feed) => {
    const key = Object.keys(feed)[0];
    const value = Object.values(feed)[0];
    formattedItems[key] = value;
  });

  res.send(formattedItems);
});

router.post("/newFeed", authenticateToken, async (req, res) => {
  try {
    const feedUrl = req.body.feedUrl;
    if (!feedUrl) {
      console.log('no feed url');
      return res.status(400).json({ message: "Invalid feedURL provided" });
    }

    const userId = getUserId(req);
    await updateFeedDB([feedUrl], userId);

    res.status(200).json({ message: "Data received successfully" });
  } catch (err) {
    console.error("Error processing new feed:", err);
    res.status(500).json({
      message: "An error occurred while processing the request",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

router.post("/changeFeedName", authenticateToken, async(req, res) => {
  const connection = await getConnection();
  const query = "UPDATE url SET name = ? WHERE name = ?";
  const values = [req.body.newName, req.body.oldName];

  console.log(req);
  console.log(values);

  try {
    await connection.execute(query, values);
    res.status(200).json({ message: "DB updated successfully" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Error updating feed name" });
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const name = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, name);
  },
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    file.mimetype === "text/x-opml" ||
    file.originalname.toLowerCase().endsWith(".opml") ||
    file.mimetype === "text/xml" ||
    file.originalname.toLowerCase().endsWith(".xml")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .opml and .xml files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

router.post("/fileImport", authenticateToken, upload.single("file"), async (req, res) => {
  if (req.file) {
    try {
      const opmlContent = fs.readFileSync(req.file.path, 'utf8');
      opml.parse(opmlContent, async (err: Error | null, theOutline: any) => {
        if (err) {
          console.error("Error parsing OPML:", err);
          return res.status(400).json({ message: "Error parsing OPML file" });
        }

        const feeds = theOutline.opml.body.subs;
        const newURLs = feeds.map((item: any) => item.xmlUrl);

        const userId = getUserId(req);
        await updateFeedDB(newURLs, userId);

        // Delete the uploaded file
        fs.unlinkSync(req.file!.path);

        res.status(200).json({
          message: "File uploaded and processed successfully",
          filename: req.file!.filename,
        });
      });
    } catch (err) {
      console.error("Error processing uploaded file:", err);
      res.status(500).json({ message: "Error processing uploaded file" });
    }
  } else {
    return res.status(400).json({ message: "File upload failed" });
  }
});

// Error handling middleware
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size is too large. Max limit is 5MB" });
    }
  }
  if (err.message === "Only .opml and .xml files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

export default router;