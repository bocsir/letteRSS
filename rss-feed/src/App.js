import axios from "axios";
import { useEffect, useState } from "react";
import Feed from "./Feed";

function App() {
  const [articles, setArticles] = useState({});
  const [feedVisibility, setFeedVisibility] = useState({});
  const [feedUrl, setFeedUrl] = useState('');

  //request to allAritcles endpoint
  const getArticles = async () => {
    try {
      const res = await axios.get("http://localhost:4000/");
      console.log("fetched articles: ", res.data);
      setArticles(res.data);

      //feed visibility
      const initialVisibility = Object.keys(res.data).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      setFeedVisibility(initialVisibility);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getArticles();
  }, []);

  const toggleFeedVisibility = (feedIndex) => {
    setFeedVisibility(prev => ({
      ...prev,
      [feedIndex]: !prev[feedIndex]
    }));
  };

  const [menuVisible, setMenuVis] = useState(false);
  const toggleMenuVis = () => {
    setMenuVis(!menuVisible);
  };

  const sendURL = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/newFeed', 
        { feedUrl: feedUrl },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log("feed added: ", res.data);

      await getArticles();
    } catch(error) {
      console.log(error);
    }

    setFeedUrl(''); //clear feedUrl
  };

  return (
    <>
      <div className="absolute w-full flex flex-col items-end">
        <button onClick={toggleMenuVis} className="text-2xl m-2 mr-3 tracking-tighter leading-4">...</button>
        {menuVisible && (
          <div className="flex flex-col p-3 pt-1  m-3 border bg-black relative z-20">
            <form className="flex flex-col">
              <label htmlFor="feed-url" className="text-lg font-bold">Add a feed:</label>
              <div className="flex items center">
                <input value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} className="text-black p-1 rounded-sm" id="feed-url" name="feed-url" type="text" placeholder="Enter new feed URL"></input>
                <button onClick={sendURL} className="text-bases font-bold bg-amber-300 ml-4 pl-1 pr-1 rounded-md leading-3">submit</button>
            </div>
            </form>
          </div>
        )}
      </div>
      
      <h1 className="text-xl text-center font-semibold pt-2 pb-2 mb-2 text-amber-300">super simple RSS</h1>
      <h2 className="text-2xl font-bold ml-3 mb-2">Feeds:</h2>
      {Object.entries(articles).map(([feedIndex, feedArray]) => (
        <div
          key={feedIndex}
          className="w-fit min-w-40 max-w-lg border ml-3 pl-3 pr-3 pt-1 pb-1 bg-black"
        >
          <div onClick={() => toggleFeedVisibility(feedIndex)} className="h-7 cursor-pointer flex justify-between items-center relative">
            <h3 className={`text-xl font-semibold select-none ${feedVisibility[feedIndex]? "text-amber-300" : "text-white" }`}>Feed {parseInt(feedIndex) + 1}</h3>
            <button className="text-xl">
              {feedVisibility[feedIndex] ? '-' : '+'}
            </button>
          </div>
          {feedVisibility[feedIndex] && (
            <div className="mt-2">
              {feedArray.map((item, itemIndex) => (
                <Feed
                  key={`${feedIndex}-${itemIndex}`}
                  title={item.item.title}
                  link={item.item.link}
                  date={item.item.pubDate}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default App;