//top section with menu to add feeds
//calling feedComponent logic could be a separate component

import axios from "axios";
import fs from 'fs';
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

interface FeedMenuProps {
  callGetArticles: any;
  articles: Articles;
}
//somehow FeedMenu needs to tell FeedList to call getArticles again
const FeedMenu: React.FC<FeedMenuProps> = ({ callGetArticles, articles }) => {
  const [menuVisible, setMenuVis] = useState<boolean>(false);
  const [importHover, setImportHover] = useState<boolean>(false);
  const [file, setfile] = useState<File[]>();
  const [newFeedUrl, setNewFeedUrl] = useState<string>("");
  const [showUrlError, setShowUrlError] = useState<boolean>(false);
  const [urlNotFound, seturlNotFound] = useState<boolean>(false);

  const updateFeedUrl = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setNewFeedUrl(e.target.value);
    setShowUrlError(false);
    seturlNotFound(false);
  };

  const toggleMenuVis = () => {
    setMenuVis(!menuVisible);
  };

  const sendFile = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || file.length === 0) {
      alert('please select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file[0]);

      const articlesJson = JSON.stringify(articles);
      // const urls = 
      formData.append('articles', articlesJson);

      const res = await axios.post(
        "http://localhost:3000/fileImport",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data"},
          withCredentials: true
        }
      );

      console.log("file sent to server", res.data);

      callGetArticles()
      setMenuVis(false);
      setfile([]);
    } catch(err) {
      console.error("error sending files", err);
    }
  }

  const sendURL = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.startsWith('http')) {
      setShowUrlError(true);
      return;
    }
    try {
      //send new url to server
      const res = await axios.post(
        "http://localhost:3000/newFeed",
        { feedUrl: newFeedUrl },
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      console.log("feed added: ", res.data);

      //call async getArticles in parent to update frontend after new url addition
      callGetArticles();
      setMenuVis(false);
    } catch (error) {
      seturlNotFound(true);
      console.error(error);
    }

    setNewFeedUrl(""); //clear input filed
  };

  return (
    <>
      <div className="">
        <button onClick={toggleMenuVis}>
          <FontAwesomeIcon
            icon={faEllipsis}
            className="text-2xl text-gray-400 pointer relative mr-2.5"
          />
        </button>

        {menuVisible && (
          <div
            onClick={toggleMenuVis}
            className="w-screen h-screen backdrop-blur-[2px] absolute top-0 left-0 z-10 flex flex-col items-center"
          >
            <div className="w-96 flex justify-end mt-64">
              <button
                onClick={toggleMenuVis}
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
                      {(file && file.length > 0) ? (
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
    </>
  );
};

export default FeedMenu;
