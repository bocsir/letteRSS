//top section with menu to add feeds
//calling feedComponent logic could be a separate component

import axios from "axios";
// import opml from 'opml';
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEllipsis,
  faFileArrowUp,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Feeds } from "../interfaces";
import api from "../api";
import LoadingAnimation from "./LoadingAnimation";
import FolderMenu from "./FolderMenu";

interface FeedMenuProps {
  callGetFeeds: any;
  closeAllFeeds: any;
  feeds: Feeds;
  setIsEditable: any;
  isEditable: any;
  deleteSelected: any;
}
//somehow FeedMenu needs to tell FeedList to call getFeeds again
const FeedMenu: React.FC<FeedMenuProps> = ({
  callGetFeeds,
  closeAllFeeds,
  feeds,
  setIsEditable,
  isEditable,
  deleteSelected
}) => {
  const [newFeedMenuVis, setNewFeedMenuVis] = useState<boolean>(false);
  const [importHover, setImportHover] = useState<boolean>(false);
  const [file, setfile] = useState<File[]>();
  const [newFeedUrl, setNewFeedUrl] = useState<string>("");
  const [showUrlError, setShowUrlError] = useState<boolean>(false);
  const [urlNotFound, seturlNotFound] = useState<boolean>(false);
  const [menuVis, setMenuVis] = useState<boolean>(false);
  const [doneBtnVis, setDoneBtnVis] = useState<boolean>(false);
  const [menuBtnHover, setMenuBtnHover] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
  });
  const [isLaoding, setIsLoading] = useState<boolean>(false);

  const updateFeedUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setNewFeedUrl(e.target.value);
    setShowUrlError(false);
    seturlNotFound(false);
  };

  const updateMenuBtnHover = (index: number, isHovering: boolean) => {
    const menuBtnHoverStatus = {
      ...menuBtnHover,
      [index]: isHovering,
    };

    setMenuBtnHover(menuBtnHoverStatus);
  };

  const sendFile = async (e: FormEvent) => {
    setIsLoading(true);

    e.preventDefault();
    if (!file || file.length === 0) {
      alert("please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file[0]);

      const feedsJson = JSON.stringify(feeds);
      // const urls =
      formData.append("feeds", feedsJson);

      const res = await api.post("feed/fileImport", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      callGetFeeds();
      setMenuVis(false);
      setfile([]);
    } catch (err) {
      console.error("error sending files", err);
    }
    setIsLoading(false);
  };

  const sendURL = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    if (!newFeedUrl.startsWith("http")) {
      setShowUrlError(true);
      return;
    }
    try {
      //send new url to server
      const res = await axios.post(
        "http://localhost:3000/feed/newFeed",
        { feedUrl: newFeedUrl },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      //call async getFeeds in parent to update frontend after new url addition
      callGetFeeds();
      setMenuVis(false);
    } catch (error) {
      seturlNotFound(true);
      console.error(error);
    }
    setNewFeedUrl(""); //clear input filed
    setIsLoading(false);
  };

  const toggleNewFeedMenuVis = () => {
    setMenuVis(false);
    setNewFeedMenuVis(!newFeedMenuVis);
  };

  const toggleMenuVis = () => {
    setMenuVis(!menuVis);
  };

  const toggleEditFeedVis = () => {
    closeAllFeeds();
    setDoneBtnVis(!isEditable);
    setMenuVis(false);
    setIsEditable(!isEditable);
  };

  const collapseFeeds = () => {
    closeAllFeeds();
    setMenuVis(false);
  };

  const closeEditMenu = () => {
    setIsEditable(false);
    setDoneBtnVis(false);
  };

  
  return (
    <>
      <LoadingAnimation isLoading={isLaoding} />

      <div className="relative">
        {doneBtnVis ? (
          <div className="flex gap-3 items-center h-max">
              <FolderMenu updateMenuBtnHover={updateMenuBtnHover}/>
            {menuBtnHover[1] && (
              <div className="bg-amber-300 z-30 absolute -left-16 top-7 pl-2 pr-2 w-max h-min cursor-none">
                <p className="text-sm text-black">organize selected</p>
              </div>
            )}

            <button
              className="relative hover:text-neutral-500"
              onMouseEnter={() => updateMenuBtnHover(0, true)}
              onMouseLeave={() => updateMenuBtnHover(0, false)}
              onClick={deleteSelected}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
            {menuBtnHover[0] && (
              <div
                className="bg-amber-300 z-30 absolute top-7 pl-2 pr-2 -left-8 w-max h-min cursor-none">
                <p className="text-sm text-black">remove selected</p>
              </div>
            )}
            <button
              onClick={closeEditMenu}
              className="rounded mr-[14px] w-max font-bold transition-color duration-150 hover:text-neutral-500"
            >
              done
            </button>
          </div>
        ) : (
          <button className="" onClick={toggleMenuVis}>
            <FontAwesomeIcon
              icon={faEllipsis}
              className={`text-2xl text-neutral-500 pointer relative active:text-yellow-500 ${newFeedMenuVis ? "z-10" : "z-20"
                } mr-2.5`}
            />
          </button>
        )}



        {menuVis && (
          <>
            <div
              className="flex flex-col font-bold items-center justify-around absolute right-0 z-20 bg-neutral-900 border-2 border-neutral-500 rounded-md w-max"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => collapseFeeds()}
                className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
              >
                close all
              </button>
              <hr className="border-neutral-500 border-inset border-1 w-full" />
              <button
                onClick={toggleEditFeedVis}
                className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
              >
                edit
              </button>
              <hr className="border-neutral-500 border-inset border-1 w-full" />
              <button
                className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
                onClick={toggleNewFeedMenuVis}
              >
                new feed
              </button>
            </div>
          </>
        )}

        {newFeedMenuVis && (
          <div
            onClick={toggleNewFeedMenuVis}
            className="w-screen h-screen backdrop-blur-[2px] fixed top-0 left-0 z-10 flex flex-col items-center justify-start"
          >
            <div className="w-96 flex justify-end mt-36">
              <button
                onClick={toggleNewFeedMenuVis}
                className="text-xl hover:text-amber-300"
              >
                <FontAwesomeIcon className="text-2xl" icon={faXmark} />
              </button>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col gap-1 p-6 pt-3 w-96 h-max border-2 border-neutral-500 bg-neutral-900 rounded-md z-10 inset-x-2/4 inset-y-1/4"
            >
              <p className="text-xl text-neutral-500">Add an RSS feed</p>
              <form className="flex flex-col" onSubmit={sendURL}>
                <label htmlFor="feed-url" className="text-base">
                  Enter a URL:
                </label>
                {showUrlError && (
                  <p className="text-red-500 text-sm mb-1">Invalid URL</p>
                )}
                {urlNotFound && (
                  <p className="text-red-500 text-sm mb-1">URL not found</p>
                )}
                <div className="flex items-center relative">
                  <input
                    type="text"
                    id="feed-url"
                    name="feed-url"
                    value={newFeedUrl}
                    onChange={(e) => updateFeedUrl(e)}
                    className="text-white placeholder:text-neutral-500 bg-black text-base pl-1 pr-1 rounded-sm w-full h-8 mr-10"
                    placeholder="https://example.com/feed"
                  ></input>
                  <button
                    // send to servr on button click
                    type="submit"
                    className="text-amber-300 hover:text-neutral-500 transition-color duration-150 ease-in-out text-xl bg-neutral-900 p-1 flex items-center mr-1 rounded absolute right-0"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </form>
              <p className="text-lg text-neutral-500 -mb-1">or</p>
              <form onSubmit={sendFile} className="flex flex-col">
                <p>Import a file (.opml):</p>
                <div className="relative flex gap-3 w-full items-center">
                  <label
                    onMouseOver={() => setImportHover(true)}
                    onMouseLeave={() => setImportHover(false)}
                    className="w-full mr-8 p-3 pt-2 pb-2 bg-black rounded-md border border-dashed border-neutral-500 cursor-pointer text-neutral-500 flex items-center gap-3"
                    htmlFor="file-upload"
                  >
                    <div>
                      <FontAwesomeIcon
                        className={`text-2xl ${importHover ? "text-gray-200" : ""
                          }`}
                        icon={faFileArrowUp}
                      />
                    </div>

                    <div>
                      {file && file.length > 0 ? (
                        <p className="p-1 text-sm text-white bg-neutral-900 rounded pl-2">
                          {file.map((file) => file.name)}
                        </p>
                      ) : (
                        <p className={`${importHover ? "text-gray-200" : ""}`}>click to browse files</p>
                      )}
                    </div>
                  </label>
                  <br />
                  <input
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setfile(files);
                      }
                    }}
                    id="file-upload"
                    type="file"
                    accept=".opml"
                    className="hidden"
                  ></input>
                  <button
                    type="submit"
                    className="aspect-square h-min w-min text-amber-300 hover:text-neutral-500 transition-color duration-150 ease-in-out text-xl p-1 flex items-center mr-1 rounded absolute right-0"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedMenu;
