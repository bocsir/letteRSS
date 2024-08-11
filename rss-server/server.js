import RSSParser from "rss-parser";
import cors from "cors";
import express from "express";

let app = express();
app.use(cors());
app.use(express.json());

//fill with feeds from db in future  , 
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

const server = app.listen("4000", () => {
    console.log("app listening at http://localhost:4000");
});

export default server;