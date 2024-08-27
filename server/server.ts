import RSSParser from "rss-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import mariadb, { Connection, Pool } from 'mariadb';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 

let app: Express = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const JWT_SECRET: string = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET!;

//db
let connection: Connection | null = null;
const pool: Pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.USER_PW,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    connectionLimit: 5
});

(async () => {
    try {
        connection = await pool.getConnection();
        //log users to prove connection
        const rows = await connection.query('SELECT * FROM user');
        // console.log(rows); // [ { val: 1 } ]
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        if (connection) connection.end(); // Release the connection back to the pool
    }
})();

//hash password with bcrypt
async function getHashedPw(password: string, saltRounds: number): Promise<string> {
    try {
        const hashedPw = await bcrypt.hash(password, saltRounds)
        return hashedPw;
    } catch (err) {
        console.log('Error retrieving hashed password, ', err);
        throw err;
    }
}

const saltRounds: number = 10;

//signup form submit endpoint
app.post("/signup", async (req: Request) => {
    let signupValues: [any, string];
    let body: any = req.body!;

    if (connection) {
        let hashedPw = await getHashedPw(body.password, saltRounds);
        signupValues = [body.email, hashedPw];

        //send signupValues to db
        const query = "INSERT INTO user (email, password) VALUES (?, ?)";

        const queryRes = connection.query(query, signupValues);
    }
});

function generateRefreshToken(userId: string): string {
    return jwt.sign(
        { userId },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
    );
}

//login form submit endpoint
//check that password is good
app.post('/login', async (req, res) => {
    //get hashed password from db
    const query = 'SELECT * FROM user WHERE email = (?)';
    if (connection) {
        try {
            const queryRes = await connection.query(query, req.body.email)
            const hashedPw = queryRes[0].password;
                
            let accessToken: string;
            //check password
            bcrypt.compare(req.body.password, hashedPw, async (err, passwordRes) => {
                if (passwordRes) {
                    const userId = queryRes[0].id;
                    accessToken = jwt.sign(
                        { userId: userId, email: queryRes[0].email },
                        JWT_SECRET,
                        { expiresIn: '1h' }
                    );
                    const refreshToken = generateRefreshToken(userId);
                    await connection?.query('UPDATE user SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);
                    
                    res.cookie('accessToken', accessToken, {
                        httpOnly: false, //accessible by js
                        secure: false, //set to true when https is set up
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000 // 15 minutes
                    });

                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: false,  //set to true when HTTPS is setup
                        sameSite: 'strict',
                        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                    });

                    res.json({valid: passwordRes, queryFailed: false, accessToken: accessToken });

                } else if (err) {
                    console.error("Error validating password: ", err);
                }
            })

        } catch (err) {
            console.error(err);
            res.json({valid: false, queryFailed: true});
        }
    }
});

interface UserPayload {
    userId: string;
    email: string;
}

interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const cookie = req.headers.cookie || null;
    if (cookie) {
        const accessToken = cookie.split('=')[2] || null;
        console.log('accessToken::::: ', accessToken);
        if (accessToken == null) return res.sendStatus(401);
  
        jwt.verify(accessToken, JWT_SECRET, (err, user) => {
          if (err) return res.sendStatus(403);
          req.user = user as UserPayload;
          next();
        });
    
    }
  
}
  
app.get('/auth', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json({ authenticated: true, user: req.user });
});

//generate a new accessToken using the safe refresh token
app.get('/refresh-token', async(req, res) => {
    const refreshToken = req.headers.cookie?.split('=')[1];
    console.log('refresh token::::::: ', refreshToken);
    if (!refreshToken) return res.sendStatus(401);

    try {
        //check for refresh token in db
        const row = await connection?.query('SELECT * FROM user WHERE refresh_token = ?', [refreshToken]);
        if (!row) return res.sendStatus(403);
        //create new access token
        const newAccessToken = jwt.sign(
            { userId: row[0].userId, email: row[0].email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 15 minutes
        });

        res.json({ message: 'Token refreshed' });
    } catch(err) {
        return res.sendStatus(403);
    }
});

//rss feed handling*********************************************************************
//fill with feeds from db in future 
let feedURLs: string[] = ["https://psychcool.org/index.xml", "https://netflixtechblog.com/feed", "https://www.nasa.gov/feeds/iotd-feed/"];
//items are individual articles/ blog posts
let allItems: { [feedTitle: string]: any[] } = {};
const parser = new RSSParser();


//get all Items from feed url and store in allItems{}
const parse = async (url: string) => {
    //parse out each <item> in feed items. <item> represents an article
    const feed = await parser.parseURL(url);
    const fTitle = feed.title || '';
    allItems[fTitle] = feed.items.map(item => ({ item }));
}

async function renderFeed() {
    const parsePromises = feedURLs.map((url) => parse(url));
    await Promise.all(parsePromises);
}
renderFeed();

//endpoint to send Items, make this secure
app.get('/',authenticateToken, async (req, res) => {
    await renderFeed();
    res.send(allItems);
})

//endpoint to get new article
app.post('/newFeed', async (req, res) => {
    const { feedUrl } = req.body;
    feedURLs.push(feedUrl);
    await renderFeed();
    //send successful response to frontend
    res.json({message: 'Data recieved successfully'});
});


//express server*************************
const server = app.listen("3000", () => {
    console.log("app listening at http://localhost:3000");
});

interface AuthValues {
    email: string,
    password: string
}


export default server;