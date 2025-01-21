import { useEffect, useState } from "react";
import { ArticleItem, Feeds } from "../interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareRss } from "@fortawesome/free-solid-svg-icons";
import FeedMenu from "./FeedMenu";
import api from "../api";
import LoadingAnimation from "./LoadingAnimation";
import FeedList from './FeedList';
import SortingMenu from "./SortingMenu";
import FolderList from "./FolderList";
import useFeedEditing from "../hooks/useFeedEditing";
import Introduction from "./Introduction";

interface FeedListProps {
  isAuthenticated: boolean;
}

export const FeedContainer: React.FC<FeedListProps> = ({ isAuthenticated }) => {
  const [feeds, setFeeds] = useState<Feeds>({});
  const [feedVisibility, setFeedVisibility] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortMenu, setSortMenu] = useState<boolean>(false);
  const [showSaveBtn, setShowSaveBtn] = useState<{ [key: string]: boolean }>({});
  const [feedNames, setFeedNames] = useState<{ [key: string]: string }>({});
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const [isParsing, setIsParsing] = useState<{ [key: string]: boolean }>({});
  const [folders, setFolders] = useState<{ [feedName: string]: string | null }>({});
  const [populatedFolders, setPopulatedFolders] = useState<any>({});

  const {
    selectedFeeds,
    setSelectedFeeds,
    isEditable,
    setIsEditable,
    sortFeeds,
    updateSelectedItems,
    deleteSelected,
    updateFeedName,
    sendFeedNames,
  } = useFeedEditing(feedNames, setFeedNames, feeds, setFeeds, populatedFolders, setPopulatedFolders, showSaveBtn, setShowSaveBtn, folders, setFolders);

  useEffect(() => {
    const filtered = Object.entries(populatedFolders).filter(([key]) => key !== 'isOpen');
    const newFeeds: any = {};
    filtered.forEach(item => {
      newFeeds[item[0]] = [];
    });
  }, [populatedFolders]);

  useEffect(() => {
    if (isAuthenticated) {
      getFeedNames();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let feedNames: { [key: string]: string } = {};
    Object.keys(feeds).map((name) => {
      feedNames[name] =
        name.length > 27 ? name.substring(0, 27).concat("...") : name;
    });
    setFeedNames(feedNames);
    storeFeedsInFolders();
  }, [feeds]);

  const toggleFeedVisibility = async (feedIndex: string) => {
    if (!isEditable) {
      setFeedVisibility((prev: { [key: string]: boolean }) => ({
        ...prev,
        [feedIndex]: !prev[feedIndex],
      }));
    }

    if (feeds[feedIndex].length === 0) {
      const name = feedIndex;
      const url = urls[feedIndex];
      setIsParsing({ ...isParsing, [name]: true });
      try {
        const res = await api.post('/feed/getRenderedFeedData', { name, url });
        const data = Object.entries(res.data)[0][1] as ArticleItem[];
        const newFeedsObj: Feeds = { ...feeds, [feedIndex]: data };
        setFeeds(newFeedsObj);
      } catch (err) {
        console.error(err);
      }
      setIsParsing({ ...isParsing, [name]: false });
    }
  };

  const removeAllSaveButtons = () => {
    let showSaveDefault: { [key: string]: boolean } = {};
    Object.keys(feeds).map((name) => {
      showSaveDefault[name] = false;
    });
    setShowSaveBtn(showSaveDefault);
  };

  const closeAllFeeds = () => {
    const closedFeeds = Object.keys(feedVisibility).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    setFeedVisibility(closedFeeds);
  };

  const getFeedNames = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/feed/getFeedNames');
      const feedsObj: Record<string, []> = {};
      res.data[1].forEach((name: string) => {
        feedsObj[name] = [];
      });
      const urls: { [key: string]: string } = {};
      let index = 0;
      res.data[0].forEach((url: string) => {
        urls[Object.keys(feedsObj)[index]] = url;
        index++;
      });
      const folders: { [key: string]: string | null } = {};
      index = 0;
      res.data[2].forEach((folder: string | null) => {
        folders[Object.keys(feedsObj)[index]] = folder;
        index++;
      });
      setFolders(folders);
      setUrls(urls);
      setFeeds(feedsObj);
    } catch (err) {
      console.error('error getting feed names or setting feed names to article', err);
    }
    setIsLoading(false);
  };

  const storeFeedsInFolders = () => {
    const tempPopulatedFolders: any = {};
    Object.keys(feeds).forEach((name) => {
      if (folders[name]) {
        const folderName = folders[name];
        if (folderName === null) { return; }
        let newFeeds: Feeds = { ...(tempPopulatedFolders[folderName]?.feeds || {}) };
        newFeeds[name] = Object.values(feeds[name]);
        tempPopulatedFolders[folderName] = {
          feeds: newFeeds,
          isOpen: (populatedFolders[folderName]?.isOpen) ? true : false
        };
      }
    });
    setPopulatedFolders(tempPopulatedFolders);
  };

  const toggleFolderOpen = (folderName: string) => {
    setPopulatedFolders((prevFolders: { [key: string]: { feeds: Feeds, isOpen: boolean } }) => {
      const newFolders: { [key: string]: { feeds: Feeds, isOpen: boolean } } = { ...prevFolders };
      newFolders[folderName] = {
      ...newFolders[folderName],
      isOpen: !newFolders[folderName].isOpen
      };
      return newFolders;
    });
  };

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
            <SortingMenu
              sortMenu={sortMenu}
              setSortMenu={setSortMenu}
              sortFeeds={sortFeeds}
            />
          </div>
          <FeedMenu
            callGetFeeds={getFeedNames}
            closeAllFeeds={closeAllFeeds}
            feeds={feeds}
            selectedFeeds={selectedFeeds}
            setSelectedFeeds={setSelectedFeeds}
            setIsEditable={setIsEditable}
            isEditable={isEditable}
            deleteSelected={deleteSelected}
            folders={folders}
            getFeedNames={getFeedNames}
          />
        </div>
        <LoadingAnimation isLoading={isLoading} />
        {Object.values(folders).filter((value) => value === null).length > 0 &&
          <hr className="border-neutral-500 mb-2 mt-1" />
        }
        <FeedList
          feeds={feeds}
          setFeeds={setFeeds}
          isEditable={isEditable}
          updateSelectedItems={updateSelectedItems}
          updateFeedName={updateFeedName}
          feedNames={feedNames}
          showSaveBtn={showSaveBtn}
          sendFeedNames={sendFeedNames}
          folders={folders}
          feedVisibility={feedVisibility}
          toggleFeedVisibility={toggleFeedVisibility}
          isParsing={isParsing}
          isInFolder={false}
        />
        <hr className="border-neutral-500 mb-2 mt-2" />
        {Object.entries(feedNames).length === 0 && (
          <Introduction />
        )}

        <FolderList
          populatedFolders={populatedFolders}
          toggleFolderOpen={toggleFolderOpen}
          isEditable={isEditable}
          updateSelectedItems={updateSelectedItems}
          updateFeedName={updateFeedName}
          feedNames={feedNames}
          showSaveBtn={showSaveBtn}
          sendFeedNames={sendFeedNames}
          isParsing={isParsing}
          feedVisibility={feedVisibility}
          toggleFeedVisibility={toggleFeedVisibility}
          folders={folders}
        />
      </div>
    </>
  );
};

export default FeedContainer;
