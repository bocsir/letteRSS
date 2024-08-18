import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import ReaderButton from './ReaderButton';

const Feed = ({ title, link, date, item }) => {
  const [isHovered, setIsHovered] = useState(false);
  let dateFormat = { day: "numeric", month: "long", year: "numeric" };
  let articleDate = new Date(date).toLocaleDateString("en-US", dateFormat);
  const articleContent = item;

  return (
    <>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 relative ${isHovered ? 'text-amber-300' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3 className="text-lg leading-4">
          {title}
          <FontAwesomeIcon icon={faLink} className="text-xs ml-1"/>
        </h3>
        <p>{articleDate}</p>
      </a>
      <ReaderButton 
        item={articleContent} 
        link={link}
        date={articleDate}
        isHovered={isHovered} 
        setIsHovered={setIsHovered} 
      />

    </>
  );
};

export default Feed;