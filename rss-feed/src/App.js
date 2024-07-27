import axios from "axios";
import { useEffect, useState } from "react";
import Feed from "./Feed";

function App() {
  const [articles, setArticles] = useState([]);

  console.log(articles);

  const getArticles = async () => {
    try {
      const res = await axios.get("http://localhost:4000/");
      setArticles(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getArticles();
  }, []);

  console.log(articles);
  return (
    <>
      <h1 className="text-xl font-semibold text-center mt-5">rss-reader</h1>
      <h2 className="text-3xl font-semibold, text-center mt-2 mb-4">Good Morning, Vietnam</h2>
      <div className="w-3/4 max-w-lg border mx-auto p-5 rounded-xl">
        <div className="flex flex-col items-center">
          <img src="https://cdn-images-1.medium.com/max/303/1*rOPLUJ3W6FUA3rO1U1IeuA@2x.png" alt="Netflix tech block logo"></img>
        </div>
        {articles.map((item, i) => 
          <Feed
            key={i}
            title={item.item.title}
            link={item.item.link}
            date={item.item.pubDate}
          />
        )}
      </div>
    </>
  );
}

export default App;
