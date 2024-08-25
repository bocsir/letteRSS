import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import ReaderButton from './ReaderButton';
import { FeedItem } from "../interfaces";

interface FeedProps {
  item: FeedItem
}

const Feed: React.FC<FeedProps> = ({ item }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  const dateFormat: Intl.DateTimeFormatOptions = { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  }; 
  let articleDate = new Date(item.date).toLocaleDateString("en-US", dateFormat);
  const articleContent: FeedItem = item;

  return (
    <>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 relative ${isHovered ? 'text-amber-300' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3 className="text-lg leading-4">
          {item.title}
          <FontAwesomeIcon icon={faLink} className="text-xs ml-1"/>
        </h3>
        <p>{articleDate}</p>
      </a>
      <ReaderButton 
        item={articleContent} 
        isHovered={isHovered} 
        setIsHovered={setIsHovered} 
      />

    </>
  );
};

export default Feed;