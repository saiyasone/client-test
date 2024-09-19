import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_FILE } from "api/graphql/file.graphql";
import { IFileTypes } from "types/filesType";
import { errorMessage, successMessage } from "utils/alert.util";
import { ReturnFileLockedMessage } from "utils/message";
import CryptoJS from "crypto-js";

interface LockedFileTypes {
  data: IFileTypes;
  password: string;
}

interface LockedFileResponse {
  success: boolean;
  message: string;
}

const useLockedFile = () => {
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);

  const createLockFile = async ({
    data,
    password,
  }: LockedFileTypes): Promise<LockedFileResponse> => {
    try {
      if (data.filePassword && data.filePassword !== null) {
        return {
          success: false,
          message: ReturnFileLockedMessage.LockedFileExits,
        };
      }
      if (!password) {
        return {
          success: false,
          message: ReturnFileLockedMessage.RequiredPassord,
        };
      }

      const genCodePassword = CryptoJS.MD5(password).toString();
      const result = await updateFile({
        variables: {
          data: {
            filePassword: genCodePassword,
          },
          where: {
            _id: data._id,
          },
        },
      });

      if (result.data?.updateFiles?._id) {
        const successMsg = ReturnFileLockedMessage.LockedFileSuccess;
        return { success: true, message: successMsg };
      } else {
        return {
          success: false,
          message: ReturnFileLockedMessage.LockedFileFailed,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: ReturnFileLockedMessage.LockedFileError,
      };
    }
  };
  return { createLockFile };
};

export { useLockedFile };
