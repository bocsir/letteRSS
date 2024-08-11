//shows in feed list and when clicked passes article details to ReaderPortal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import ReaderPortal from "./ReaderPortal";

const ReaderButton = ({ item, isHovered, setIsHovered }) => {
  const [isPortalVisible, setIsPortalVisible] = useState(false);

  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(item.content);
  }, [item.content]);

  return (
    <>
      <button
        onClick={() => setIsPortalVisible(true)}
        className={`flex items-center text-lg hover:bg-stone-800 mb-px rounded relative z-2 ${isHovered ? 'text-amber-300' : ''}`}
        data-title="open here"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FontAwesomeIcon icon={faAnglesRight} />
      </button>
      {(isPortalVisible) && <ReaderPortal sanitizedContent={sanitizedContent}/>}
    </>
  );
};

export default ReaderButton;