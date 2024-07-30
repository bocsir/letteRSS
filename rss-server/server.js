import RSSParser from "rss-parser";
import cors from "cors";
import express from "express";

let app = express();
app.use(cors());
app.use(express.json());

// const feedURL = "https://netflixtechblog.com/feed";
let feedURLs = ["https://netflixtechblog.com/feed", "https://psychcool.org/index.xml"];
let allArticles = {};
const parser = new RSSParser();

//get all articles from feed url and store in allArticles{}
const parse = async (url, index) => {
    //parse out each <item> in feed items. <item> represents an article
    const feed = await parser.parseURL(url);
    allArticles[index] = feed.items.map(item => ({ item }));
}

async function renderFeed() {
    const parsePromises = feedURLs.map((url, index) => parse(url, index));
    await Promise.all(parsePromises);
}
renderFeed();

//endpoint to send articles
app.get('/', async (req, res) => {
    await renderFeed();
    res.send(allArticles);
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