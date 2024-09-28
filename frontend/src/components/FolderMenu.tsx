import {
    faArrowRight,
    faFolder,
    faFolderOpen,
    faPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface FolderMenuProps {
    updateMenuBtnHover: (index: number, isHovering: boolean) => void;
    // folderList: string[]
}

const FolderMenu: React.FC<FolderMenuProps> = ({ updateMenuBtnHover }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [creatingNewFolder, setCreatingNewFolder] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');

    const toggleIsOpen = () => {
        if (isOpen) {
            updateMenuBtnHover(1, false);
        }
        setIsOpen(!isOpen);
    };

    const createNewFolder = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setCreatingNewFolder(!creatingNewFolder);
    };

    const updateFolderName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFolderName(e.target.value);
    }

    return (
        <>
            <button
                className="relative hover:text-neutral-500"
                onMouseEnter={() => updateMenuBtnHover(1, true)}
                onMouseLeave={() => updateMenuBtnHover(1, false)}
            >
                <FontAwesomeIcon
                    icon={faFolderOpen}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </button>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-screen h-full backdrop-blur-[2px] fixed top-0 left-0 z-20 flex flex-col items-center justify-start pt-36"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col gap-3 p-4 h-min relative border-gray-400 border-2 bg-neutral-900 rounded-md z-10"
                    >
                        <div className="w-full flex justify-end absolute -top-7 right-0">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-xl hover:text-amber-300"
                            >
                                <FontAwesomeIcon className="text-2xl" icon={faXmark} />
                            </button>
                        </div>

                        <p className="text-xl text-neutral-500">Organize selected feeds</p>
                        <div className="border border-neutral-500 w-full rounded p-3 pt-2">
                            <ul className="text-sm">
                                <li>Psychcool</li>
                                <li>Non Sequitor</li>
                                <li>Fat Cat</li>
                            </ul>
                        </div>

                        <form className="flex flex-col items-start">
                            {/* list all folders as buttons  */}
                            <p className="font-bold">Select destination folder:</p>
                            <div className="flex flex-col gap-1 items-start w-full [&>button]:text-white [&>button]:hover:text-amber-300 [&>button]:transition-color [&>button]:duration-150">
                                <button><FontAwesomeIcon icon={faFolder}/> default</button>
                                <button><FontAwesomeIcon icon={faFolder}/> reddit</button>
                                <button><FontAwesomeIcon icon={faFolder}/> news</button>

                            </div>
                            {!creatingNewFolder
                                ? (
                                    <button onClick={(e) => createNewFolder(e)} className="text-sm text-neutral-300 hover:text-neutral-500">
                                        <FontAwesomeIcon className="text-xs mr-1" icon={faPlus} />
                                        new folder
                                    </button>
                                ) : (
                                    <form className="w-full bg-black rounded p-3 pt-1 mt-2 flex flex-col gap-2">
                                        <p className="text-amber-300">Creating new folder...</p>
                                        <input
                                            type="text"
                                            id="feed-url"
                                            name="feed-url"
                                            value={newFolderName}
                                            onChange={(e) => updateFolderName(e)}
                                            className="text-white placeholder:text-neutral-500 bg-black text-base pl-2 pr-1 rounded w-full h-8 mr-10 border border-neutral-500"
                                            placeholder="enter folder name"
                                        ></input>
                                        <div className="grid grid-flow-col justify-stretch gap-2 w-full">
                                            <button className="hover:text-neutral-500 text-white transition-color duration-150 ease-in-out bg-neutral-900 rounded" onClick={() => {setCreatingNewFolder(false); setNewFolderName('');}}>cancel</button>
                                            <button type="submit" className="hover:text-amber-300 text-white transition-color duration-150 ease-in-out bg-neutral-900 rounded" onClick={() => setCreatingNewFolder(false)}>submit</button>
                                        </div>
                                    </form>
                                )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default FolderMenu;
