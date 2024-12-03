import { useEffect, useState } from "react";
  import FeedContainer from "./components/FeedContainer";
  import { Logo } from "./components/Logo";
  import { AxiosResponse } from "axios";
  import api, { interceptors } from './api';
  import { useNavigate } from "react-router-dom";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faUser } from "@fortawesome/free-solid-svg-icons";
  import AccountMenu from './components/AccountMenu';
  import { User, AuthStatusResponse } from "./interfaces";

  const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string>("");
    const [accountMenuVisible, setAccountMenuVisible] = useState<boolean>(false);
   
    useEffect(() => {
      getAuthStatus();
    }, []);
    
    //handle navigation for auth errors in api response
    const navigate = useNavigate();
    useEffect(() => {
      interceptors(navigate);
    }, [navigate]);

    //check for access and refresh token status
    async function getAuthStatus() {
      try {
        const response: AxiosResponse<AuthStatusResponse> = await api.get('/auth/auth');
        setIsAuthenticated(response.data.authenticated);
        setUserEmail(response.data.user.email);
      } catch (err) {
        //prevent loop if user is sent to login page
        if (window.location.pathname === '/') {
          await getAuthStatus();      
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

        <FeedContainer isAuthenticated={isAuthenticated}/>

        {accountMenuVisible && (
          <AccountMenu setAccountMenuVisible={setAccountMenuVisible} isVisible={accountMenuVisible} userEmail={userEmail} navigate={navigate}/>
        )}
      </>
    );
  }

  export default App;