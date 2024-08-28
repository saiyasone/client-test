import { useLazyQuery } from "@apollo/client";
import {
  QUERY_FILE_SHARE_PUBLIC,
  QUERY_FOLDER_SHARE_PUBLIC,
  QUERY_SHARE,
} from "api/graphql/share.graphql";
import { useEffect, useState } from "react";

const useFetchSharedSubFolderAndFile = (parentId, user) => {
  const [getShareData, { data: dataFetching, called }] = useLazyQuery(
    QUERY_SHARE,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [isDataFound, setDataFound] = useState<any>(null);
  const [mainData, setMainData] = useState<any>(null);
  const [getFolderData] = useLazyQuery(QUERY_FOLDER_SHARE_PUBLIC, {
    fetchPolicy: "no-cache",
  });

  const [getFileData] = useLazyQuery(QUERY_FILE_SHARE_PUBLIC, {
    fetchPolicy: "no-cache",
  });

  const getSharedSubFoldersAndFiles = () => {
    getShareData({
      variables: {
        where: {
          status: "active",
          parentKey: parentId,
          toAccount: user.email,
        },
        orderBy: "updatedAt_DESC",
      },
    });
  };

  useEffect(() => {
    if (parentId && user?.email) {
      getSharedSubFoldersAndFiles();
    }
  }, [parentId, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryData = dataFetching?.getShare?.data || [];

        if (queryData !== undefined) {
          if (queryData.length > 0) {
            setDataFound(true);
          } else {
            setDataFound(false);
          }
        }

        const folderData = queryData?.filter(
          (data) => data.folderId && data.folderId._id,
        );
        const fileData = queryData?.filter(
          (data) =>
            data.fileId && data.fileId._id && data.fileId?.status === "active",
        );

        const result = {
          folders: {
            data: await Promise.all(
              folderData
                .map(async (data) => {
                  const [folderById] =
                    (
                      await getFolderData({
                        variables: {
                          id: data.folderId._id,
                        },
                      })
                    ).data?.folderPublic?.data || [];

                  if (folderById) {
                    return {
                      ...folderById,
                      sharedId: data._id,
                      name: folderById.folder_name,
                      type: folderById.folder_type,
                      newName: folderById.newFolder_name,
                      id: data.folderId._id,
                      isContainsFiles:
                        folderById.folder_?.item !== "0" ? true : false,
                      pin: folderById.pin ? 1 : 0,
                      checkTypeItem: "folder",
                      permission: data.permission,
                    };
                  }
                })
                .filter((data) => data),
            ),
            total: folderData.length,
          },

          files: {
            data: await Promise.all(
              fileData
                .map(async (data) => {
                  const [fileById] =
                    (
                      await getFileData({
                        variables: {
                          id: [data.fileId._id],
                        },
                      })
                    ).data?.filePublic?.data || [];
                  if (fileById) {
                    return {
                      ...fileById,
                      sharedId: data._id,
                      name: fileById.filename,
                      type: fileById.fileType,
                      newName: fileById.newFilename,
                      id: fileById._id,
                      favorite: fileById.favorite ? 1 : 0,
                      totalDownload: fileById.totalDownload || 0,
                      checkTypeItem: "file",
                      permission: data.permission,
                    };
                  }
                })
                .filter((data) => data),
            ),
            total: fileData.length,
          },
        };

        setMainData(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [dataFetching]);

  return {
    data: mainData,
    called,
    isDataFound,
    refetch: getSharedSubFoldersAndFiles,
    setData: setMainData,
  };
};

export default useFetchSharedSubFolderAndFile;
