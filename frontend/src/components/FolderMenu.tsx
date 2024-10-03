import {
    faFolder,
    faFolderOpen,
    faPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import api from "../api";

interface FolderMenuProps {
    updateMenuBtnHover: (index: number, isHovering: boolean) => void;
    selectedFeeds: string[];
    folders: {
        [key: string]: string | null;
    };
    getFeedNames: any;
}

const FolderMenu: React.FC<FolderMenuProps> = ({ updateMenuBtnHover, selectedFeeds, folders, getFeedNames }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [creatingNewFolder, setCreatingNewFolder] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [folderNames, setFolderNames] = useState<string[]>([]);

    const createNewFolder = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setCreatingNewFolder(!creatingNewFolder);
    };

    const addNewFolder = () => {
        const newFolderNames: string[] = folderNames;
        console.log(newFolderName);
        newFolderNames.push(newFolderName);
        setCreatingNewFolder(false)
        setFolderNames(newFolderNames);
    }

    useEffect(() => {
        const newFolderNames: string[] = Object.values(folders)
            .filter((folderName): folderName is string => Boolean(folderName))
            .filter((folderName, index, self) => self.indexOf(folderName) === index);

        setFolderNames(newFolderNames);
    }, [folders])

    const addToFolder = async (folderName: string) => {
        try {
            const res = await api.post('/feed/updateFolderStatus',
                {
                    folderName: folderName,
                    feedsInFolder: selectedFeeds,
                }
            );
            console.log(res);
            setIsOpen(!isOpen);
            await getFeedNames();
        } catch (err) {
            console.error(err);
        }
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
                        <p className="font-bold -mb-2">Feeds:</p>
                        <div className="border border-neutral-500 w-full rounded p-3 pt-2">
                            <ul className="text-sm">

                                {selectedFeeds.map((feed, index) => (
                                    <li key={index}>{feed}</li>
                                ))}
                                {selectedFeeds.length < 1 && (
                                    <p className="text-neutral-300">sry - pls go back and select one or more feeds</p>
                                )}

                            </ul>
                        </div>

                        <div className="flex flex-col items-start">
                            {/* list all folders as buttons  */}
                            <p className="font-bold">Select destination folder:</p>
                            <div className="flex flex-col gap-1 items-start w-full">
                                {folderNames.filter((name) => name !== '').map((name, index) => (
                                    <button onClick={() => addToFolder(name)} className="text-white hover:text-amber-300 transition-color duration-150" key={index}><FontAwesomeIcon icon={faFolder} className="mr-2" />{name}</button>
                                ))}
                            </div>
                            {!creatingNewFolder
                                ? (
                                    <button onClick={(e) => createNewFolder(e)} className="text-sm text-neutral-300 hover:text-neutral-500">
                                        <FontAwesomeIcon className="text-xs mr-1" icon={faPlus} />
                                        new folder
                                    </button>
                                ) : (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        addNewFolder()
                                    }} className="w-full bg-black rounded p-3 pt-1 mt-2 flex flex-col gap-2">
                                        <p className="text-amber-300">Creating new folder...</p>
                                        <input
                                            type="text"
                                            id="feed-url"
                                            name="feed-url"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            className="text-white placeholder:text-neutral-500 bg-black text-base pl-2 pr-1 rounded w-full h-8 mr-10 border border-neutral-500"
                                            placeholder="enter folder name"
                                        ></input>
                                        <div className="grid grid-flow-col justify-stretch gap-2 w-full">
                                            <button type="button" className="hover:text-neutral-500 text-white transition-color duration-150 ease-in-out bg-neutral-900 rounded" onClick={() => { setCreatingNewFolder(false); setNewFolderName(''); }}>cancel</button>
                                            <button type="submit" className="hover:text-amber-300 text-white transition-color duration-150 ease-in-out bg-neutral-900 rounded">submit</button>
                                        </div>
                                    </form>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FolderMenu;
