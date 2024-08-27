//shows in feed list and when clicked passes article details to ReaderPortal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import ReaderPortal from "./ReaderPortal";
import { FeedItem } from "../interfaces";

interface ReaderButtonProps {
  item: FeedItem;
  isHovered: boolean;
  setIsHovered: any;
}

const ReaderButton: React.FC<ReaderButtonProps> = ({ item, isHovered, setIsHovered }) => {
  const [isPortalVisible, setIsPortalVisible] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setIsPortalVisible(true)}
        className={`mb-2 flex items-center text-sm h-5 hover:bg-stone-600 rounded relative z-2 ${isHovered ? 'text-amber-300' : ''}`}
        data-title="open here"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FontAwesomeIcon icon={faAnglesRight} />
      </button>
      {(isPortalVisible) && <ReaderPortal item={item} setIsPortalVisible={setIsPortalVisible}/>}
    </>
  );
};

export default ReaderButton;