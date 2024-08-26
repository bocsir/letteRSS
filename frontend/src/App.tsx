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
import { FeedList } from "./components/FeedList";
import { Logo } from "./components/Logo";

function App() {

  return (
    <>
      <a
        href="/"
        className="absolute top-3 right-3">
        <Logo isWhite={false}/>
      </a>
      <FeedList/>
    </>
  );
}

export default App;
