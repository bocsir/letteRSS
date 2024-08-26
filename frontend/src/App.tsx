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
import { useEffect, useState } from "react";
import { FeedList } from "./components/FeedList";
import { Logo } from "./components/Logo";
import axios from "axios";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  
  useEffect(() => {
    async function checkAuthStatus() {
      const result = await checkAuth();
      setIsAuthenticated(result);
      setUserEmail(localStorage.getItem('userEmail')!);
    }
    checkAuthStatus();
  }, []);

  //call /check-auth
  const checkAuth = async() : Promise<boolean> => {
    try {
      const response = await axios.get('http://localhost:3000/auth', {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      console.log('/check-auth response: ', response.data);
      return response.data.authenticated;

    } catch (err) {
      return false;
    }
  }

  return (
    <>
      <a
        href="/"
        className="absolute top-3 right-3">
        <Logo isWhite={false}/>
      </a>
      <FeedList email={userEmail}/>

      {(isAuthenticated && (
        <div>signed in as: {userEmail}</div>
      ))}
    </>
  );
}

export default App;
