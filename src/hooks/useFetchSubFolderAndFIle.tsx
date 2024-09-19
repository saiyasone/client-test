import { useLazyQuery } from "@apollo/client";
import { QUERY_FILE } from "api/graphql/file.graphql";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import { useEffect, useState } from "react";

const useFetchSubFolderAndFile = ({
  id: parentId,
  limit,
  currentPage,
  toggle,
  limitScroll,
  name,
}) => {
  const [isFolderDataFound, setFolderDataFound] = useState<any>(null);
  const [isFileDataFound, setFileDataFound] = useState<any>(null);
  const [folderData, setFolderData] = useState<any>(null);
  const [folderTotal, setFolderTotal] = useState<any>(0);
  const [fileData, setFileData] = useState<any>(null);
  const [fileTotal, setFileTotal] = useState<any>(0);
  const [getFolder, { loading: folderLoading }] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  const [getFile, { loading: fileLoading }] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });

  const resetFolderData = () => {
    setFolderData([]);
    setFolderTotal(0);
    setFolderDataFound(false);
  };

  const resetFileData = () => {
    setFileData([]);
    setFileTotal(0);
    setFileDataFound(false);
  };

  const queryListDataFileAndFolder = async () => {
    if (parentId) {
      if (toggle === "list") {
        const skip = (currentPage - 1) * limit;
        await getFolder({
          variables: {
            where: {
              parentkey: parseInt(parentId),
              ...(name && {
                folder_name: name,
              }),
              status: "active",
            },
            orderBy: "updatedAt_DESC",
            limit,
            skip,
          },
          onCompleted: (data) => {
            if (data?.folders?.data?.length > 0) {
              setFolderData(
                data?.folders?.data?.map((folder) => {
                  return {
                    ...folder,
                    name: folder.folder_name,
                    newName: folder.newFolder_name,
                    type: folder.folder_type,
                    isContainsFiles: folder.total_size
                      ? folder.total_size > 0
                        ? true
                        : false
                      : 0,
                  };
                }) || [],
              );
              setFolderTotal(data?.folders?.total);
              setFolderDataFound(true);
            } else {
              resetFolderData();
            }
          },
        });
        await getFile({
          variables: {
            where: {
              folder_id: parseInt(parentId),
              ...(name && {
                filename: name,
              }),
              status: "active",
            },
            orderBy: "updatedAt_DESC",
            limit,
            skip,
          },
          onCompleted: (data) => {
            if (data?.files?.data?.length > 0) {
              setFileData(
                data?.files?.data?.map((file) => {
                  return {
                    ...file,
                    name: file.filename,
                    newName: file.newFilename,
                    type: file.fileType,
                  };
                }) || [],
              );
              setFileTotal(data?.files?.total);
              setFileDataFound(true);
            } else {
              resetFileData();
            }
          },
        });
      }
    }
  };

  useEffect(() => {
    queryListDataFileAndFolder();
  }, [parentId, currentPage, toggle, name]);

  const queryGridDataFileAndFolder = async () => {
    if (parentId) {
      if (toggle === "grid") {
        await getFolder({
          variables: {
            where: {
              parentkey: parseInt(parentId),
              ...(name && {
                folder_name: name,
              }),
              status: "active",
            },
            orderBy: "updatedAt_DESC",
            limit: limitScroll,
          },
          onCompleted: (data) => {
            if (data?.folders?.data?.length > 0) {
              setFolderData(
                data?.folders?.data?.map((folder) => {
                  return {
                    ...folder,
                    name: folder.folder_name,
                    newName: folder.newFolder_name,
                    type: folder.folder_type,
                    isContainsFiles: folder.total_size
                      ? folder.total_size > 0
                        ? true
                        : false
                      : 0,
                  };
                }) || [],
              );
              setFolderTotal(data?.folders?.total);
              setFolderDataFound(true);
            } else {
              resetFolderData();
            }
          },
        });
        await getFile({
          variables: {
            where: {
              folder_id: parseInt(parentId),
              ...(name && {
                filename: name,
              }),
              status: "active",
            },
            orderBy: "updatedAt_DESC",
            limit: limitScroll,
          },
          onCompleted: (data) => {
            if (data?.files?.data?.length > 0) {
              setFileData(
                data?.files?.data?.map((file) => {
                  return {
                    ...file,
                    name: file.filename,
                    newName: file.newFilename,
                    type: file.fileType,
                  };
                }) || [],
              );
              setFileTotal(data?.files?.total);
              setFileDataFound(true);
            } else {
              resetFileData();
            }
          },
        });
      }
    }
  };

  useEffect(() => {
    queryGridDataFileAndFolder();
  }, [parentId, toggle, limitScroll, name]);

  return {
    files: {
      data: fileData,
      total: fileData?.length || 0,
      isDataFound: isFileDataFound,
      loading: fileLoading,
    },
    folders: {
      data: folderData,
      total: folderData?.length || 0,
      isDataFound: isFolderDataFound,
      loading: folderLoading,
    },
    total: (fileData?.length || 0) + (folderData?.length || 0),
    apiTotal: folderTotal + fileTotal,
    queryGridDataFileAndFolder,
    queryListDataFileAndFolder,
    resetFolderData,
    resetFileData,
  };
};

export default useFetchSubFolderAndFile;
