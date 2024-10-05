import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArticleItem, Feeds } from "../interfaces";
import Feed from "./Feed";

interface FeedListProps {
  feeds: Feeds;
  setFeeds: React.Dispatch<React.SetStateAction<Feeds>>;
  isEditable: boolean;
  updateSelectedItems: (e: any, feedIndex: string) => void;
  feedNames: {
    [key: string]: string;
  };
  updateFeedName: (
    e: React.ChangeEvent<HTMLInputElement>,
    feedIndex: string
  ) => void;
  showSaveBtn: {
    [key: string]: boolean;
  };
  sendFeedNames: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    name: string
  ) => Promise<void>;
  folders: {
    [key: string]: string | null;
  };
  isInFolder: boolean;
  feedVisibility: {
    [key: string]: boolean;
  };
  toggleFeedVisibility: (feedIndex: string) => Promise<void>;
  isParsing: {
    [key: string]: boolean;
  };
}
const FeedList: React.FC<FeedListProps> = ({
  feeds,
  isEditable,
  updateSelectedItems,
  feedNames,
  updateFeedName,
  showSaveBtn,
  sendFeedNames,
  folders,
  isInFolder,
  isParsing,
  feedVisibility,
  toggleFeedVisibility
}) => {

  const preventFeedOpenOnEdit = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    if (isEditable) {
      e.stopPropagation();
    }
  }


  return (
    <>
      {Object.entries(feeds).filter(([feedIndex, feedArray]: [string, ArticleItem[]]) => (isInFolder || !(folders[feedIndex]))).map(
        ([feedIndex, feedArray]: [string, ArticleItem[]]) => (

          <div
            key={feedIndex}
            className={`max-w-96 rounded pl-3 pr-3 border-2 ${isInFolder ? "ml-2" : "ml-0"}
              ${feedVisibility[feedIndex]
                ? "border-neutral-500 bg-black"
                : "border-transparent"
              }`}
          >
            <div
              className={`h-6 flex justify-between items-center relative ${!isEditable ? "cursor-pointer" : ""
                }`}
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
                className={`no-select relative focus:outline-none overflow-x cursor-pointer text-base whitespace-nowrap text-clip w-full pr-3
                      ${feedVisibility[feedIndex]
                    ? "text-amber-300"
                    : "text-white"
                  }
                      ${isEditable
                    ? " pl-1 rounded bg-neutral-500 cursor-text"
                    : "bg-transparent "
                  }`}
                // feedNames[feedIndex] || ''
                value={feedNames[feedIndex] || ""}
                onClick={preventFeedOpenOnEdit}
                onChange={(e) => updateFeedName(e, feedIndex)}
                readOnly={!isEditable}
              ></input>
              {showSaveBtn[feedIndex] && (
                <button
                  onClick={(e) => {
                    sendFeedNames(e, feedIndex);
                  }}
                  type="submit"
                  className="flex items-center text-white h-min leading-3 p-1 rounded bg-neutral-900 hover:text-amber-300 transition-color duration-150 ease-in-out text-base flex items-center absolute right-2"
                >
                  save
                </button>
              )}
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
                  <div className="flex justify-center items-center z-50 w-full h-full mb-3 mt-3">
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
    </>
  );
};

export default FeedList;
