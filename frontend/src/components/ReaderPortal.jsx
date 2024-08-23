import { createPortal } from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { ToggleSwitch } from './ToggleSwitch';
import { useState } from "react";

const ReaderPortal = ({ item, link, date, sanitizedContent, setIsPortalVisible }) => {
  const [isChecked, setIsChecked] = useState(false);

  const changePortalState = () => {
    setIsPortalVisible(false);
  }

  return createPortal (
    <div className="w-screen h-screen fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="flex justify-between items-center w-3/6 text-sm">
        <div className="flex  gap-2">
          <a href={link} className="hover:text-amber-300">{link}</a>
          <p>{date}</p>
        </div>
        <div className="flex justify-end w-3/6">
          <ToggleSwitch isChecked={isChecked} setIsChecked={setIsChecked}/>
          <button onClick={changePortalState} className="relative text-xl hover:text-amber-300"><FontAwesomeIcon className="text-2xl" icon={faXmark}/></button><br/>
        </div>
      </div>
      {/* TODO: make this variable width like a window, add iframe option to site */}

      <div className={`h-5/6 w-3/6 bg-stone-800 content overflow-auto border border-white text-white ${isChecked ? "p-0" : "p-4"}`}>
      <div className="relative w-full">
      </div>

        { isChecked ? (
            <iframe className="w-full h-full"  src={link} title={link}></iframe>
          ) : (
            (sanitizedContent) ? ( 
              <>
              <div  
                className="text-base leading-5" 
                dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
              </>
            ) : (
              <p>No content to display</p>
            )   
          )
        }
        


      </div>
    </div>,
    document.body
  ); 
};

export default ReaderPortal;

