/*
*jsx -> tsx

*DATABASE FOR FEED
  *ability to remove feeds
  *add to db from server array

*READER VIEW
  *drag to resize reader view
    *save in localstorage
  *next, prev buttons for feed
  
*extra:
  *keybinds for each click. 
    *alt text describing bind
  *save read / unread posts
  *red dot for new posts

*/

//components: App > Nav, App > Feed > ReaderButton > ReaderPortal

import axios from "axios";
import { useEffect, useState } from "react";
import Feed from "./components/Feed";
import Nav from './components/Nav';
import SignUp from './components/SignUp';

function App() {
  //useState is useful because calling its update function will trigger re-render
  const [articles, setArticles] = useState({});
  const [feedVisibility, setFeedVisibility] = useState({});

  //request to allAritcles endpoint for articles
  const getArticles = async () => {
    console.log('gettingarticles');
    try {
      const res = await axios.get("http://localhost:4000/");
      console.log("fetched articles: ", res.data);
      setArticles(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  //get articles on mount (first render)
  useEffect(() => {
    getArticles();
  }, []);

  const toggleFeedVisibility = (feedIndex) => {
    setFeedVisibility((prev) => ({
      ...prev,
      [feedIndex]: !prev[feedIndex],
    }));
  };
  return (
    <>
      <SignUp/>

      <Nav callGetArticles={getArticles}/>

      {/* feed list */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold ml-4 ">Feeds:</h2>
        {Object.entries(articles).map(([feedIndex, feedArray]) => (
          <div
            key={feedIndex}
            className="cursor-pointer w-fit border ml-3 mr-3 pl-3 pr-3 pt-1 pb-1 bg-black"
          >
            <div
              className="h-7 flex justify-between items-center relative"                  
              onClick={() => toggleFeedVisibility(feedIndex)}
            >
              <h3
                className={`text-xl font-bold select-none whitespace-nowrap text-clip 
                  ${ feedVisibility[feedIndex] ? "text-amber-300" : "text-white" }`}

              >
                {feedIndex}
              </h3>
              <button className={`text-xl pl-2 bg-black font-semibold relative z-1 ${
                feedVisibility[feedIndex] ? "text-amber-300" : "text-white"
              }`}>
                {feedVisibility[feedIndex] ? "-" : "+"}
              </button>
            </div>
            {feedVisibility[feedIndex] && (
              <div className="font-semibold flex flex-col ml-3">
                {feedArray.map((item, itemIndex) => (
                  <Feed
                    key={`${feedIndex}-${itemIndex}`}
                    title={item.item.title}
                    link={item.item.link}
                    date={item.item.pubDate}
                    item={item.item}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
