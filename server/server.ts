/*TODO:

*Separate db, express server, rss feed handling

*/

import RSSParser from "rss-parser";
import cors from "cors";
import express, { Express } from "express";
import mariadb, { Connection, Pool } from 'mariadb';
import 'dotenv/config';
import bcrypt from 'bcrypt';
 
let app: Express = express();
app.use(cors());
app.use(express.json());

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

//login form submit endpoint
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

//login form submit endpoint
//check that password is good
app.post('/login', async (req, res) => {
    //get hashed password from db
    const query = 'SELECT password FROM user WHERE email = (?)';
    
    if (connection) {
        const queryRes = connection.query(query, req.body.email)
        console.log(queryRes);

        //const hashedPw: string = queryRes.?

        //check password
        // if (bcrypt.compare(req.body.password, hashedPw, saltRounds)){
        //     //good password
        //     console.log('good pw');
        // } else {
        //     //bad password
        //     console.error('bad pw');
    // }
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

//endpoint to send Items
app.get('/', async (req, res) => {
    console.log(req);
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