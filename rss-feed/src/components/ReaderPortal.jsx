import { createPortal } from "react-dom";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


const ReaderPortal = ({ link, date, sanitizedContent }) => {
  const [showReader, setShowReader] = useState(true);

  if (showReader) return createPortal(
    <div className="w-screen h-screen fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="flex justify-end w-5/6">
        <button onClick={() => setShowReader(false)}className="relative text-xl hover:text-amber-300"><FontAwesomeIcon className="text-2xl" icon={faXmark}/></button><br/>
      </div>

      <div className="h-5/6 w-5/6 bg-stone-800 content overflow-auto p-4 pt-0 border border-white text-white">
        <a href={link} className="hover:text-amber-300">{link}</a>
        <p>{date}</p>
        {sanitizedContent ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        ) : (
          <p>No content to display</p>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReaderPortal;

