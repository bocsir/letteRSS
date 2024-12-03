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

export interface Feeds {
  [feedIndex: string]: ArticleItem[] | [];
}
  
export interface User {
  email: string;
}
export interface AuthStatusResponse {
  authenticated: boolean;
  user: User;
}
