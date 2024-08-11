import { createPortal } from "react-dom";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


const ReaderPortal = ({ sanitizedContent }) => {
  const [showReader, setShowReader] = useState(true);

  if (showReader) return createPortal(
    <div className="w-screen h-screen fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <button onClick={() => setShowReader(false)}className="absolute right-3 top-3 text-xl hover:text-amber-300"><FontAwesomeIcon className="text-2xl" icon={faXmark}/></button>
      <div className="h-5/6 w-5/6 bg-stone-800 content overflow-auto p-4 border border-white text-white">
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

