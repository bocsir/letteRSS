export interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    content?: string;
    ['content:encoded']?: string
}

export interface ArticleItem {
  item: FeedItem;
}

export interface Articles {
  [feedIndex: string]: ArticleItem[] | [];
}
  