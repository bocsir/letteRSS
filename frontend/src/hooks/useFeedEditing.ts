
import { useState } from "react";
import api from "../api";
import { ArticleItem, Feeds } from "../interfaces";

const useFeedEditing = (feedNames: any, setFeedNames: any, feeds: Feeds, setFeeds: any, populatedFolders: any, setPopulatedFolders: any, showSaveBtn: any, setShowSaveBtn: any, folders: any, setFolders: any) => {
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [isEditable, setIsEditable] = useState<boolean>(false);

  const sortFeeds = (isAlphabetical: boolean) => {
    const currentFeeds: string[] = [];

    Object.keys(feeds).map((name) => {
      currentFeeds.push(name);
    });

    const sortedFeeds = (isAlphabetical)
      ? currentFeeds.sort((a, b) => a.localeCompare(b))
      : currentFeeds.sort((a, b) => b.localeCompare(a));

    const sortedObj: Record<string, null> = {};
    sortedFeeds.forEach(item => {
      sortedObj[item] = null;
    });

    const newFeedsObj = Object.assign(sortedObj, feeds);
    setFeeds(newFeedsObj);
  };

  const updateSelectedItems = (e: any, feedIndex: string) => {
    let newFeeds;
    if (e.target.checked) {
      newFeeds = [
        ...selectedFeeds,
        feedIndex
      ];
    } else {
      newFeeds = selectedFeeds.filter(item => item !== feedIndex);
    }
    setSelectedFeeds(newFeeds);
  };

  const deleteSelected = async () => {
    if (selectedFeeds.length === 0) {
      return;
    }

    try {
      const res = await api.post('/feed/deleteFeeds', selectedFeeds);
      if (res.status === 200) {
        selectedFeeds.map(item => {
          delete feeds[item];
          Object.keys(populatedFolders).forEach((name) => {
            delete populatedFolders[name].feeds[item];
          });
          setSelectedFeeds([]);
          setIsEditable(false);
        });
      }
    } catch (err) {
      console.error('error deleting feed', err);
    }
  };

  //changes not reflected in input element in FeedList.tsx
  const updateFeedName = (
    e: React.ChangeEvent<HTMLInputElement>,
    feedIndex: string
  ) => {
    const newName = e.target.value;

    //swap last feed name with new feed name
    const updatedFeedNames: { [key: string]: ArticleItem[] | string } = {
      ...feedNames,
      [feedIndex]: newName,
    };

    //update name and set to show save button
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [feedIndex]: true
    };

    setShowSaveBtn(updatedSaveBtnStatus);
    setFeedNames(updatedFeedNames);
  };

//need to get folders and update it with new name

  //on save button click
  const sendFeedNames = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
    e.stopPropagation();

    //hide save button
    const updatedSaveBtnStatus = {
      ...showSaveBtn,
      [name]: false
    };
    setShowSaveBtn(updatedSaveBtnStatus);

    //update folders to keep newly named feed in the same folder
    const updatedFolders = { ...folders, [feedNames[name]]: folders[name] };
    delete updatedFolders[name];
    setFolders(updatedFolders);

    //update feeds with new name, keeping its value
    let newFeeds: any = { ...feeds, [feedNames[name]]: feeds[name] };
    delete newFeeds[name];
    setFeeds(newFeeds);

    const res = await api.post(
      "/feed/changeFeedName",
      {
        newName: feedNames[name],
        oldName: name
      }
    );
  };

  return {
    selectedFeeds,
    setSelectedFeeds,
    isEditable,
    setIsEditable,
    sortFeeds,
    updateSelectedItems,
    deleteSelected,
    updateFeedName,
    sendFeedNames
  };
};

export default useFeedEditing;