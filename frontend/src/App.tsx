/*
*TODO:  
  *auth:
    *if refresh token fails, logout user

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
import React, { useEffect, useState } from "react";
import { FeedList } from "./components/FeedList";
import { Logo } from "./components/Logo";
import { AxiosResponse } from "axios";
import api from './api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
 

  useEffect(() => {
    getAuthStatus();
  }, []);

  interface User {
    email: string;
    //...
  }
  interface AuthStatusResponse {
    authenticated: boolean;
    user: User;
  }

  //how do i get auth token from cookies?
  async function getAuthStatus() {
    try {

      //check wether user is logged in
      const response: AxiosResponse<AuthStatusResponse> = await api.get('/auth');
      setIsAuthenticated(response.data.authenticated);
      setUserEmail(response.data.user.email);
    } catch (err) {
      console.error('error checking user auth: ', err);
      try {
        //make new access token and call to get auth status again
        console.log('refreshing access token');
        await api.get('/refresh-token');
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
        className="absolute top-3 right-3">
        <Logo isWhite={false}/>
      </a>
      {(isAuthenticated && (
        <div className="ml-3">signed in as: {userEmail}</div>
      ))}

      <FeedList email={userEmail} isAuthenticated={isAuthenticated}/>
    </>
  );
}

export default App;
