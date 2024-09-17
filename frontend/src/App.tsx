  /*
  *TODO:
    *EDIT FEEDS:

****next:
    *feed not updating after being added
    *401 response after adding feed isnt working
    *are receptors improperly configured in feedlist?
    
      *be able to select feeds with checkbox
        *to add to folder
          *create new folder
          *store folders in database
            *new optional column in url table: folder varchar(30)
        *to delete from db

    *search feeds
      *ctrl+k brings up search box to look through all feeds by name with suggestions

    *auto-discovery
      *enter site url, automatically find feed
        *or maybe use a library to make one???? (fetchRSS)

    *hide iframe option if unavailable 
      *tried but failed to get it to work by creating an example iframe and checking for errors

    *AWS hosting
    
    *serch function for finding new feeds

    *change theme like how https://tty1.blog/

  *MORE THINGS:
    *READER VIEW
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
        const response: AxiosResponse<AuthStatusResponse> = await api.get('/auth/auth');
        setIsAuthenticated(response.data.authenticated);
        setUserEmail(response.data.user.email);
      } catch (err) {
        //if access token invalid/ expired
        console.error('error checking user auth: ', err);
        try {
          //make new access token using refresh token, call to get auth status again
          console.log('refreshing access token');
          await api.post('/auth/refresh-token');
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
          className="absolute top-2 left-3">
          <Logo isWhite={false}/>
        </a>

        <div className="flex items-center hover:text-yellow-500 w-full justify-end pr-2 ml-1">
          <p className="text-gray-100 hidden sm:block">{userEmail}</p>
          <button 
            onClick={() => setAccountMenuVisible(true)}
            className="cursor-pointer p-2 m-2 rounded-full border-2 border-gray-400 w-min flex items-center justify-center">
            <FontAwesomeIcon className="aspect-square scale-75 text-gray-100" icon={faUser}/>
          </button>
        </div>

        <FeedList isAuthenticated={isAuthenticated}/>

        {accountMenuVisible && (
          <AccountMenu toggleAccountMenu={toggleMenuVis} userEmail={userEmail} navigate={navigate}/>
        )}
      </>
    );
  }

  export default App;