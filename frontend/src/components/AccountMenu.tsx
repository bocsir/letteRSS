import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../api";
import { NavigateFunction } from "react-router-dom";

interface AccountMenuProps {
    toggleAccountMenu: any
    userEmail: string
    navigate: NavigateFunction
}

const AccountMenu = ({ toggleAccountMenu, userEmail, navigate }: AccountMenuProps) => {

//call server endpoint to clear the refresh token at '/logout'
const logoutUser = async() => {
    const response = await api.post('/logout');
    console.log(response);
    navigate('/login');
}

  return (
    <div
      onClick={toggleAccountMenu}
      className="w-screen h-screen backdrop-blur-[2px] absolute top-0 left-0 z-10 flex flex-col items-center"
    >
      <div className="w-96 flex justify-end mt-64">
        <button
          onClick={toggleAccountMenu}
          className="text-xl hover:text-amber-300"
        >
          <FontAwesomeIcon className="text-2xl" icon={faXmark} />
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-3 p-4 w-96 h-max shadow-[0px_0px_3px_1px_rgb(255,255,255)] bg-black rounded-md z-10 inset-x-2/4 inset-y-1/4"
      >
        <p>now signed in as: {userEmail}</p>
        <button
          className="bg-amber-300 w-min p-3 mt-3 mb-2 rounded-lg leading-3 cursor-pointer text-stone-800 font-bold transition-shadow duration-200 ease-in-out hover:shadow-[0px_0px_10px_4px_rgb(147,91,9)] hover:text-amber-800"
          onClick={logoutUser}
        >
          logout
        </button>
      </div>
    </div>
  );
};

export default AccountMenu;
