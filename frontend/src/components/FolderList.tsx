
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import FeedList from './FeedList';

interface Feeds {
  [key: string]: any;
}

interface FolderListProps {
  populatedFolders: { [key: string]: { isOpen: boolean; feeds: Feeds } };
  toggleFolderOpen: (folderName: string) => void;
  isEditable: boolean;
  updateSelectedItems: (e: any, feedIndex: string) => void;
  updateFeedName: (e: React.ChangeEvent<HTMLInputElement>, feedIndex: string) => void;
  feedNames: { [key: string]: string };
  showSaveBtn: { [key: string]: boolean };
  sendFeedNames: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => Promise<void>;
  isParsing: { [key: string]: boolean };
  feedVisibility: { [key: string]: boolean };
  toggleFeedVisibility: (feedIndex: string) => Promise<void>;
  folders: { [feedName: string]: string | null };
}

const FolderList: React.FC<FolderListProps> = ({
  populatedFolders,
  toggleFolderOpen,
  isEditable,
  updateSelectedItems,
  updateFeedName,
  feedNames,
  showSaveBtn,
  sendFeedNames,
  isParsing,
  feedVisibility,
  toggleFeedVisibility,
  folders
}) => {
  return (
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
                  onClick={() => { }}
                  // onChange={(e) => updateFolderName(e, folderName)}
                  readOnly={!isEditable}
                ></input>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="ml-3 border-l border-neutral-500">
              {folderContent.isOpen &&
                <FeedList
                  feeds={populatedFolders[folderName].feeds}
                  setFeeds={() => { }}
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
  );
};

export default FolderList;