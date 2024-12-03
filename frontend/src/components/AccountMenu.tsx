import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../api";
import { NavigateFunction } from "react-router-dom";

interface AccountMenuProps {
  setAccountMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
  isVisible: boolean
  userEmail: string
  navigate: NavigateFunction
}

const AccountMenu = ({ setAccountMenuVisible, isVisible, userEmail, navigate }: AccountMenuProps) => {

  //call server endpoint to clear the refresh token at '/logout'
  const logoutUser = async () => {
    navigate('/login');
  }

  //call endponit to clear refresh token
  const logoutAllDevices = async () => {
    try {
      const res = await api.post('/auth/logout', { email: userEmail});
      console.log(res);
      navigate('/login');  
    } catch (err) {
      console.error("error loggin out", err);
    }
  }

  return (
    <div
      onClick={() => setAccountMenuVisible(!isVisible)}
      className="w-screen h-full backdrop-blur-[2px] absolute top-0 left-0 z-20 flex flex-col items-center justify-start pt-36"
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-3 p-4 h-min relative border-gray-400 border-2 bg-black rounded-md z-10"
      >
        <div className="w-full flex justify-end absolute -top-7 right-0">
          <button
            onClick={() => setAccountMenuVisible(!isVisible)}
            className="text-xl hover:text-amber-300"
          >
            <FontAwesomeIcon className="text-2xl" icon={faXmark} />
          </button>
        </div>

        <p>Signed in as: {userEmail}</p>
        <div className="w-full flex justify-stretch gap-3">
          <button
            className="bg-amber-300 w-min p-3 mt-3 mb-2 h-min rounded-lg leading-3 cursor-pointer text-stone-800 font-bold transition-shadow duration-200 ease-in-out hover:shadow-[0px_0px_10px_4px_rgb(147,91,9)] hover:text-amber-800"
            onClick={logoutUser}
          >
            logout
          </button>
          <button
            className="bg-amber-300 p-3 mt-3 mb-2 leading-3 w-max rounded-lg cursor-pointer text-stone-800 font-bold transition-shadow duration-200 ease-in-out hover:shadow-[0px_0px_10px_4px_rgb(147,91,9)] hover:text-amber-800"
            onClick={logoutAllDevices}
          >
            logout all devices
          </button>

        </div>
      </div>
    </div>
  );
};

export default AccountMenu;
