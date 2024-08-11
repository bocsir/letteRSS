import axios from "axios";
import { useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';

const Nav = ({ callGetArticles }) => {
    const [menuVisible, setMenuVis] = useState(false);
    const toggleMenuVis = () => {
      setMenuVis(!menuVisible);
    };

    const [newFeedUrl, setNewFeedUrl] = useState("");

    const sendURL = async (e) => {
      e.preventDefault();
      try {
        //send new url to server
        const res = await axios.post(
          "http://localhost:4000/newFeed",
          { feedUrl: newFeedUrl },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("feed added: ", res.data);
  
        //call async getArticles in parent to update frontend
        callGetArticles()
      } catch (error) {
        console.log(error);
      }
  
      setNewFeedUrl(""); //clear input filed
    };
  
  return (
    <>
      {/* top bar and menu */}
      <div className="relative w-full flex justify-end items-center">
        <h1 className="absolute text-3xl w-full text-center font-semibold text-amber-300">
          letteRSS
        </h1>
        <button onClick={toggleMenuVis}>
          <FontAwesomeIcon
            icon={faEllipsis}
            className="text-amber-300 text-3xl pointer relative z-1 pl-2 pr-2 mr-2"
          />
        </button>
        {/* dropdown menu */}
        {menuVisible && (
          <div className="flex flex-col p-3 w-fit m-3 border bg-black absolute z-10 right-0 top-6">
            <form 
              className="flex flex-col"                   
              onSubmit={sendURL}
            >
              <label htmlFor="feed-url" className="text-lg font-bold">
                Add a feed:
              </label>
              <div className="flex items center">
                <input
                  type="text"
                  id="feed-url"
                  name="feed-url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="text-black text-lg p-1 rounded-sm w-auto"
                  placeholder="Enter feed URL"
                ></input>
                <button
                  // send to servr on button click
                  type="submit"
                  className="hover:text-amber-400 text-xl text-amber-300 pl-3 pr-1"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Nav