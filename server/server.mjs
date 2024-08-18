/*TODO:

*Separate db, express server, rss feed handling

*/

import RSSParser from "rss-parser";
import cors from "cors";
import express from "express";
import mariadb from 'mariadb';
import 'dotenv/config';
import bcrypt from 'bcrypt';
 
let app = express();
app.use(cors());
app.use(express.json());

//db
let connection;

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.USER_PW,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),
    connectionLimit: 5
});

//auth
const saltRounds = 10;

(async () => {
    try {
        connection = await pool.getConnection();
        //log users to prove connection
        const rows = await connection.query('SELECT * FROM user');
        console.log(rows); // [ { val: 1 } ]
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
})();

//hash password with bcrypt
async function getHashedPw(password, saltRounds) {
    try {
        const hashedPw = await bcrypt.hash(password, saltRounds)
        return hashedPw;
    } catch (err) {
        console.log('Error retrieving hashed password, ', err);
        throw err;
    }
}

//login form submit endpoint
app.post('/login', async (req, res) => {    
    let hashedPw = getHashedPw(req.body.password, saltRounds);

    const loginValues = [ req.body.email, hashedPw ];

    //send loginValues to db
    const query = 'INSERT INTO user (email, password) VALUES (?, ?)';

    connection.query(query, loginValues, (err, res) => {
        if (err) {
            throw new Error('Error adding loginValues: ', err);
        } else {
            console.log('Sent login info to db. InsertID: ', res.insertId);            
        }
    });
});

//singup form submit endpoint
//check that password is good
app.post('/singup', async (req, res) => {
    //get hashed password from db
    const query = 'SELECT password FROM user WHERE email = (?)';
    let hashedPw;
    connection.query(query, req.body.email, (err, res) => {
        if (err) {
            throw new Error('Error retrieving hashed password: ', err);
        } else {
            console.log('Got hashed password from db, ', res);

            hashedPw = res.password;
        }
    });

    //check password
    if (bcrypt.compare(req.body.password, hashedPw, saltRounds)){
        //good password
        console.log('good pw');
    } else {
        //bad password
        console.error('bad pw');
    }
});

//rss feed handling*********************************************************************
//fill with feeds from db in future 
let feedURLs = ["https://psychcool.org/index.xml", "https://netflixtechblog.com/feed"];
//items are individual articles/ blog posts
let allItems = {};
const parser = new RSSParser();

//get all Items from feed url and store in allItems{}
const parse = async (url) => {
    //parse out each <item> in feed items. <item> represents an article
    const feed = await parser.parseURL(url);
    const fTitle = feed.title;
    allItems[fTitle] = feed.items.map(item => ({ item }));
}

async function renderFeed() {
    const parsePromises = feedURLs.map((url) => parse(url));
    await Promise.all(parsePromises);
}
renderFeed();

//endpoint to send Items
app.get('/', async (req, res) => {
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
const server = app.listen("4000", () => {
    console.log("app listening at http://localhost:4000");
});

export default server;