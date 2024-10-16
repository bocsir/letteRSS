import { useEffect, useState } from "react";
import { ArticleItem, Feeds } from "../interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareRss,
  faSort,
  faArrowDownZA,
  faArrowDownAZ,
  faFolder,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
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
  const [feeds, setFeeds] = useState<Feeds>({});
  const [feedVisibility, setFeedVisibility] = useState<{
    [key: string]: boolean;
  }>({});
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortMenu, setSortMenu] = useState<boolean>(false);

  //this is gross and should be one object probably
  const [feedNames, setFeedNames] = useState<{ [key: string]: string }>({});
  const [showSaveBtn, setShowSaveBtn] = useState<{ [key: string]: boolean }>({});
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const [isParsing, setIsParsing] = useState<{ [key: string]: boolean }>({});
  const [folders, setFolders] = useState<{ [feedName: string]: string | null }>({});

  type FolderContent = {
    feeds: { [feedName: string]: ArticleItem[] };
    isOpen: boolean;
  }

  type PopFolders = {
    [folderName: string]: FolderContent;
  }

  const [populatedFolders, setPopulatedFolders] = useState<PopFolders>({});

  useEffect(() => {
    const filtered = Object.entries(populatedFolders).filter(([key]) => key !== 'isOpen');

    const newFeeds: any = {};
    filtered.forEach(item => {
      newFeeds[item[0]] = []
    });

  }, [populatedFolders]);

  //get feeds on mount and when isAuthenticated refreshes
  useEffect(() => {
    if (isAuthenticated) {
      getFeedNames();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    //update FeedNames when feeds changes
    let feedNames: { [key: string]: string } = {};
    Object.keys(feeds).map((name) => {
      feedNames[name] =
        name.length > 27 ? name.substring(0, 27).concat("...") : name;

    });
    setFeedNames(feedNames);

    removeAllSaveButtons();

    storeFeedsInFolders();
  }, [feeds]);

  //will call server to render feeds if feed not already rendered
  const toggleFeedVisibility = async (feedIndex: string) => {
    //parse feeds at that index
    //**need to make sure when names are edited the changes are reflected in urls
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
        const res = await api.post('/feed/getRenderedFeedData',
          {
            name: name,
            url: url,
          }
        )
        const data = Object.entries(res.data)[0][1] as ArticleItem[];
        const newFeedsObj: Feeds = {
          ...feeds,
          [feedIndex]: data
        }
        setFeeds(newFeedsObj);
      } catch (err) {
        console.error(err);
      }
      setIsParsing({ ...isParsing, [name]: false });
    }
  }

  //feed editing ---
  const sortFeeds = (isAlphabetical: boolean) => {
    const currentFeeds: string[] = [];

    Object.keys(feeds).map((name) => {
      currentFeeds.push(feedNames[name]);
    });

    const sortedFeeds = (isAlphabetical)
      ? currentFeeds.sort((a, b) => a.localeCompare(b))
      : currentFeeds.sort((a, b) => b.localeCompare(a));

    const sortedObj: Record<string, null> = {};
    sortedFeeds.forEach(item => {
      sortedObj[item] = null;
    });

    //use the shape of sorted feeds to reorganize feeds;
    const newFeedsObj = Object.assign(sortedObj, feeds);
    setSortMenu(false);
    setFeeds(newFeedsObj);
  }

  const updateSelectedItems = (e: any, feedIndex: string) => {
    let newFeeds;
    //delete if unckecked, add if checked
    if (e.target.checked) {
      newFeeds = [
        ...selectedFeeds,
        feedIndex
      ]
    } else {
      newFeeds = selectedFeeds.filter(item => item !== feedIndex);
    }
    setSelectedFeeds(newFeeds);
  }

  //delete selectedFeeds from database using their key if key: true
  const deleteSelected = async () => {
    if (selectedFeeds.length === 0) {
      return;
    }

    const res = await api.post('/feed/deleteFeeds', selectedFeeds);
    if (res.status === 200) {
      selectedFeeds.map(item => {
        delete feeds[item]
        Object.keys(populatedFolders).forEach((name) => {
          delete populatedFolders[name].feeds[item];
        });
        setSelectedFeeds([]);
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
      [feedIndex]: (feedNames[newName]) ? false : true
    }

    setShowSaveBtn(updatedSaveBtnStatus);

    setFeedNames(updatedFeedName);
  }

  // const updatefolderName = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   folderName: string
  // ) => {
  //   const newName = e.target.value;

  //   const updatedFeedName: { [key: string]: string } = {
  //     ...feedNames,
  //     [feedIndex]: newName,
  //   };


  //   const updatedSaveBtnStatus = {
  //     ...showSaveBtn,
  //     [feedIndex]: (feedNames[newName]) ? false : true
  //   }

  //   setShowSaveBtn(updatedSaveBtnStatus);

  //   setFeedNames(updatedFeedName);
  // }



  const removeAllSaveButtons = () => {
    let showSaveDefault: { [key: string]: boolean } = {};
    Object.keys(feeds).map((name) => {

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

  //end of feed editing ---

  //request to allAritcles endpoint for feeds
  const getFeedNames = async () => {
    setIsLoading(true);

    try {
      const res = await api.get('/feed/getFeedNames');

      //create default feeds object to be filled with data when an article is clicked and parsed
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
        folders[Object.keys(feedsObj)[index]] = folder
        index++;
      });

      setFolders(folders);
      setUrls(urls);
      setFeeds(feedsObj);
    } catch (err) {
      console.error('error getting feed names or setting feed names to article', err);
    }
    setIsLoading(false);
  }

  const sendFeedNames = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
    e.stopPropagation();

    //hide save button
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [name]: false
    }
    setShowSaveBtn(updatedSaveBtnStatus);

    //change the key for feeds
    let newFeeds: Feeds = { ...feeds, [feedNames[name]]: feeds[name] };
    delete newFeeds[name];
    setFeeds(newFeeds);

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
  }

  const storeFeedsInFolders = () => {
    const tempPopulatedFolders: PopFolders = {}
    Object.keys(feeds).forEach((name) => {
      if (folders[name]) {
        const folderName = folders[name];
        if (folderName === null) {return;}

        let newFeeds: Feeds = { ...(tempPopulatedFolders[folderName]?.feeds || {}) };
        newFeeds[name] = Object.values(feeds[name]);

        tempPopulatedFolders[folderName] = {
          feeds: newFeeds,
          isOpen: (populatedFolders[folderName]?.isOpen) ? true : false
        }
      }
    })
    setPopulatedFolders(tempPopulatedFolders);
  };

  //toggle isOpen property. called on folder click
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
                  className="flex font-bold items-center justify-around absolute left-4 top-0 z-20 bg-neutral-900 border-2 border-neutral-500 rounded-md w-max"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => sortFeeds(true)}
                    className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
                  >
                    <FontAwesomeIcon icon={faArrowDownAZ} />
                  </button>
                  <div className="w-[2px] h-[24px] bg-neutral-500"></div>
                  <button
                    onClick={() => sortFeeds(false)}
                    className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
                  >
                    <FontAwesomeIcon icon={faArrowDownZA} />
                  </button>

                </div>
              )}
            </div>
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
        <div className="flex flex-col">
          {Object.entries(populatedFolders).map(
            ([folderName, folderContent]) => (
              <div key={folderName}>
                <div
                  onClick={() => toggleFolderOpen(folderName)}
                  className="select-none text-base cursor-pointer pl-3 border-2 border-transparent flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {folderContent.isOpen ? (
                      <FontAwesomeIcon icon={faFolderOpen} />
                    ) : (
                      <FontAwesomeIcon className="w-[18px]" icon={faFolder} />
                    )}
                    <input
                      type="text"
                      maxLength={50}
                      className={`bg-transparent no-select relative focus:outline-none overflow-x cursor-pointer text-base whitespace-nowrap text-clip w-full pr-3`}
                      value={folderName}
                      onClick={()=>{}}
                      // onChange={(e) => updateFolderName(e, folderName)}
                      readOnly={!isEditable}
                    ></input>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="ml-3 border-l border-neutral-500">
                  {folderContent.isOpen &&
                    <FeedList
                      feeds={populatedFolders[folderName].feeds}
                      setFeeds={setFeeds}
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