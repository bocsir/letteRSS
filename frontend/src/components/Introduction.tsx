import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";


const Introduction = () => {

    return (
        <div className="text-yellow-500 bg-neutral-700 p-2 rounded-sm border-yellow-500 border">
            <p>To add a feed, click <FontAwesomeIcon icon={faEllipsis} className="text-[#737373] text-xl bg-neutral-800 px-2 height-[3px] rounded"/> then click <span className="text-white bg-neutral-800 px-2 rounded">New Feed</span>. You can add feeds by URL or with an .opml file.</p>
        </div>
    )
}
export default Introduction;