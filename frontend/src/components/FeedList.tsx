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
import axios from "axios";

interface FeedListProps {
  isAuthenticated: boolean;
}

export const FeedList: React.FC<FeedListProps> = ({
  isAuthenticated,
}) => {
  //useState is useful because calling its update function will trigger re-render
  const [articles, setArticles] = useState<Articles>({});
  const [feedVisibility, setFeedVisibility] = useState<{
    [key: string]: boolean;
  }>({});
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [feedNames, setFeedNames] = useState<{ [key: string]: string }>({});
  const [showSaveBtn, setShowSaveBtn] = useState<{ [key: string]: boolean}>({});

  useEffect(() => {
    let feedNames: { [key: string]: string } = {};
    Object.keys(articles).map((name) => {
      feedNames[name] =
        name.length > 27 ? name.substring(0, 27).concat("...") : name;

    });
    setFeedNames(feedNames);

    removeAllSaveButtons();
  }, [articles]);

  const updateFeedName = (
    e: React.ChangeEvent<HTMLInputElement>,
    feedIndex: string
  ) => {
    const updatedFeedName: { [key: string]: string } = {
      ...feedNames,
      [feedIndex]: e.target.value,
    };
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [feedIndex]: true
    }
    setShowSaveBtn(updatedSaveBtnStatus);
    setFeedNames(updatedFeedName);
  };

  const removeAllSaveButtons = () => {
    let showSaveDefault: { [key: string]: boolean} = {};
    Object.keys(articles).map((name) => {

      showSaveDefault[name] = false;
    });
    setShowSaveBtn(showSaveDefault);
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
      const res = await api.get("/feed/");
      console.log('/feed/ response: ', res);
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

  const preventFeedOpenOnEdit = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    if (isEditable) {
      e.stopPropagation();
    }
  };

  const sendFeedNames = async(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
    e.stopPropagation();
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [name]: false
    }

    setShowSaveBtn(updatedSaveBtnStatus);

    const res = await axios.post(
      "http://localhost:3000/feed/changeFeedName",
      { 
        newName: feedNames[name],
        oldName: name
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
    console.log(res);
}

  return (
    <>
      <div
        id="feed-list"
        className="max-w-96 h-[90vh] h-max-[100%] overflow-scroll overflow-x-hidden rounded ml-2 mr-2 sm:ml-3 p-3 border-2 border-gray-400 bg-neutral-900"
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
            isEditable={isEditable}
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
                {isEditable && (
                  <input
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2 accent-yellow-400 focus:ring-yellow-400 focus:ring-1"
                  />
                )}
                <input
                  type="text"
                  maxLength={50}
                  className={`relative focus:outline-none overflow-x cursor-pointer text-base select-none whitespace-nowrap text-clip w-full pr-3
                      ${
                        feedVisibility[feedIndex]
                          ? "text-amber-300"
                          : "text-white"
                      }
                      ${
                        isEditable
                          ? " pl-1 rounded bg-black cursor-text"
                          : "bg-transparent "
                      }`}
                  value={feedNames[feedIndex] || ''}
                  onClick={preventFeedOpenOnEdit}
                  onChange={(e) => updateFeedName(e, feedIndex)}
                  readOnly={!isEditable}
                ></input>
                {showSaveBtn[feedIndex] && (
                  <button
                  onClick={(e) => {sendFeedNames(e, feedIndex)}}
                  type="submit"
                    className="flex items-center text-white h-min leading-3 p-1 rounded bg-neutral-900 hover:text-amber-300 transition-color duration-150 ease-in-out text-base flex items-center absolute right-2"
                  >
                    <p>save</p>
                  </button>
                )}
                {/* <FontAwesomeIcon className="absolute text-xs right-8" icon={faPen}/> */}

                {!isEditable && (
                  <button
                    className={`text-sm pl-2 font-bold relative z-1 ${
                      feedVisibility[feedIndex]
                        ? "text-amber-300"
                        : "text-gray-400"
                    }`}
                  >
                    {feedVisibility[feedIndex] ? (
                      <FontAwesomeIcon icon={faMinus} />
                    ) : (
                      <FontAwesomeIcon icon={faPlus} />
                    )}
                  </button>
                )}
              </div>
              {feedVisibility[feedIndex] && (
                <div className="font-semibold flex flex-col ml-3">
                  {feedArray.map((item: ArticleItem) => (
                    <Feed item={item.item} />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
};
