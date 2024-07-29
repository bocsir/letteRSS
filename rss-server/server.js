import RSSParser from "rss-parser";
import cors from "cors";
import express from "express";

let app = express();
app.use(cors());

// const feedURL = "https://netflixtechblog.com/feed";
let feedURLs = ["https://netflixtechblog.com/feed", "https://psychcool.org/index.xml"];
let allArticles = {};

const parser = new RSSParser();

//get all articles from feed url and store in allArticles{}
const parse = async (url) => {

    //parse out each <item> in feed items. <item> represents an article
    const feed = await parser.parseURL(url);
    console.log()
    allArticles[feedIndex] = [];

    feed.items.forEach(item => {
        allArticles[feedIndex].push({item});
    });

    feedIndex++;

}

let feedIndex = 0;
feedURLs.forEach(async feedURL => {
    await parse(feedURL);
});

app.get('/', (req, res) => {
    res.send(allArticles);
})

const server = app.listen("4000", () => {
    console.log("app listening at http://localhost:4000");
});

export default server;