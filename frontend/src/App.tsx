/*
*TODO:
  *need to be able to get url list on post request to server, not by keeping list there

  *auto-discovery
    *enter site url, automatically find feed
      *or maybe use a library to make one???? (fetchRSS)

  *feed database:
    *URLs table:
      * id (Primary Key) //user id
      * url
      * title (optional) //if user sets title
    *add to db from server array
    *ability to remove feeds (delete row with matching url from URLs table)
  
  *responsive for mobile

  *AWS hosting
  
  *serch function for finding new feeds

  *change theme like how https://tty1.blog/

*MORE THINGS:
  *READER VIEW
    *drag to resize reader view
      *save size in localstorage
    *next, prev buttons for feed 
  *keybinds for each click. 
    *alt text describing bind
  *save read / unread posts
  *red dot for new posts
  *loading animation for feeds on render
  *set profile picture
  *reddit feed from subreddit url
*/
import React, { useEffect, useState } from "react";
import { FeedList } from "./components/FeedList";
import { Logo } from "./components/Logo";
import { AxiosResponse } from "axios";
import api, { interceptors } from './api';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import AccountMenu from './components/AccountMenu';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [accountMenuVisible, setAccountMenuVisible] = useState<boolean>(false);

  //pass to AccountMenu for x btn
  const toggleMenuVis = () => {
    setAccountMenuVisible(!accountMenuVisible);
  };

  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('getting auth');
    getAuthStatus();
  }, []);

  //set interceptors for auth errors
  useEffect(() => {
    interceptors(navigate);
  }, [navigate]);

  interface User {
    email: string;
    //...
  }
  interface AuthStatusResponse {
    authenticated: boolean;
    user: User;
  }

  //check for access and refresh token status
  async function getAuthStatus() {
    try {
      const response: AxiosResponse<AuthStatusResponse> = await api.get('/auth');
      setIsAuthenticated(response.data.authenticated);
      setUserEmail(response.data.user.email);
    } catch (err) {
      //if access token invalid/ expired
      console.error('error checking user auth: ', err);
      try {
        //make new access token using refresh token, call to get auth status again
        console.log('refreshing access token');
        await api.post('/refresh-token');
        getAuthStatus();
      } catch (err) {
        console.error('error generating new access token: ', err);
      }
    }
  }

  return (
    <>
      <a
        href="/"
        className="absolute top-2 right-3">
        <Logo isWhite={false}/>
      </a>

      <div className="flex items-center hover:text-yellow-500 w-min pr-2 ml-1">
        <button 
          onClick={() => setAccountMenuVisible(true)}
          className="cursor-pointer p-2 m-2 rounded-full border-2 border-gray-400 w-min flex items-center justify-center">
          <FontAwesomeIcon className="aspect-square scale-75 text-gray-100" icon={faUser}/>
        </button>
        <p className="text-gray-100">{userEmail}</p>
      </div>

      <FeedList email={userEmail} isAuthenticated={isAuthenticated}/>

      {accountMenuVisible && (
        <AccountMenu toggleAccountMenu={toggleMenuVis} userEmail={userEmail} navigate={navigate}/>
      )}
    </>
  );
}

export default App;