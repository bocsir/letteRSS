import { useEffect, useState } from "react";
import { ArticleItem, Articles } from "../interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareRss,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import Feed from "../components/Feed";
import FeedMenu from "./FeedMenu";
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
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [newFeedName, setNewFeedName] = useState<{[key: string]: string}>({});

  useEffect(() => {
    let feedNames: {[key: string]: string} = {};
    Object.keys(articles).map(name => {
      feedNames[name] = name.length > 27 ? name.substring(0,27).concat('...') : name;
    });
    setNewFeedName(feedNames);
  }, [articles])

  const updateFeedName = (e: React.ChangeEvent<HTMLInputElement>, feedIndex: string) => {
    const updatedFeedName: {[key: string]: string} = {
      ...newFeedName,
      [feedIndex]: e.target.value,
    };
    setNewFeedName(updatedFeedName);
  }
  
  const closeAllFeeds = () => {
    const closedFeeds = Object.keys(feedVisibility).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    setFeedVisibility(closedFeeds);
  };

  //request to allAritcles endpoint for articles
  const getArticles = async () => {
    try {
      const res = await api.get("/");
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
          <FeedMenu
            callGetArticles={getArticles}
            closeAllFeeds={closeAllFeeds}
            articles={articles}
            setIsEditable={setIsEditable}
          />
        </div>

        {Object.entries(articles).map(
          ([feedIndex, feedArray]: [string, ArticleItem[]]) => (
            <div
              key={feedIndex}
              className={`max-w-96 rounded pl-3 pr-3 border-2
              ${
                feedVisibility[feedIndex]
                  ? "border-gray-400 bg-black"
                  : "border-transparent"
              }`}
            >
              <div
                className="h-6 flex justify-between items-center relative cursor-pointer"
                onClick={() => toggleFeedVisibility(feedIndex)}
              >
                <input
                  type="text"
                  className={`focus:outline-none bg-transparent overflow-x cursor-pointer text-base select-none whitespace-nowrap text-clip w-full pr-3
                  ${
                    feedVisibility[feedIndex] ? "text-amber-300" : "text-white"
                  }`}
                  
                  value={newFeedName[feedIndex]}
                  
                  onChange={(e) => updateFeedName(e, feedIndex)}
                  readOnly={!isEditable}
                  >                  
                </input>
                <button
                  className={`text-sm pl-2 font-bold relative z-1 ${
                    feedVisibility[feedIndex] ? "text-amber-300" : "text-white"
                  }`}
                >
                  {feedVisibility[feedIndex] ? (
                    <FontAwesomeIcon icon={faMinus}/>
                  ) : (
                    <FontAwesomeIcon icon={faPlus}/>
                  )}
                </button>
              </div>
              {feedVisibility[feedIndex] && (
                <div className="font-semibold flex flex-col ml-3">
                  {feedArray.map((item: ArticleItem) => (
                    <Feed item={item.item}/>
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
