//top section with menu to add feeds
//calling feedComponent logic could be a separate component 

import axios from "axios";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FeedList } from "./FeedList";
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface NavProps {
  callGetArticles: any;
  isAuthenticated: boolean;
}
//somehow Nav needs to tell FeedList to call getArticles again
const Nav: React.FC<NavProps> = ({ callGetArticles, isAuthenticated }) => {
    const [menuVisible, setMenuVis] = useState<boolean>(false);
    const toggleMenuVis = () => {
      setMenuVis(!menuVisible);
    };

    const [newFeedUrl, setNewFeedUrl] = useState<string>("");

    const sendURL = async (e: FormEvent) => {
      e.preventDefault();
      try {
        //send new url to server
        const res = await axios.post(
          "http://localhost:4000/newFeed",
          { feedUrl: newFeedUrl },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("feed added: ", res.data);
  
        //call async getArticles in parent to update frontend after new url addition
        callGetArticles();
      } catch (error) {
        console.log(error);
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
          
        <div onClick={toggleMenuVis} className="w-screen h-screen backdrop-blur-[2px] absolute top-0 left-0 z-10 flex flex-col items-center">
          <div className="w-96 flex justify-end mt-64">
            <button onClick={toggleMenuVis} className="text-xl hover:text-amber-300"><FontAwesomeIcon className="text-2xl" icon={faXmark}/></button>

          </div>

          <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-3 p-6 pt-4 w-96 h-max shadow-[0px_0px_3px_1px_rgb(255,255,255)] bg-black rounded-md z-10 inset-x-2/4 inset-y-1/4">
            <form 
              className="flex flex-col"                   
              onSubmit={sendURL}
            >
              <label htmlFor="feed-url" className="text-base">
                Add a feed:
              </label>
              <div className="flex items-center relative">
                <input
                  type="text"
                  id="feed-url"
                  name="feed-url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="text-black text-base pl-1 pr-1 rounded-sm w-full h-8"
                  placeholder="Enter feed URL"
                ></input>
                <button
                  // send to servr on button click
                  type="submit"
                  className="text-black hover:bg-amber-300 transition-color duration-150 ease-in-out text-xl bg-[rgba(255,255,255,.85)] p-1 flex items-center mr-1 rounded absolute right-0"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </form>

            {(!isAuthenticated) && (
            <div className="flex flex-col">
              <p className="text-base">Save feeds to your account:</p>
              <div className="flex items-center gap-2 mt-1">
                <Link className="bg-amber-300 p-2 pt-1 pb-1 rounded-md text-black text-base font-semibold" to="/login" >Login</Link>
                <p className="text-base">or</p>
                <Link className="bg-amber-300 p-2 pt-1 pb-1 rounded-md text-black text-base font-semibold" to="/singup">Sign Up</Link>
              </div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>
    </>
  );
};

export default Nav