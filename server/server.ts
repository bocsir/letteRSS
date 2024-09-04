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

//'/signup' endpont. puts user email and hashed password into the database
app.post("/signup", async (req: Request, res: Response) => {
    console.log('signing up user');
    let signupValues: [any, string];
    let body: any = req.body!;

    if (connection) {
        try {
            let hashedPw = await getHashedPw(body.password, saltRounds);
            signupValues = [body.email, hashedPw];
    
            //send signupValues to db
            const query = "INSERT INTO user (email, password) VALUES (?, ?)";
    
            const queryRes = await connection.query(query, signupValues);
            res.status(201).json({ message: 'User created successfully'});
    
        } catch (err) {
            console.error('Signup erorr: ', err);
            res.status(500).json({error: ''})
        }
    }
});

function generateRefreshToken(email: string): string {
    return jwt.sign(
        { email },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

//login form submit endpoint
app.post('/login', async (req, res) => {
    //get hashed password from db
    if (connection) {
        const query = 'SELECT * FROM user WHERE email = (?)';
        try {
            //check that password mathches that of the same email in db
            const queryRes = await connection.query(query, req.body.email)
            const hashedPw = queryRes[0].password;
            bcrypt.compare(req.body.password, hashedPw, async (err, passwordRes) => {
                //if password matches, make new access and refresh tokens
                if (passwordRes) {
                    console.log(';lasdkfj;adslkjfd');
                    const userId = queryRes[0].id;
                    const email = queryRes[0].email;

                    const accessToken: string = jwt.sign(
                        { userId: userId, email: email },
                        JWT_SECRET,
                        { expiresIn: '1h' }
                    );
                    //make new refresh token and update database with it
                    const refreshToken: string = generateRefreshToken(email);
                    await connection?.query('UPDATE user SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);
                    
                    //store both tokens in cookies

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

                } else {
                    console.log('kkkkkkkk');
                    console.error("error logging in");
                    res.json({valid: false, queryFailed: false});
                }
            });

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
        if (accessToken == null) return res.sendStatus(401);
  
        //check access token validity
        jwt.verify(accessToken, JWT_SECRET, (err, user) => {
            console.log(user, err);
          if (err) return res.sendStatus(403);
          req.user = user as UserPayload;
          next();
        });
    }
}
  
app.get('/auth', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    console.log()
    res.json({ authenticated: true, user: req.user });
});

app.post('/logout', (res: any) => {
    console.log('response obj methods: ', Object.keys(res.res));
    const actualRes = res.res;
    actualRes.setHeader('Set-Cookie', 'accessToken=; HttpOnly=false; Secure=false; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    actualRes.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    actualRes.status(200).json({ message: 'logged out successfuly'});
});

//generate a new accessToken using the safe refresh token
app.post('/refresh-token', async(req, res) => {
    const refreshToken = req.headers.cookie?.split('=')[1];
    //send error to send user to /login
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
/*                        httpOnly: false, //accessible by js
                        secure: false, //set to true when https is set up
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000 // 15 minutes
 */
        res.cookie('accessToken', newAccessToken, {
            httpOnly: false, //accessible by js
            secure: false, //set to true when https is set up
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.json({ message: 'Token refreshed' });
    } catch(err) {
        return res.sendStatus(403);
    }
});

//rss feed handling*********************************************************************
//fill with feeds from db in future 
let feedURLs: string[] = ["http://fetchrss.com/rss/66d63ac29c1d413f08062ef366d63a7c89c1a56ea20b5e23.xml", "https://psychcool.org/index.xml", "https://netflixtechblog.com/feed", "https://www.nasa.gov/feeds/iotd-feed/"];
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