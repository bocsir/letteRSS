
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faArrowDownZA, faArrowDownAZ } from "@fortawesome/free-solid-svg-icons";

interface SortingMenuProps {
  sortMenu: boolean;
  setSortMenu: (value: boolean) => void;
  sortFeeds: (isAlphabetical: boolean) => void;
}

const SortingMenu: React.FC<SortingMenuProps> = ({ sortMenu, setSortMenu, sortFeeds }) => {
  return (
    <div className="relative">
      <FontAwesomeIcon
        onClick={() => setSortMenu(!sortMenu)}
        className="text-base text-neutral-500 cursor-pointer active:text-yellow-500" icon={faSort} />
      {sortMenu && (
        <div
          className="flex font-bold items-center justify-around absolute left-4 top-0 z-20 bg-neutral-900 border-2 border-neutral-500 rounded-md w-max"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => sortFeeds(true)}
            className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
          >
            <FontAwesomeIcon icon={faArrowDownAZ} />
          </button>
          <div className="w-[2px] h-[24px] bg-neutral-500"></div>
          <button
            onClick={() => sortFeeds(false)}
            className="text-white transition-color duration-300 hover:text-amber-300 pl-4 pr-4"
          >
            <FontAwesomeIcon icon={faArrowDownZA} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SortingMenu;