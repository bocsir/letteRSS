"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.getDefaultFeedName = void 0;
exports.renderFeed = renderFeed;
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default();
const getDefaultFeedName = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const feed = yield parser.parseURL(url);
    return feed.title || "";
});
exports.getDefaultFeedName = getDefaultFeedName;
const parse = (url, name) => __awaiter(void 0, void 0, void 0, function* () {
    const feed = yield parser.parseURL(url);
    let fTitle = name || feed.title || "";
    let renderedFeeds = {};
    renderedFeeds[fTitle] = feed.items.map((item) => ({ item }));
    return renderedFeeds;
});
exports.parse = parse;
function renderFeed(names, feedURLs) {
    return __awaiter(this, void 0, void 0, function* () {
        let parsedItems = [];
        /*
        this is the bulk of the load time. maybe send only names of
        feeds and articles, then parse, then send parsed result?
        or parse after user opens a feed?
        */
        for (let i = 0; i < names.length; i++) {
            parsedItems.push(yield (0, exports.parse)(feedURLs[i], names[i]));
        }
        return parsedItems;
    });
}
