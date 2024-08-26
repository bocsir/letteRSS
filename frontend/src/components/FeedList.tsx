import { useEffect, useState } from "react";
import { ArticleItem, Articles } from "../interfaces";
import axios from "axios";
import Feed from "../components/Feed";
import Menu from "./Menu";

export const FeedList = () => {
  //useState is useful because calling its update function will trigger re-render
  const [articles, setArticles] = useState<Articles>({});
  const [feedVisibility, setFeedVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  //request to allAritcles endpoint for articles
  const getArticles = async () => {
    console.log("gettingarticles");
    try {
      const res = await axios.get("http://localhost:3000/");
      console.log("fetched articles: ", res.data);
      setArticles(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  //get articles on mount (first render)
  useEffect(() => {
    getArticles();
  }, []);

  const toggleFeedVisibility = (feedIndex: string) => {
    setFeedVisibility((prev: { [key: string]: boolean }) => ({
      ...prev,
      [feedIndex]: !prev[feedIndex],
    }));
    console.log(feedVisibility);
  };
  return (
    <div className="pt-3 h-full">
      <div
        id="feed-list"
        className="bg-[#000000] w-96 h-[95%] h-max-[95%] overflow-scroll overflow-x-hidden rounded ml-3 p-3 shadow-[0px_0px_3px_1px_rgb(255,255,255)]"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold ml-3 text-gray-400">Feeds:</h2>
          <Menu callGetArticles={getArticles}/>
        </div>

        {Object.entries(articles).map(
          ([feedIndex, feedArray]: [string, ArticleItem[]]) => (
            <div
              key={feedIndex}
              className={`cursor-pointer max-w-96 rounded pl-3 pr-3 ${
                feedVisibility[feedIndex]
                  ? "border"
                  : "border border-transparent"
              }`}
            >
              <div
                className="h-7 flex justify-between items-center relative"
                onClick={() => toggleFeedVisibility(feedIndex)}
              >
                <h3
                  className={`text-base select-none whitespace-nowrap text-clip pr-3
                  ${
                    feedVisibility[feedIndex] ? "text-amber-300" : "text-white"
                  }`}
                >
                  {feedIndex}
                </h3>
                <button
                  className={`text-2xl pl-2 font-semibold relative z-1 ${
                    feedVisibility[feedIndex] ? "text-amber-300" : "text-white"
                  }`}
                >
                  {feedVisibility[feedIndex] ? "-" : "+"}
                </button>
              </div>
              {feedVisibility[feedIndex] && (
                <div className="font-semibold flex flex-col ml-3">
                  {feedArray.map((item: ArticleItem) => (
                    <Feed key={item.item.title} item={item.item} />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
