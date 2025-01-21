import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "./Logo";

interface TopSectionProps {
  userEmail: string;
  setAccountMenuVisible: (visible: boolean) => void;
}

const TopSection: FC<TopSectionProps> = ({ userEmail, setAccountMenuVisible }) => {
  return (
    <>
      <a href="/" className="absolute top-2 left-3">
        <Logo color={1} />
      </a>
      <div className="flex items-center text-gray-200 w-full justify-end pr-2 ml-1">
        <p className="hidden sm:block">{userEmail}</p>
        <button
          onClick={() => setAccountMenuVisible(true)}
          className="cursor-pointer p-2 m-2 rounded-full border-2 border-gray-400 hover:border-yellow-500 transition-colors duration-150 w-min flex items-center justify-center"
        >
          <FontAwesomeIcon className="aspect-square scale-75 text-gray-200" icon={faUser} />
        </button>
      </div>
    </>
  );
};

export default TopSection;
