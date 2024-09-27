import { useMutation } from "@apollo/client";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import { useState } from "react";
import { IUserTypes } from "types/userType";

export const useDeleteFolder = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [deleteFolder] = useMutation(MUTATION_UPDATE_FOLDER, {
    refetchQueries: [QUERY_FOLDER],
  });

  const deleteSubFolderAndFile = async (data: any, user: IUserTypes) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await deleteFolder({
        variables: {
          where: {
            _id: data?._id,
          },
          data: {
            status: "deleted",
            createdBy: user?._id,
          },
        },
      });
      if (result?.data?.updateFolders?._id) {
        setSuccess(true);
        setLoading(false);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error);
      }
    }
  };


  return {
    deleteSubFolderAndFile,
    loading,
    error,
    success,
  };
};
