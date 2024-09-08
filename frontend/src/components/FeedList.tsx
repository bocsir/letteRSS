import { useEffect, useState } from "react";
import { ArticleItem, Articles } from "../interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareRss } from "@fortawesome/free-solid-svg-icons";
import Feed from "../components/Feed";
import Menu from "./FeedMenu";
import api from "../api";

interface FeedListProps {
  email: string;
  isAuthenticated: boolean;
}
export const FeedList: React.FC<FeedListProps> = ({
  email,
  isAuthenticated,
}) => {
  //useState is useful because calling its update function will trigger re-render
  const [articles, setArticles] = useState<Articles>({});
  const [feedVisibility, setFeedVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  //request to allAritcles endpoint for articles
  const getArticles = async () => {
    console.log("gettingarticles");
    try {
      if (email !== "") {
        //get users followed feeds by email
      }
      const res = await api.get("/");
      console.log("fetched articles: ", res.data);
      setArticles(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  //get articles on mount and when isAuthenticated refreshes
  useEffect(() => {
    if (isAuthenticated) {
      getArticles();
    }
  }, [isAuthenticated]);

  const toggleFeedVisibility = (feedIndex: string) => {
    setFeedVisibility((prev: { [key: string]: boolean }) => ({
      ...prev,
      [feedIndex]: !prev[feedIndex],
    }));
  };
  return (
    <div className="h-[95vh]">
      <div
        id="feed-list"
        className="max-w-96 h-[100%] h-max-[100%] overflow-scroll overflow-x-hidden rounded ml-3 p-3 border-2 border-gray-400 bg-neutral-900"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold ml-3 text-gray-400">
            <span>
              <FontAwesomeIcon className="text-lg mr-1" icon={faSquareRss} />
            </span>
            Feeds
          </h2>
          <Menu callGetArticles={getArticles} />
        </div>

        {Object.entries(articles).map(
          ([feedIndex, feedArray]: [string, ArticleItem[]]) => (
            <div
              key={feedIndex}
              className={`max-w-96 rounded pl-3 pr-3 ${
                feedVisibility[feedIndex]
                  ? "border bg-black"
                  : "border border-transparent"
              }`}
            >
              <div
                className="h-7 flex justify-between items-center relative"
                onClick={() => toggleFeedVisibility(feedIndex)}
              >
                <h3
                  className={`overflow-x cursor-pointer text-base select-none whitespace-nowrap text-clip pr-3
                  ${
                    feedVisibility[feedIndex] ? "text-amber-300" : "text-white"
                  }`}
                >
                  {feedIndex.length > 27 ? (
                    <span>{feedIndex.substring(0,27).concat('...')}</span>
                  ): 
                (feedIndex)}
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
