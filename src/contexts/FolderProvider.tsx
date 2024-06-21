import { useLazyQuery } from "@apollo/client";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import { ENV_KEYS } from "constants/env.constant";
import { createContext, useEffect, useReducer, useState } from "react";
import { decryptData, encryptData } from "utils/secure.util";

export const FolderContext = createContext({});

const reducer = (_state, action) => {
  const folderEncrypted = encryptData(JSON.stringify(action.payload));
  localStorage.setItem(ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY, folderEncrypted);
  return action.payload;
};

const FolderProvider = ({ children }) => {
  // const folderIdStorage = localStorage.getItem("folderId");
  const folderIdStorage = localStorage.getItem(
    ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY,
  );
  const folderDecrypted = decryptData(folderIdStorage);

  const [folderId, dispatch] = useReducer(reducer, folderDecrypted);
  const [getFolders, { data: folderData }] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  // trigger when pin in main folder
  const [triggerFolder, setTriggerFolder] = useState(false);

  // triger when copy files or folders
  const [copyTrigger, setCopyTrigger] = useState("");
  const folderPath = `${window.origin}/folder`;
  const currentPath = `${window.origin}${location.pathname.slice(
    0,
    location.pathname.lastIndexOf("/"),
  )}`;

  const handleTriggerFolder = () => {
    setTriggerFolder(!triggerFolder);
  };

  const handleTriggerCopy = (url) => {
    setCopyTrigger(url);
  };

  const setFolderId = (id) => {
    dispatch({ payload: id });
  };

  useEffect(() => {
    if (folderPath !== currentPath) {
      // localStorage.setItem("folderId", 0);
      const folderEncrypted = encryptData(JSON.stringify("0"));
      localStorage.setItem(
        ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY,
        folderEncrypted,
      );
      setFolderId(0);
    }
  }, [location]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (
        // e.key === "folderId"
        e.key === ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY
      ) {
        if (!e.newValue) {
          // localStorage.setItem("folderId", e.oldValue);
          localStorage.setItem(
            ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY,
            e.oldValue,
          );
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (folderId) {
      getFolders({
        variables: {
          where: {
            _id: folderId,
          },
        },
      });
    }
  }, [folderId]);

  return (
    <FolderContext.Provider
      value={{
        folderId,
        triggerFolder,
        copyTrigger,

        trackingFolderData: folderData?.folders?.data?.[0] || null,
        setFolderId,
        handleTriggerFolder,
        handleTriggerCopy,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export default FolderProvider;
