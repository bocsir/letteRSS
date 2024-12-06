import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
const opml = require('opml');
import { query } from "../database";
import { authenticateToken } from "../auth";
import { getDefaultFeedName, renderFeed, parse } from '../rss';
import { getUserId } from '../utils';

const router = express.Router();

async function updateFeedDB(newURLs: string[], userID: number) {
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

  try {
    const queryText = "INSERT INTO url (user_id, url, name) VALUES (?, ?, ?)";
  
    for (const url of uniqueURLs) {
      const feedName = await getDefaultFeedName(url);
      await query(queryText, [userID, url, feedName]);
    }  
  } catch(err) {
    console.error('error updating feed db', err);
  }

  return renderFeed(names, feedURLs);
}

//get names and urls and folders from db
async function getFeedData(req: any, id?: number): Promise<string[][]> {
  const userId = req ? getUserId(req) : id;

  let urls: string[] = [];
  let names: string[] = [];
  let folders: string[] = [];

  try {
    const queryText = "SELECT url, name, folder FROM url WHERE user_id = ?";
    const rows = await query(queryText, [userId]);

    rows.forEach((item: {url: string, name: string, folder: string}) => {
      urls.push(item.url);
      names.push(item.name);
      folders.push(item.folder);
    });

  } catch (err) {
    console.error(err);
  }

  return [urls, names, folders];
}

//need to also get folders
router.get("/getFeedNames", authenticateToken, async (req, res) => {
  const data = await getFeedData(req);
  res.send(data);
});

//endpoint to parse feeds individually
router.post("/getRenderedFeedData", authenticateToken, async (req, res) => {
  const data = req.body;
  const renderedFeed = await parse(data.url, data.name);
  res.send(renderedFeed);
});

router.post("/newFeed", authenticateToken, async (req: any, res: any) => {
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
  const queryText = "UPDATE url SET name = ? WHERE name = ?";
  const values = [req.body.newName, req.body.oldName];

  try {
    await query(queryText, values);
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

router.post('/updateFolderStatus', authenticateToken, async(req, res) => {
  const folderName: string = req.body.folderName;
  const feeds = req.body.feedsInFolder;

  const queryText = `UPDATE url SET folder = ? WHERE name IN (${feeds.map((feed: string) => `'${feed}'`).join(',')})`;

  try {
    await query(queryText, [folderName]);
    res.status(200).json({ message: "folder status updated" });
  } catch (err) {
    console.error(err);
    res.status(500)
  }
});

router.post("/fileImport", authenticateToken, upload.single("file"), async (req: any, res: any) => {
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

router.post('/deleteFeeds', authenticateToken, async(req, res) => {
  const names = req.body;
  const formattedValues: string = names.map((name: string) => `'${name.replace(/'/g, "''")}'`).join(', ');
  const queryText = `DELETE FROM url WHERE name IN (${formattedValues})`;
  
  try {
    await query(queryText);
    res.status(200).json({ message: "RSS feed successfully removed" });
  } catch (err) {
    console.error(err);
    res.status(500)
  }
});

// Error handling middleware
router.use((err: any, req: any, res: any, next: any) => {
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