//top section with menu to add feeds
//calling feedComponent logic could be a separate component

import axios from "axios";
// import opml from 'opml';
import { ChangeEvent, FormEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEllipsis,
  faFileArrowUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Articles } from "../interfaces";
import api from "../api";

interface FeedMenuProps {
  callGetArticles: any;
  closeAllFeeds: any;
  articles: Articles;
  setIsEditable: any;
  isEditable: any;
}
//somehow FeedMenu needs to tell FeedList to call getArticles again
const FeedMenu: React.FC<FeedMenuProps> = ({
  callGetArticles,
  closeAllFeeds,
  articles,
  setIsEditable,
  isEditable,
}) => {
  const [newFeedMenuVis, setNewFeedMenuVis] = useState<boolean>(false);
  const [importHover, setImportHover] = useState<boolean>(false);
  const [file, setfile] = useState<File[]>();
  const [newFeedUrl, setNewFeedUrl] = useState<string>("");
  const [showUrlError, setShowUrlError] = useState<boolean>(false);
  const [urlNotFound, seturlNotFound] = useState<boolean>(false);
  const [menuVis, setMenuVis] = useState<boolean>(false);

  const updateFeedUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setNewFeedUrl(e.target.value);
    setShowUrlError(false);
    seturlNotFound(false);
  };

  const sendFile = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || file.length === 0) {
      alert("please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file[0]);

      const articlesJson = JSON.stringify(articles);
      // const urls =
      formData.append("articles", articlesJson);

      const res = await api.post("/fileImport", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      callGetArticles();
      setMenuVis(false);
      setfile([]);
    } catch (err) {
      console.error("error sending files", err);
    }
  };

  const sendURL = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.startsWith("http")) {
      setShowUrlError(true);
      return;
    }
    try {
      //send new url to server
      console.log(newFeedUrl);
      const res = await axios.post(
        "http://localhost:3000/newFeed",
        { feedUrl: newFeedUrl },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      //call async getArticles in parent to update frontend after new url addition
      callGetArticles();
      setMenuVis(false);
    } catch (error) {
      seturlNotFound(true);
      console.error(error);
    }

    setNewFeedUrl(""); //clear input filed
  };

  const toggleNewFeedMenuVis = () => {
    setMenuVis(false);
    setNewFeedMenuVis(!newFeedMenuVis);
  };

  const toggleMenuVis = () => {
    setMenuVis(!menuVis);
  };

  const toggleEditFeedVis = () => {
    setMenuVis(false);
    setIsEditable(!isEditable);
  };

  const collapseFeeds = () => {
    closeAllFeeds();
    setMenuVis(false);
  }

  return (
    <div className="relative">
        <button 
        className=""
        onClick={toggleMenuVis}>
          <FontAwesomeIcon
            icon={faEllipsis}
            className={`text-2xl text-gray-400 pointer relative ${
              newFeedMenuVis ? "z-10" : "z-20"
            } mr-2.5`}
          />
        </button>

        {menuVis && (
          <>
            <div
              className="flex flex-col items-center justify-around absolute right-0 z-20 bg-neutral-900 border-2 border-gray-400 rounded-md"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => collapseFeeds()}
                className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
              >
                collapse
              </button>

              <hr className="color-gray-500 border-inset border-1 w-full" />
              <button
                onClick={toggleEditFeedVis}
                className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
              >
                edit
              </button>
              <hr className="color-gray-500 border-inset border-1 w-full" />
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
            className="w-screen h-screen backdrop-blur-[2px] fixed top-0 left-0 z-10 flex flex-col items-center justify-center"
          >
            <div className="w-96 flex justify-end">
              <button
                onClick={toggleNewFeedMenuVis}
                className="text-xl hover:text-amber-300"
              >
                <FontAwesomeIcon className="text-2xl" icon={faXmark} />
              </button>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col gap-1 p-6 pt-3 w-96 h-max border-2 border-gray-400 bg-neutral-900 rounded-md z-10 inset-x-2/4 inset-y-1/4"
            >
              <p className="text-xl text-gray-400">Add an RSS feed</p>
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
                    className="text-white bg-black text-base pl-1 pr-1 rounded-sm w-full h-8 mr-10"
                    placeholder="https://example.com/feed"
                  ></input>
                  <button
                    // send to servr on button click
                    type="submit"
                    className="text-amber-300 hover:bg-black transition-color duration-150 ease-in-out text-xl bg-neutral-900 p-1 flex items-center mr-1 rounded absolute right-0"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </form>
              <p className="text-lg text-gray-400 -mb-1">or</p>
              <form onSubmit={sendFile} className="flex flex-col">
                <p>Import a file (.opml):</p>
                <div className="relative flex gap-3 w-full items-center">
                  <label
                    onMouseOver={() => setImportHover(true)}
                    onMouseLeave={() => setImportHover(false)}
                    className="w-full mr-8 p-3 pt-2 pb-2 bg-black rounded-md border border-dashed border-gray-400 cursor-pointer text-gray-400 flex items-center gap-3"
                    htmlFor="file-upload"
                  >
                    <div className="">
                      <FontAwesomeIcon
                        className={`text-2xl ${
                          importHover ? "text-gray-200" : ""
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
                        <p>click to browse files</p>
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
                    className="aspect-square h-min w-min text-amber-300 hover:bg-black transition-color duration-150 ease-in-out text-xl p-1 flex items-center mr-1 rounded absolute right-0"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default FeedMenu;
