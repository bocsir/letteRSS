import RSSParser from "rss-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import mariadb, { Connection, Pool } from "mariadb";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer, { FileFilterCallback } from "multer";
import path from "path";
const fs = require("fs");
const opml = require("opml");

let app: Express = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const JWT_SECRET: string = process.env.JWT_SECRET!;

//db
let connection: Connection | null = null;
const pool: Pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.USER_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  connectionLimit: 5,
});

(async () => {
  try {
    connection = await pool.getConnection();
  } catch (err) {
    console.error("Error connecting to the database:", err);
  } finally {
    if (connection) connection.end(); // Release the connection back to the pool
  }
})();

//hash password with bcrypt
async function getHashedPw(
  password: string,
  saltRounds: number
): Promise<string> {
  try {
    const hashedPw = await bcrypt.hash(password, saltRounds);
    return hashedPw;
  } catch (err) {
    console.error("Error retrieving hashed password, ", err);
    throw err;
  }
}

const saltRounds: number = 10;

//'/signup' endpont. puts user email and hashed password into the database
app.post("/signup", async (req: Request, res: Response) => {
  let signupValues: [any, string];
  let body: any = req.body!;

  if (connection) {
    try {
      let hashedPw = await getHashedPw(body.password, saltRounds);
      signupValues = [body.email, hashedPw];

      //send signupValues to db
      const query = "INSERT INTO user (email, password) VALUES (?, ?)";

      const queryRes = await connection.query(query, signupValues);
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error("Signup erorr: ", err);
      res.status(500).json({ error: "" });
    }
  }
});

function generateRefreshToken(email: string): string {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "30d" });
}

//login form submit endpoint
app.post("/login", async (req, res) => {
  //get hashed password from db
  if (connection) {
    const query = "SELECT * FROM user WHERE email = (?)";
    try {
      //check that password mathches that of the same email in db
      const queryRes = await connection.query(query, req.body.email);
      const hashedPw = queryRes[0].password;
      bcrypt.compare(req.body.password, hashedPw, async (err, passwordRes) => {
        //if password matches, make new access and refresh tokens
        if (passwordRes) {
          const userId = queryRes[0].id;
          const email = queryRes[0].email;

          const accessToken: string = jwt.sign(
            { userId: userId, email: email },
            JWT_SECRET,
            { expiresIn: "1h" }
          );
          //make new refresh token and update database with it
          const refreshToken: string = generateRefreshToken(email);
          await connection?.query(
            "UPDATE user SET refresh_token = ? WHERE id = ?",
            [refreshToken, userId]
          );

          //store both tokens in cookies

          res.cookie("accessToken", accessToken, {
            httpOnly: false, //accessible by js
            secure: false, //set to true when https is set up
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, //set to true when HTTPS is setup
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });

          const user = {
            id: userId,
            email: email,
          };

          res.cookie("user", JSON.stringify(user), {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
          });

          res.json({
            valid: passwordRes,
            queryFailed: false,
            accessToken: accessToken,
          });
        } else {
          console.error("error logging in");
          res.json({ valid: false, queryFailed: false });
        }
      });
    } catch (err) {
      console.error(err);
      res.json({ valid: false, queryFailed: true });
    }
  }
});

interface UserInfo {
  userId: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserInfo;
}

function getCookieValue(name: string, req: any): string {
  let cookieValue;
  try {
    if (req && req.headers.cookie) {
      const cookie = req.headers.cookie;
      cookieValue = cookie.split(`${name}=`)[1].split(";")[0];
    }  
  } catch {
    console.error('cookie not found');
  }

  return cookieValue;
}

function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  //check if access token expired
  const accessToken = getCookieValue("accessToken", req);
  if (!accessToken) {
    return res.sendStatus(401);
  }

  //ensure access token validity if not expired
  jwt.verify(accessToken, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user as UserInfo;
    next();
  });
}

app.get(
  "/auth",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    res.json({ authenticated: true, user: req.user });
  }
);

app.post("/logout", (res: any) => {
  const actualRes = res.res;
  // clear cookies
  actualRes.setHeader(
    "Set-Cookie",
    "accessToken=; HttpOnly=false; Secure=false; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  actualRes.setHeader(
    "Set-Cookie",
    "refreshToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  actualRes.setHeader(
    "Set-Cookie",
    "user=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1960 00:00:00 GMT"
  );
  actualRes.status(200).json({ message: "logged out successfuly" });
});

//generate a new accessToken using the safe refresh token
app.post("/refresh-token", async (req, res) => {
  //send error to send user to /login if refresh token expired
  const refreshToken = getCookieValue("refreshToken", req);
  if (!refreshToken) return res.sendStatus(401);

  try {
    //check for refresh token in db
    const row = await connection?.query(
      "SELECT * FROM user WHERE refresh_token = ?",
      [refreshToken]
    );
    if (!row) return res.sendStatus(403);
    //create new access token
    const newAccessToken = jwt.sign(
      { userId: row[0].id, email: row[0].email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: false, //accessible by js
      secure: false, //set to true when https is set up
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const user = {
      id: row[0].id,
      email: row[0].email,
    };

    res.cookie("user", JSON.stringify(user), {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    return res.sendStatus(403);
  }
});

//rss feed handling*********************************************************************

const getDefaultFeedName = async(url: string): Promise<string> => {
  const feed = await parser.parseURL(url);
  const defaultName = feed.title || "";
  return defaultName
}

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
  
  //array of items in newURLs not in feedURLs
  const uniqueURLs = newURLs.filter((url) => !feedURLs.includes(url));

  //update feedURLs, removing duplicates with Set
  feedURLs = [...new Set([...feedURLs, ...newURLs])];

  const query = "INSERT INTO url (user_id, url, name) values (?, ?, ?)";

  
  //send each url from uniqeURLs to the database
  uniqueURLs.map(async (url) => {
    const feedName = await getDefaultFeedName(url);
    const queryValues = [userID, url, feedName];
    if (connection) {
      const data = await connection.execute(query, queryValues);
    }
  });

  renderFeed(names, feedURLs);
}

app.post("/changeFeedName", authenticateToken, async (req, res) => {
  console.log(req.body.newName);
  const query = "UPDATE url SET name = ? WHERE name = ?";
  const values = [req.body.newName, req.body.oldName];

  try {
    await connection?.execute(query, values);
  } catch(err) {
    console.error(err);
    res.status(401)
  }

  res.status(200).json({ message: "DB updated successfully" });
});


//items are individual articles/ blog posts
const parser = new RSSParser();

//get all Items from feed url and store in renderedFeeds{}
const parse = async ( url: string, name: string) => {
  //parse out each <item> in feed items. <item> represents an article
  const feed = await parser.parseURL(url);
  //use provided name if there is one, else use feeds default, else use ""
  let fTitle = (name) ? name : feed.title;
  fTitle = (fTitle) ? fTitle : "";

  //fill renderedFeeds object with name: content for each feed
  let renderedFeeds: { [feedTitle: string]: any[] } = {};
  renderedFeeds[fTitle] = feed.items.map((item) => ({ item }));
  return renderedFeeds;
};

//returns all items for all rss feeds in feedURLs
async function renderFeed(names: string[], feedURLs: string[]) {
  let parsedItems: any[] = [];

  for (let i = 0; i < names.length; i++) {
    parsedItems.push(await parse(feedURLs[i], names[i]));
  } 
  
  return parsedItems;
}

//returns all urls stored in db where user id matches
async function getFeedData(req: any, id?: number): Promise<string[][]> {
  //if req null, userId has been passed, else get userId
  const userId = req ? getUserId(req) : id;

  let urls: string[] = [];
  let names: string[] = [];

  if (connection) {
    try {
      const query = "SELECT url, name FROM url WHERE user_id = ?";
      const rows = await connection.execute(query, userId);
  
      const data = rows.map((item: {url: string, name: string}) => {
        urls.push(item.url);
        names.push(item.name);
      });
  
    } catch (err) {
      console.error(err);
    }

  }
  return [urls, names];
}

//endpoint to send Items, make this secure
app.get("/", authenticateToken, async (req, res) => {
  //call function to get feeds here if not already called (if dbfeed = empty)
  const data = await getFeedData(req);
  console.log(data);
  const urlList = data[0]
  const names = data[1]

  const renderedFeeds = await renderFeed(names, urlList);
  interface FormattedItems {
    [key: string]: any;
  }
  let formattedItems: FormattedItems = {};

  renderedFeeds.map((feed) => {
    const key = Object.keys(feed)[0];
    const value = Object.values(feed)[0];
    formattedItems[key] = value;
  });

  res.send(formattedItems);
});

//endpoint to add new article url
app.post("/newFeed", authenticateToken, async (req, res) => {
  try {
    const feedUrl = req.body.feedUrl;
    if (!feedUrl) {
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

//parse added file, add it to feedURLs
const parseFeed = (name: string, req: any) => {
  const extension = name.split(".")[1];
  if (extension !== "opml") return;
  fs.readFile(name, function (err: Error, opmltext: any) {
    if (!err) {
      opml.parse(opmltext, function (err: Error, theOutline: any) {
        if (!err) {
          const feeds = theOutline.opml.body.subs;
          const newURLs = feeds.map(getUrl);
          function getUrl(item: any) {
            return item.xmlUrl;
          }

          //get id from cookie
          const userId = getUserId(req);
          updateFeedDB(newURLs, userId);
        }
      });
    }
  });
};

function getUserId(req: any): number {
  const value = getCookieValue("user", req);
  const decodedValue = decodeURIComponent(value);
  const parsedValue = JSON.parse(decodedValue);
  return parsedValue.id;
}

//set up multer for file uploads
const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads/");
  },
  filename: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const name =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, name);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "text/x-opml" ||
    file.originalname.toLowerCase().endsWith(".opml")
  ) {
    cb(null, true);
  } else if (
    file.mimetype === "text/xml" ||
    file.originalname.toLowerCase().endsWith(".xml")
  ) {
    // const name = file
    cb(null, true);
  } else {
    cb(new Error("Only .opml files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, //5mb
});

app.post("/fileImport", upload.single("file"), (req: Request, res: Response) => {
    if (req.file) {
      //parse file for urls and add them to feedURLs array
      parseFeed(req.file.path, req);

      //try to delete file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("error deleting file");
      }
      res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
      });
    } else {
      return res.status(400).json({ message: "File upload failed" });
    }
  }
);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size is too large. Max limit is 5MB" });
    }
  }
  if (err.message === "Only .opml files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

//express server*************************
const server = app.listen("3000", () => {
  console.log("app listening at http://localhost:3000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("server terminated");
  });
});

export default server;