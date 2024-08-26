/*
*TODO:
  *auth:
    *set current user with JWT
  
  *feed database:
    *URLs table:
      *
      * id (Primary Key) //user id
      * url
      * title (optional) //if user sets title
    *add to db from server array
    *ability to remove feeds (delete row with matching url from URLs table)
  
  *responsive for mobile

  *AWS hosting
  
  *serch function for finding new feeds

*MORE THINGS:
  *READER VIEW
    *drag to resize reader view
      *save in localstorage
    *next, prev buttons for feed  
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
