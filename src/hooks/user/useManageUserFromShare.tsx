import { useLazyQuery, useMutation } from "@apollo/client";
import {
  MUTATION_DELETE_SHARE,
  MUTATION_UPDATE_SHARE,
  QUERY_SHARE,
} from "api/graphql/share.graphql";
import { useEffect, useState } from "react";

const useManageUserFromShare = ({
  inputFileOrFolder,
  inputType,
  toAccount,
  user: _user,
}: any) => {
  const [getShares] = useLazyQuery(QUERY_SHARE, {
    fetchPolicy: "no-cache",
  });
  const [deleteShare] = useMutation(MUTATION_DELETE_SHARE, {
    fetchPolicy: "no-cache",
  });

  const [updateShare] = useMutation(MUTATION_UPDATE_SHARE, {
    fetchPolicy: "no-cache",
  });

  const [sharedUserList, setSharedUserList] = useState([]);

  useEffect(() => {
    const fetchActiveShare = async () => {
      if (Object.keys(inputFileOrFolder).length > 0) {
        const currentSharedUserList = (
          await getShares({
            variables: {
              where: {
                toAccount,
                ...(inputType === "folder"
                  ? {
                      folderId: inputFileOrFolder._id,
                    }
                  : {
                      fileId: inputFileOrFolder._id,
                    }),
                status: "active",
                isShare: "yes",
              },
              noLimit: true,
            },
          })
        ).data?.getShare.data;

        setSharedUserList(currentSharedUserList);
      }
    };

    fetchActiveShare();
  }, [inputFileOrFolder]);

  const handleDeletedUserFromShareOnSave = async (
    sharedData,
    { onFailed, onSuccess }: any,
  ) => {
    try {
      if (sharedData.length > 0) {
        await Promise.all(
          sharedData.map(async (data) => {
            await deleteShare({
              variables: {
                id: data._id,
                email: data?.toAccount?.email,
              },
            });
          }),
        );
        onSuccess?.();
      }
    } catch (e) {
      console.error(e);
      onFailed?.();
    }
  };

  const handleChangedUserFromShareOnSave = async (
    sharedData,
    { onFailed, onSuccess }: any,
  ) => {
    try {
      if (sharedData.length > 0) {
        await Promise.all(
          sharedData.map(async (data) => {
            await updateShare({
              variables: {
                id: data._id,
                body: {
                  permission: data._permission,
                  toAccount: data.toAccount?.email,
                },
              },
            });
          }),
        );
        onSuccess?.();
      }
    } catch (e) {
      onFailed?.();
    }
  };

  return {
    sharedUserList,
    setSharedUserList,
    handleDeletedUserFromShareOnSave,
    handleChangedUserFromShareOnSave,
  };
};

export default useManageUserFromShare;
