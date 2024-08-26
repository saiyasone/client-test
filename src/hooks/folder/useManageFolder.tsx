import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_FOLDER } from "api/graphql/folder.graphql";
import { ENV_KEYS } from "constants/env.constant";
import CryptoJS from "crypto-js";

const useManageFolder = ({ user }) => {
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);

  const dataEncrypted = ({ headers }) => {
    const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(headers), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const ivText = iv.toString(CryptoJS.enc.Base64);
    const encryptedData = cipherText + ":" + ivText;

    return encryptedData;
  };

  const handleAddPinFolder = async (
    id,
    pin,
    { onSuccess, onFailed, onClosure },
  ) => {
    try {
      await updateFolder({
        variables: {
          where: {
            _id: id,
          },
          data: {
            pin,
            updatedBy: user?._id,
          },
        },
        onCompleted: async (data) => {
          onSuccess?.(data?.updateFolders);
        },
      });
    } catch (error) {
      onFailed?.(error);
    } finally {
      onClosure?.();
    }
  };

  const handleRenameFolder = async (
    { id, inputNewFolderName, checkFolder, user: _user, parentKey }: any,
    { onSuccess, onFailed, onClosure },
  ) => {
    try {
      await updateFolder({
        variables: {
          where: {
            _id: parseInt(`${id}`),
            checkFolder: checkFolder || "main",
          },
          data: {
            ...(parentKey && {
              parentkey: parseInt(parentKey),
            }),
            folder_name: inputNewFolderName,
            updatedBy: _user?.id || user?._id,
          },
        },
        onCompleted: (data) => {
          onSuccess?.(data?.updateFolders);
        },
      });
    } catch (e) {
      onFailed?.(e);
    } finally {
      onClosure?.();
    }
  };

  const handleDownloadFolder = async (
    { id: _id, newPath, folderName, user: _user }: any,
    { onSuccess, onFailed, onClosure }: any,
  ) => {
    const userData = _user || user;
    let real_path = "";
    const downloadedFolderName = `${folderName}.zip`;
    if (newPath) {
      real_path = newPath;
    } else {
      real_path = "";
    }

    try {
      const headers = {
        accept: "/",
        isFolder: true,
        path: userData.newName + "-" + userData._id + "/" + real_path,
        fileName: CryptoJS.enc.Utf8.parse(downloadedFolderName),
        _id: _id,
        createdBy: userData?._id,
      };

      const encryptedData = dataEncrypted({ headers });

      const response: any = await fetch(ENV_KEYS.VITE_APP_DOWNLOAD_URL, {
        headers: { encryptedHeaders: encryptedData },
      });

      const reader = response.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            try {
              const { done, value } = await reader.read();

              if (done) {
                onSuccess?.();
                controller.close();
                break;
              }

              controller.enqueue(value);
            } catch (error) {
              onFailed?.();
              controller.error(error);
              break;
            }
          }
        },
      });

      const blob = await new Response(stream).blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadedFolderName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      onFailed?.(error);
    } finally {
      onClosure?.();
    }
  };

  const handleMultipleDownloadFolder = async (
    { multipleData },
    { onSuccess, onFailed },
  ) => {
    try {
      const newModel = multipleData.map((folder) => {
        let real_path = "";
        if (folder.newPath) {
          real_path = folder.newPath;
        }

        return {
          accept: "/",
          isFolder: true,
          path: `${folder.createdBy?.newName}-${folder.createdBy?._id}/${real_path}`,
          fileName: CryptoJS.enc.Utf8.parse("vsharez.zip"),
          _id: folder.id,
          createdBy: folder.createdBy?._id,
        };
      });

      const headers = {
        accept: "/",
        lists: newModel,
      };

      const encryptedData = dataEncrypted({ headers });
      const baseUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/download-multifolders?download=${encryptedData}`;

      setTimeout(() => {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";

        iframe.onload = () => {
          document.body.removeChild(iframe);
        };

        iframe.src = baseUrl;
        document.body.appendChild(iframe);

        setTimeout(() => {
          onSuccess();
        }, 500);
      }, 1000);
    } catch (error) {
      onFailed?.(error);
    }
  };

  return {
    handleRenameFolder,
    handleAddPinFolder,
    handleDownloadFolder,
    handleMultipleDownloadFolder,
  };
};

export default useManageFolder;
