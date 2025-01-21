import FeedContainer from "./components/FeedContainer";
import AccountMenu from './components/AccountMenu';
import TopSection from "./components/TopSection";
import Background from "./components/Background";
import { useState } from "react";
import { useAuthStatus } from './hooks/useAuthStatus';
import { useApiInterceptors } from './hooks/useApiInterceptors';

const App = () => {
  const { isAuthenticated, userEmail } = useAuthStatus();
  const [accountMenuVisible, setAccountMenuVisible] = useState<boolean>(false);

  useApiInterceptors();

  return (
    <>
      <TopSection userEmail={userEmail} setAccountMenuVisible={setAccountMenuVisible} />
      <FeedContainer isAuthenticated={isAuthenticated}/>
      {accountMenuVisible && (
        <AccountMenu setAccountMenuVisible={setAccountMenuVisible} isVisible={accountMenuVisible} userEmail={userEmail} />
      )}
      <Background/>
    </>
  );
}

export default App;