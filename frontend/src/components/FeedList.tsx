import { useEffect, useState } from "react";
import { ArticleItem, Articles } from "../interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareRss,
  faPlus,
  faMinus,
  faSort,
  faArrowDownZA,
  faArrowDownAZ,
} from "@fortawesome/free-solid-svg-icons";
import Feed from "../components/Feed";
import FeedMenu from "./FeedMenu";
import api from "../api";
import LoadingAnimation from "./LoadingAnimation";

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
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortMenu, setSortMenu] = useState<boolean>(false);
//these should all be one object i think:
  const [feedNames, setFeedNames] = useState<{ [key: string]: string }>({});
  const [showSaveBtn, setShowSaveBtn] = useState<{ [key: string]: boolean }>({});
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const [isParsing, setIsParsing] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    //update FeedNames when articles changes
    let feedNames: { [key: string]: string } = {};
    Object.keys(articles).map((name) => {
      feedNames[name] =
        name.length > 27 ? name.substring(0, 27).concat("...") : name;

    });
    setFeedNames(feedNames);

    removeAllSaveButtons();
    console.log('articles: ', articles);
  }, [articles]);

  const sortArticles = (isAlphabetical: boolean) => {
    const currentArticles: string[] = [];

    Object.keys(articles).map((name) => {
      currentArticles.push(feedNames[name]);
    });

    const sortedArticles = (isAlphabetical)
      ? currentArticles.sort((a, b) => a.localeCompare(b))
      : currentArticles.sort((a, b) => b.localeCompare(a));

    const sortedObj = createObjTemplate(sortedArticles);
    const newArticlesObj = Object.assign(sortedObj, articles);
    setArticles(newArticlesObj);
  }

  const createObjTemplate = (arr: string[]): Record<string, null> => {
    const obj: Record<string, null> = {};
    arr.forEach(item => {
      obj[item] = null;
    });
    return obj;
  }

  const updateSelectedItems = (e: any, feedIndex: string) => {
    let newFeeds;

    //delete if unckecked, add if checked
    if (e.target.checked) {
      newFeeds = [
        ...selectedArticles,
        feedIndex
      ]
    } else {
      newFeeds = selectedArticles.filter(item => item !== feedIndex);
    }
    setSelectedArticles(newFeeds);
  }

  //delete selectedArticles from database using their key if key: true
  const deleteSelected = async () => {
    if (selectedArticles.length === 0) {
      return;
    }

    const res = await api.post('/feed/deleteArticles', selectedArticles);
    console.log(res);
    if (res.status === 200) {
      selectedArticles.map(item => {
        delete articles[item]
        setSelectedArticles([]);
        setIsEditable(false);
      });
    }
  }

  const updateFeedName = (
    e: React.ChangeEvent<HTMLInputElement>,
    feedIndex: string
  ) => {
    const newName = e.target.value;
    const updatedFeedName: { [key: string]: string } = {
      ...feedNames,
      [feedIndex]: newName,
    };
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [feedIndex]: true
    }

    setShowSaveBtn(updatedSaveBtnStatus);
    setFeedNames(updatedFeedName);
  };

  const removeAllSaveButtons = () => {
    let showSaveDefault: { [key: string]: boolean } = {};
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
  const getFeedNames = async () => {
    setIsLoading(true);

    try {
      const res = await api.get('/feed/getFeedNames');

      const articlesObj: Record<string, []> = {};
      res.data[1].forEach((name: string) => {
        articlesObj[name] = [];
      });
      const urls: { [key: string]: string } = {};
      let index = 0;
      res.data[0].forEach((url: string) => {
        urls[Object.keys(articlesObj)[index]] = url;
        index++;
      });
      setUrls(urls);
      setArticles(articlesObj);
    } catch (err) {
      console.error('error getting feed names or setting feed names to article', err);
    }
    setIsLoading(false);
  };

  //get articles on mount and when isAuthenticated refreshes
  useEffect(() => {
    if (isAuthenticated) {
      getFeedNames();
    }
  }, [isAuthenticated]);

  //gets parsed feed or just toggles if already parsed
  const toggleFeedVisibility = async (feedIndex: string) => {
    //parse articles at that index
    //**need to make sure when names are edited the changes are reflected in urls
    if (!isEditable) {
      setFeedVisibility((prev: { [key: string]: boolean }) => ({
        ...prev,
        [feedIndex]: !prev[feedIndex],
      }));
    }

    if (articles[feedIndex].length === 0) {
      const name = feedIndex;
      const url = urls[feedIndex];

      setIsParsing({...isParsing, [name]: true});
      try {
        const res = await api.post('/feed/getRenderedFeedData',
          {
            name: name,
            url: url,
          }
        )
        const data = Object.entries(res.data)[0][1] as ArticleItem[];
        const newArticlesObj: Articles = {
          ...articles,
          [feedIndex]: data
        }
        setArticles(newArticlesObj);
      } catch (err) {
        console.error(err);
      }
      setIsParsing({...isParsing, [name]: false});
    }

  };

  const preventFeedOpenOnEdit = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    if (isEditable) {
      e.stopPropagation();
    }
  };

  const sendFeedNames = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
    e.stopPropagation();

    //hide save button
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [name]: false
    }
    setShowSaveBtn(updatedSaveBtnStatus);

    //change the key for articles
    let newArticles: Articles = {...articles, [feedNames[name]]:articles[name]};
    delete newArticles[name];
    setArticles(newArticles);

    //change the key for urls
    let newUrls: {[key: string]: string} = {...urls, [feedNames[name]]:urls[name]};
    delete newUrls[name];

    setUrls(newUrls);

    const res = await api.post(
      "/feed/changeFeedName",
      {
        newName: feedNames[name],
        oldName: name
      }
    );
    console.log(res);
  }

  return (
    <>
      <div
        id="feed-list"
        className="max-w-96 h-[90vh] h-max-[100%] overflow-scroll overflow-x-hidden rounded ml-2 mr-2 sm:ml-3 p-3 border-2 border-neutral-500 bg-neutral-900"
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h2 className="text-lg font-bold ml-3 text-neutral-500">
              <span>
                <FontAwesomeIcon className="text-lg mr-1" icon={faSquareRss} />
              </span>
              Feeds
            </h2>
            <div className="relative">
              <FontAwesomeIcon
                onClick={() => setSortMenu(!sortMenu)}
                className="text-base text-neutral-500 cursor-pointer active:text-yellow-500" icon={faSort} />
              {sortMenu && (
                <div
                  className="flex flex-col font-bold items-center justify-around absolute left-4 top-0 z-20 bg-neutral-900 border-2 border-neutral-500 rounded-md w-max"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => sortArticles(true)}
                    className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
                  >
                    <FontAwesomeIcon icon={faArrowDownAZ} />
                  </button>
                  <hr className="border-neutral-500 border-inset border-1 w-full" />
                  <button
                    onClick={(e) => sortArticles(false)}
                    className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
                  >
                    <FontAwesomeIcon icon={faArrowDownZA} />
                  </button>

                </div>
              )}

            </div>
          </div>
          <FeedMenu
            callGetArticles={getFeedNames}
            closeAllFeeds={closeAllFeeds}
            articles={articles}
            setIsEditable={setIsEditable}
            isEditable={isEditable}
            deleteSelected={deleteSelected}
          />
        </div>
        <LoadingAnimation isLoading={isLoading} />

        {Object.entries(articles).map(
          ([feedIndex, feedArray]: [string, ArticleItem[]]) => (
            < div
              key={feedIndex}
              className={`max-w-96 rounded pl-3 pr-3 border-2
              ${feedVisibility[feedIndex]
                  ? "border-neutral-500 bg-black"
                  : "border-transparent"
                }`}
            >
              <div
                className={`h-6 flex justify-between items-center relative ${!isEditable ? "cursor-pointer" : ""}`}
                onClick={() => toggleFeedVisibility(feedIndex)}
              >
                {isEditable && (
                  <input
                    type="checkbox"
                    onClick={(e) => updateSelectedItems(e, feedIndex)}
                    className="mr-2 accent-yellow-400 focus:ring-yellow-400 focus:ring-1 cursor-pointer"
                  />
                )}
                <input
                  type="text"
                  maxLength={50}
                  className={`relative focus:outline-none overflow-x cursor-pointer text-base select-none whitespace-nowrap text-clip w-full pr-3
                      ${feedVisibility[feedIndex]
                      ? "text-amber-300"
                      : "text-white"
                    }
                      ${isEditable
                      ? " pl-1 rounded bg-neutral-500 cursor-text"
                      : "bg-transparent "
                    }`}
                  value={feedNames[feedIndex] || ''}
                  onClick={preventFeedOpenOnEdit}
                  onChange={(e) => updateFeedName(e, feedIndex)}
                  readOnly={!isEditable}
                ></input>
                {showSaveBtn[feedIndex] && (
                  <button
                    onClick={(e) => { sendFeedNames(e, feedIndex) }}
                    type="submit"
                    className="flex items-center text-white h-min leading-3 p-1 rounded bg-neutral-900 hover:text-amber-300 transition-color duration-150 ease-in-out text-base flex items-center absolute right-2"
                  >
                    save
                  </button>
                )}
                {/* <FontAwesomeIcon className="absolute text-xs right-8" icon={faPen}/> */}

                {!isEditable && (
                  <button
                    className={`text-sm pl-2 font-bold relative z-1 ${feedVisibility[feedIndex]
                      ? "text-yellow-500"
                      : "text-neutral-500"
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
                <>
                  {isParsing[feedIndex] && (
                    <div className="flex justify-center items-center z-50 w-full h-full mb-3 mt-3" >
                      <div className="flex flex-row gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce"></div>
                        <div className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce [animation-delay:-.3s]"></div>
                        <div className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce [animation-delay:-.5s]"></div>
                      </div>
                    </div>

                  )}
                  <div className="font-semibold flex flex-col ml-3">
                    {feedArray.map((item: ArticleItem) => (
                      <Feed key={item.item.link} item={item.item} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        )}
      </div >
    </>
  );
};
