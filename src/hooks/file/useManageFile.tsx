import { useMutation } from "@apollo/client";
import {
  MUTATION_ACTION_FILE,
  MUTATION_COPY_FILE,
  MUTATION_CREATE_FILE,
  MUTATION_CREATE_SHORT_LINK,
  MUTATION_DELETE_FILE_FOREVER,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import CryptoJS from "crypto-js";
import { errorMessage } from "utils/alert.util";
import {
  isDateEarlierThisMonth,
  isDateEarlierThisWeek,
  isDateEarlierThisYear,
  isDateLastMonth,
  isDateLastWeek,
  isDateLastYear,
  isDateOnToday,
  isDateYesterday,
} from "utils/date.util";
import {
  getFileNameExtension,
  readBlob,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { safeGetProperty } from "utils/object.util";
import { v4 as uuidv4 } from "uuid";

const useManageFile = ({ user }) => {
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFiles] = useMutation(MUTATION_CREATE_FILE);
  const [deleteFileForever] = useMutation(MUTATION_DELETE_FILE_FOREVER);
  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const [createMultipleLink] = useMutation(MUTATION_CREATE_SHORT_LINK);
  const [uploadToBunny] = useMutation(MUTATION_COPY_FILE);

  //move to file to trash

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

  const startDownload = ({ baseUrl }) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";

    iframe.onload = () => {
      document.body.removeChild(iframe);
    };

    iframe.src = baseUrl;
    document.body.appendChild(iframe);
  };

  const splitDataByDate = (data, accessorKey) => {
    const result: any = [
      { title: "Today", data: [] },
      { title: "Yesterday", data: [] },
      { title: "Earlier this week", data: [] },
      { title: "Last week", data: [] },
      { title: "Earlier this month", data: [] },
      { title: "Last month", data: [] },
      { title: "Earlier this year", data: [] },
      { title: "Last year", data: [] },
    ];
    if (data?.length > 0) {
      data.forEach((item) => {
        const filteredItem = safeGetProperty(item, accessorKey);
        if (filteredItem && isDateOnToday(filteredItem)) {
          result[0].data.push(item);
        } else if (filteredItem && isDateYesterday(filteredItem)) {
          result[1].data.push(item);
        } else if (filteredItem && isDateEarlierThisWeek(filteredItem)) {
          result[2].data.push(item);
        } else if (filteredItem && isDateLastWeek(filteredItem)) {
          result[3].data.push(item);
        } else if (filteredItem && isDateEarlierThisMonth(filteredItem)) {
          result[4].data.push(item);
        } else if (filteredItem && isDateLastMonth(filteredItem)) {
          result[5].data.push(item);
        } else if (filteredItem && isDateEarlierThisYear(filteredItem)) {
          result[6].data.push(item);
        } else if (filteredItem && isDateLastYear(filteredItem)) {
          result[7].data.push(item);
        } else {
          if (filteredItem) {
            result[7].data.push(item);
          }
        }
      });
    }
    return result;
  };

  const handleActionFile = async ({ event, userId, id }) => {
    try {
      await fileAction({
        variables: {
          fileInput: {
            createdBy: parseInt(`${userId}`),
            fileId: parseInt(`${id}`),
            actionStatus: event,
          },
        },
      });
    } catch (error: any) {
      errorMessage(error, 2500);
    }
  };

  const handleDeleteFile = async (id, { onSuccess, onFailed }: any) => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: parseInt(`${id}`),
          },
          data: {
            status: "deleted",
            createdBy: user?._id,
          },
        },
        onCompleted: (data) => {
          onSuccess?.(data?.updateFiles);
        },
      });
    } catch (e) {
      onFailed?.(e);
    }
  };

  //delete persistent file
  const handleDeleteFileForever = async (id, { onSuccess, onFailed }: any) => {
    try {
      await deleteFileForever({
        variables: {
          id: parseInt(`${id}`),
        },
        onCompleted: (data) => {
          onSuccess?.(data?.deleteFilesTrash);
        },
      });
    } catch (e) {
      onFailed?.(e);
    }
  };

  //restore file
  const handleRestoreFile = async (id, { onSuccess, onFailed }) => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: parseInt(`${id}`),
          },
          data: {
            status: "active",
          },
        },
        onCompleted: (data) => {
          onSuccess?.(data?.updateFiles);
        },
      });
    } catch (e) {
      onFailed?.(e);
    }
  };

  //rename file
  const handleRenameFile = async (
    { id, parentKey }: any,
    inputNewFilename,
    { onSuccess, onFailed, onClosure }: any,
  ) => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: parseInt(`${id}`),
          },
          data: {
            ...(parentKey && {
              folder_id: parentKey,
            }),
            filename: inputNewFilename,
            updatedBy: user?._id,
          },
        },
        onCompleted: (data) => {
          onSuccess?.(data?.updateFiles);
        },
      });
    } catch (e) {
      onFailed?.(e);
    } finally {
      onClosure?.();
    }
  };

  //add favorite file
  const handleFavoriteFile = async (
    id,
    inputFavorite,
    { onSuccess, onFailed },
  ) => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: parseInt(`${id}`),
          },
          data: {
            favorite: inputFavorite,
            updatedBy: user?._id,
          },
        },
        onCompleted: (data) => {
          onSuccess?.(data?.updateFiles);
        },
      });
    } catch (e) {
      onFailed?.(e);
    }
  };

  //download file
  const handleDownloadFile = async (
    { id, newPath, newFilename, filename, user: _user, isPublicPath }: any,
    { onProcess, onSuccess, onFailed, onClosure },
  ) => {
    const userData = _user || user;
    let real_path;
    if (newPath === null) {
      real_path = "";
    } else {
      real_path = removeFileNameOutOfPath(newPath);
    }
    try {
      const headers = {
        accept: "*/*",
        storageZoneName: ENV_KEYS.VITE_APP_STORAGE_ZONE,
        isFolder: false,
        path:
          (isPublicPath ? "" : userData.newName + "-" + userData._id) +
          "/" +
          real_path +
          newFilename,
        fileName: CryptoJS.enc.Utf8.parse(filename),
        AccessKey: ENV_KEYS.VITE_APP_ACCESSKEY_BUNNY,
        createdBy: userData?._id,
      };

      const encryptedData = dataEncrypted({
        headers,
      });

      const response: any = await fetch(ENV_KEYS.VITE_APP_DOWNLOAD_URL, {
        headers: { encryptedHeaders: encryptedData },
      });

      const reader = response.body.getReader();
      const contentLength = +response.headers.get("Content-Length");
      let receivedLength = 0;
      const chunks: any[] = [];
      let countPercentage = 0;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        countPercentage = Math.round((receivedLength / contentLength) * 100);
        onProcess?.(countPercentage);
      }

      if (countPercentage !== 100) {
        throw new Error("error");
      }

      const blob = new Blob(chunks);
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      readBlob(href, async (res) => {
        if (res) {
          link.href = href;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          await updateFile({
            variables: {
              where: {
                _id: id,
              },
              data: {
                totalDownload: 1,
              },
            },
          });
          await handleActionFile({
            id,
            event: "download",
            userId: userData?._id,
          });
          onSuccess?.();
        } else {
          throw new Error("error");
        }
      });
    } catch (error) {
      await updateFile({
        variables: {
          where: {
            _id: id,
          },
          data: {
            totalDownloadFaild: 1,
          },
        },
      });
      onFailed?.(error);
    } finally {
      onClosure?.();
    }
  };

  // download single file
  const handleDownloadSingleFile = async (
    { multipleData },
    { onSuccess, onFailed, onClosure },
  ) => {
    try {
      const newModelData = multipleData.map((file) => {
        let real_path = "";
        if (file.newPath) {
          real_path = removeFileNameOutOfPath(file?.newPath);
        }

        return {
          isFolder: file.checkType === "folder" ? true : false,
          path: `${file.createdBy?.newName}-${file.createdBy?._id}/${real_path}${file.newFilename}`,
          _id: file.id,
          createdBy: file.createdBy?._id,
        };
      });

      const headers = {
        accept: "*/*",
        lists: newModelData,
        createdBy: multipleData?.[0].createdBy?._id,
        downloadBy: multipleData[0]?.toAccount?.email,
      };

      const encryptedData = dataEncrypted({ headers });
      const baseUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/download-multifolders-and-files?download=${encryptedData}`;

      startDownload({ baseUrl });
      onSuccess();
    } catch (error) {
      onFailed?.(error);
    } finally {
      onClosure?.();
    }
  };

  const handleSingleFileDropDownload = async (
    { multipleData },
    { onSuccess, onFailed, onClosure },
  ) => {
    try {
      const newModelData = multipleData.map((file) => {
        let real_path = "";
        if (file.createdBy?._id !== "0") {
          real_path = removeFileNameOutOfPath(file?.newPath);
          real_path = `${file.createdBy?.newName}-${file.createdBy?._id}/${real_path}${file.newFilename}`;
        } else {
          real_path = `public/${file.newFilename}`;
        }

        return {
          isFolder: false,
          path: real_path,
          _id: file.id,
          createdBy: file?.createdBy?._id,
        };
      });

      const headers = {
        accept: "*/*",
        lists: newModelData,
        createdBy: multipleData?.[0]?.createdBy?._id,
      };

      const encryptedData = dataEncrypted({ headers });
      const baseUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/download-multifolders-and-files?download=${encryptedData}`;

      startDownload({ baseUrl });
      onSuccess();
    } catch (error) {
      onFailed?.(error);
    } finally {
      onClosure?.();
    }
  };

  // download multiple files
  const handleMultipleDownloadFile = async (
    { multipleData },
    { onSuccess, onFailed },
  ) => {
    try {
      const newModelData = multipleData.map((file) => {
        let real_path = "";
        if (file.newPath) {
          real_path = removeFileNameOutOfPath(file?.newPath);
        }

        return {
          // _id: file.id,
          createdBy: file.createdBy?._id,
          path: `${file.createdBy?.newName}-${file.createdBy?._id}/${real_path}/${file.newFilename}`,
          isFolder: false,
        };
      });

      const headers = {
        accept: "*/*",
        lists: newModelData,
        createdBy: newModelData?.[0]?.createdBy,
      };

      const encryptedData = dataEncrypted({ headers });
      const baseUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/download-multifolders-and-files?download=${encryptedData}`;

      startDownload({ baseUrl });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      onFailed?.();
      console.error(error);
    }
  };

  // download multiple files
  const handleMultipleFileDropDownloadFile = async (
    { multipleData },
    { onSuccess, onFailed },
  ) => {
    try {
      const newModelData = multipleData.map((file) => {
        let real_path = "";
        if (file.createdBy?._id !== "0") {
          real_path = removeFileNameOutOfPath(file?.newPath);
          real_path = `${file.createdBy?.newName}-${file.createdBy?._id}/${real_path}${file.newFilename}`;
        } else {
          real_path = `public/${file.newFilename}`;
        }

        return {
          _id: file.id,
          path: real_path,
          isFolder: false,
          createdBy: file?.createdBy?._id,
        };
      });

      const headers = {
        accept: "*/*",
        lists: newModelData,
        createdBy: multipleData?.[0]?.createdBy?._id,
      };

      const encryptedData = dataEncrypted({ headers });
      const baseUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/download-multifolders-and-files?download=${encryptedData}`;

      startDownload({ baseUrl });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      onFailed?.();
      console.error(error);
    }
  };

  const handleMultipleDownloadFileAndFolder = async (
    { multipleData, isShare },
    { onSuccess, onFailed },
  ) => {
    try {
      const newModelData = multipleData.map((file) => {
        let real_path = "";

        if (file.newPath) {
          real_path = removeFileNameOutOfPath(file?.newPath || "");
        }

        return {
          isFolder: file.checkType === "folder" ? true : false,
          path: `${file.createdBy?.newName}-${file.createdBy?._id}/${real_path}${file.newFilename}`,
          _id: isShare ? file.dataId : file.id,
          createdBy: file.createdBy?._id,
        };
      });

      const headers = {
        accept: "*/*",
        lists: newModelData,
        downloadBy: multipleData[0]?.toAccount?.email,
        createdBy: multipleData[0].createdBy?._id,
      };

      const encryptedData = dataEncrypted({ headers });
      const baseUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/download-multifolders-and-files?download=${encryptedData}`;

      startDownload({ baseUrl });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      onFailed?.(error);
    }
  };

  const handleMultipleGetLinks = async (
    { dataMultiple },
    { onSuccess, onFailed },
  ) => {
    try {
      const dataItems = dataMultiple?.map((item) => {
        return {
          [item.checkType === "file" ? "fileId" : "folderId"]: item.id,
          type: item.checkType,
        };
      });

      const res = await createMultipleLink({
        variables: {
          input: dataItems,
        },
      });

      if (res.data?.createManageLink?._id) {
        const result = res.data?.createManageLink;
        onSuccess({
          id: result._id,
          shortLink: result.shortLink,
        });
      }
    } catch (error) {
      onFailed(error);
    }
  };

  const handleMultipleSaveToClound = async (
    { multipleData, country, device },
    { onSuccess, onFailed },
  ) => {
    try {
      const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);

      multipleData.map(async (file) => {
        const randomName = uuidv4();
        const uploading = await updateFiles({
          variables: {
            data: {
              ip: String(responseIp?.data),
              newFilename: randomName + getFileNameExtension(file?.name),
              filename: file.name,
              fileType: file.fileType,
              size: file?.size,
              checkFile: "main",
              country,
              device: device.os.name + device.os.version,
              totalUploadFile: 1,
            },
          },
        });
        if (uploading?.data?.createFiles?._id) {
          const sourcePath = file?.newFilename;
          const destinationPath =
            file?.createdBy?.newName +
            "-" +
            file?.createdBy?._id +
            "/" +
            randomName +
            getFileNameExtension(file?.name);
          handleUploadToBunny(sourcePath, destinationPath);
        }
      });
      onSuccess();
    } catch (error) {
      onFailed(error);
    }
  };

  const handleUploadToBunny = async (sourcePath, destinationPath) => {
    try {
      await uploadToBunny({
        variables: {
          pathFile: {
            sourceFilePath: sourcePath,
            destinationFilePath: destinationPath,
          },
        },
      });
    } catch (error) {
      return;
    }
  };

  return {
    splitDataByDate,
    handleDeleteFile,
    handleDeleteFileForever,
    handleRestoreFile,
    handleRenameFile,
    handleFavoriteFile,
    handleDownloadFile,
    handleMultipleGetLinks,
    handleMultipleDownloadFile,
    handleMultipleDownloadFileAndFolder,
    handleMultipleFileDropDownloadFile,
    handleMultipleSaveToClound,
    handleDownloadSingleFile,
    handleSingleFileDropDownload,
  };
};

export default useManageFile;
