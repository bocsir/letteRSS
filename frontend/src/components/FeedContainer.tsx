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
  faFolder,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import Feed from "./Feed";
import FeedMenu from "./FeedMenu";
import api from "../api";
import LoadingAnimation from "./LoadingAnimation";
import FeedList from './FeedList';

interface FeedListProps {
  isAuthenticated: boolean;
}

export const FeedContainer: React.FC<FeedListProps> = ({
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

  //this is gross and should be one object probably
  const [feedNames, setFeedNames] = useState<{ [key: string]: string }>({});
  const [showSaveBtn, setShowSaveBtn] = useState<{ [key: string]: boolean }>({});
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const [isParsing, setIsParsing] = useState<{ [key: string]: boolean }>({});
  const [folders, setFolders] = useState<{ [key: string]: string | null }>({});

  type FolderContent = {
    feeds: { [feedName: string]: ArticleItem[] };
    isOpen: boolean;
  }
  type PopFolders = {
    [folderName: string]: FolderContent;
  }

  const [populatedFolders, setPopulatedFolders] = useState<PopFolders>({});
  const [articlesInFolder, setArticlesInFolder] = useState<Articles>({});

  useEffect(() => {
    const filtered = Object.entries(populatedFolders).filter(([key]) => key !== 'isOpen');

    const newArticles: any = {};
    filtered.forEach(item => {
      newArticles[item[0]] = []
    });

    setArticlesInFolder(newArticles);
    console.log(newArticles);
  }, [populatedFolders]);

  //get articles on mount and when isAuthenticated refreshes
  useEffect(() => {
    if (isAuthenticated) {
      getFeedNames();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    //update FeedNames when articles changes
    let feedNames: { [key: string]: string } = {};
    Object.keys(articles).map((name) => {
      feedNames[name] =
        name.length > 27 ? name.substring(0, 27).concat("...") : name;

    });
    setFeedNames(feedNames);

    removeAllSaveButtons();

    storeFeedsInFolders();
    console.log(articles);
  }, [articles]);

  //feed editing ---
  const sortArticles = (isAlphabetical: boolean) => {
    const currentArticles: string[] = [];

    Object.keys(articles).map((name) => {
      currentArticles.push(feedNames[name]);
    });

    const sortedArticles = (isAlphabetical)
      ? currentArticles.sort((a, b) => a.localeCompare(b))
      : currentArticles.sort((a, b) => b.localeCompare(a));

    const sortedObj: Record<string, null> = {};
    sortedArticles.forEach(item => {
      sortedObj[item] = null;
    });

    //use the shape of sorted articles to reorganize articles;
    const newArticlesObj = Object.assign(sortedObj, articles);
    setArticles(newArticlesObj);
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
  }

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
  }

  const preventFeedOpenOnEdit = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    if (isEditable) {
      e.stopPropagation();
    }
  }
  //end of feed editing ---

  //request to allAritcles endpoint for articles
  const getFeedNames = async () => {
    setIsLoading(true);

    try {
      const res = await api.get('/feed/getFeedNames');

      console.log(res.data);

      //create default articles object to be filled with data when an article is clicked and parsed
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

      const folders: { [key: string]: string | null } = {};
      index = 0;
      res.data[2].forEach((folder: string | null) => {
        folders[Object.keys(articlesObj)[index]] = folder
        index++;
      });

      console.log(folders);

      setFolders(folders);
      setUrls(urls);
      setArticles(articlesObj);
    } catch (err) {
      console.error('error getting feed names or setting feed names to article', err);
    }
    setIsLoading(false);
  }

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

      setIsParsing({ ...isParsing, [name]: true });
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
      setIsParsing({ ...isParsing, [name]: false });
    }

  }

  const sendFeedNames = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
    e.stopPropagation();

    //hide save button
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [name]: false
    }
    setShowSaveBtn(updatedSaveBtnStatus);

    //change the key for articles
    let newArticles: Articles = { ...articles, [feedNames[name]]: articles[name] };
    delete newArticles[name];
    setArticles(newArticles);

    //change the key for urls
    let newUrls: { [key: string]: string } = { ...urls, [feedNames[name]]: urls[name] };
    delete newUrls[name];
    setUrls(newUrls);

    //change the key for folders
    let newFolders: { [key: string]: string | null } = { ...folders, [feedNames[name]]: folders[name] };
    delete newFolders[name];
    setFolders(newFolders);

    const res = await api.post(
      "/feed/changeFeedName",
      {
        newName: feedNames[name],
        oldName: name
      }
    );
    console.log(res);
  }


  const storeFeedsInFolders = () => {
    const populatedFolders: PopFolders = {}

    Object.keys(articles).forEach((name) => {
      console.log(name);
      //if folders has a folder for the article, add that folder to populatedFolders and populate it
      console.log('filling feed');
      if (folders[name]) {
        const folderName = folders[name];
        console.log(folderName)
        if (!populatedFolders[folderName]) {
          populatedFolders[folderName] = {
            feeds: {},
            isOpen: false
          }
        } else {
          populatedFolders[folderName].isOpen = true
        }
        // Add the feed to the folder
        populatedFolders[folderName].feeds[name] = Object.values(articles[name]);

        console.log("feeds for ", name, ' ', populatedFolders);
      }
    })
    setPopulatedFolders(populatedFolders);
  };

  //toggle isOpen property
  const toggleFolderOpen = (folderName: string) => {
    setPopulatedFolders(prevFolders => {
      const newFolders = { ...prevFolders };
      newFolders[folderName] = {
        ...newFolders[folderName],
        isOpen: !newFolders[folderName].isOpen
      };
      return newFolders;
    });
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
                    onClick={() => sortArticles(false)}
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
        <FeedList
          articles={articles}
          toggleFeedVisibility={toggleFeedVisibility}
          feedVisibility={feedVisibility}
          isEditable={isEditable}
          updateSelectedItems={updateSelectedItems}
          updateFeedNames={updateFeedName}
          feedNames={feedNames}
          preventFeedOpenOnEdit={preventFeedOpenOnEdit}
          updateFeedName={updateFeedName}
          showSaveBtn={showSaveBtn}
          sendFeedNames={sendFeedNames}
          isParsing={isParsing}
          folders={folders}
          isInFolder={false}
        />

        <hr className="border border-neutral-500 m-3" />
        <div className="flex flex-col gap-2 ">
          {Object.entries(populatedFolders).map(
            ([folderName, folderContent]) => (
              <div key={folderName}>
                <div
                  onClick={() => toggleFolderOpen(folderName)}
                  className="select-none text-base cursor-pointer pl-3 border-2 border-transparent flex items-center justify-between"
                >
                  <span>
                    {folderContent.isOpen ? (
                      <FontAwesomeIcon icon={faFolderOpen} />
                    ) : (
                      <FontAwesomeIcon className="w-[18px]" icon={faFolder} />
                    )}{" "}{folderName}
                  </span>
                </div>
                <div className="ml-3 border-l">
                  {folderContent.isOpen &&
                    <FeedList
                      articles={populatedFolders[folderName].feeds}
                      toggleFeedVisibility={toggleFeedVisibility}
                      feedVisibility={feedVisibility}
                      isEditable={isEditable}
                      updateSelectedItems={updateSelectedItems}
                      updateFeedNames={updateFeedName}
                      feedNames={feedNames}
                      preventFeedOpenOnEdit={preventFeedOpenOnEdit}
                      updateFeedName={updateFeedName}
                      showSaveBtn={showSaveBtn}
                      sendFeedNames={sendFeedNames}
                      isParsing={isParsing}
                      folders={folders}
                      isInFolder={true}
                    />
                  }
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default FeedContainer;