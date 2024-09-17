import RSSParser from "rss-parser";

const parser = new RSSParser();

export const getDefaultFeedName = async(url: string): Promise<string> => {
  const feed = await parser.parseURL(url);
  return feed.title || "";
}

export const parse = async (url: string, name: string) => {
  const feed = await parser.parseURL(url);
  let fTitle = name || feed.title || "";

  let renderedFeeds: { [feedTitle: string]: any[] } = {};
  renderedFeeds[fTitle] = feed.items.map((item) => ({ item }));
  return renderedFeeds;
};

export async function renderFeed(names: string[], feedURLs: string[]) {
  let parsedItems: any[] = [];

  /*
  this is the bulk of the load time. maybe send only names of 
  feeds and articles, then parse, then send parsed result?
  or parse after user opens a feed?
  */ 
  for (let i = 0; i < names.length; i++) {
    parsedItems.push(await parse(feedURLs[i], names[i]));
  } 
  return parsedItems;
}