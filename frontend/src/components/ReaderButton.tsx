//shows in feed list and when clicked passes article details to ReaderPortal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import ReaderPortal from "./ReaderPortal";
import { FeedItem } from "../interfaces";

interface ReaderButtonProps {
  item: FeedItem;
  isYellow: boolean;
  setIsYellow: any;
}

const ReaderButton: React.FC<ReaderButtonProps> = ({ item, isYellow, setIsYellow }) => {
  const [isPortalVisible, setIsPortalVisible] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => { setIsYellow(true); setIsPortalVisible(true);}}
        className={`mb-2 flex items-center text-sm h-5 hover:bg-neutral-900 rounded relative z-2 ${isYellow ? 'text-amber-300' : ''}`}
        data-title="open here"
        onMouseEnter={() => setIsYellow(true)}
        onMouseLeave={() => {(isPortalVisible) ? setIsYellow(true) : setIsYellow(false)}}
      >
        <FontAwesomeIcon icon={faAnglesRight} />
      </button>
      {(isPortalVisible) && 
        <ReaderPortal item={item} setIsPortalVisible={setIsPortalVisible} setIsYellow={setIsYellow}/>
      }
    </>
  );
};

export default ReaderButton;