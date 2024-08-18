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
      <div className="flex justify-end w-5/6">
        <ToggleSwitch isChecked={isChecked} setIsChecked={setIsChecked}/>

        <button onClick={changePortalState} className="relative text-xl hover:text-amber-300"><FontAwesomeIcon className="text-2xl" icon={faXmark}/></button><br/>
      </div>

      {/* TODO: make this variable width like a window, add iframe option to site */}

      <div className="h-5/6 w-5/6 bg-stone-800 content overflow-auto p-4 border border-white text-white">
      <div className="relative w-full">
      </div>

      <a href={link} className="hover:text-amber-300">{link}</a>
        <p>{date}</p>

        <br/>
        <hr/>
        <br/>
        { isChecked ? (
          <iframe className="w-full h-full"  src={link} title={link}></iframe>
          ) : ''
        }
        


        {(sanitizedContent && !isChecked) ? (
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

