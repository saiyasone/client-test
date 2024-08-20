import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import axios from "axios";
import { FaTimesCircle, FaPlus, FaTimes } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import CryptoJS from "crypto-js";
import * as MUI from "../styles/uppyStyle.style";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@apollo/client";
import CheckSuccessIcon from "assets/images/check-upload.png";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import { ENV_KEYS } from "constants/env.constant";
import {
  MUTATION_CANCEL_UPLOAD_FOLDER,
  MUTATION_UPLOAD_FOLDER,
} from "api/graphql/folder.graphql";
import { errorMessage } from "utils/alert.util";
import useManageGraphqlError from "hooks/useManageGraphqlError";

// svg files
import FolderUploadFull from "assets/images/client-dashboard/folderUppy.svg?react";
import "react-circular-progressbar/dist/styles.css";

// Graphql
const { CancelToken } = axios;
function UploadFolderManual(props) {
  const { userData, isOpen, handleClose } = props;
  const folderRef = useRef<any>();
  const [totalProgress, setTotalProgress] = useState(0);
  const [folderData, setFolderData] = useState<any>([]);

  const [folderCancelTokenSource, setFolderCancelTokenSource] =
    useState<any>(null);
  const [folderUploadId, setFolderUploadId] = useState(null);

  const [uploadProgress, setUploadProgress] = useState({});
  const [folderProgress, setFolderProgress] = useState({});

  const [totalFolderUpload, setTotalFolderUpload] = useState(0);

  const [isDataSuccess, setIsDataSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [cancelFolderStatus, setCancelFolderStatus] = React.useState(false);

  const manageGraphError = useManageGraphqlError();

  const isMobile = useMediaQuery("(max-width: 560px)");

  const folderNames = new Set();
  folderData?.forEach((folder: any) => {
    const folderName = String(folder.webkitRelativePath).split("/")[0];
    folderNames.add(folderName);
  });

  // graphql
  const [uploadFolderAction] = useMutation(MUTATION_UPLOAD_FOLDER);
  const [cancelUploadFolder] = useMutation(MUTATION_CANCEL_UPLOAD_FOLDER);

  const onDrop = useCallback((acceptedFiles) => {
    const folderNames = new Set();
    const folders: any = [];

    let newUploadProgress = {};
    let newFolders: any = [];
    let updateFolders: any = [];

    acceptedFiles.forEach((file) => {
      const pathSegments = file.path?.split("/")[1];
      if (pathSegments.length > 1) {
        folderNames.add(pathSegments);
      }

      folders.push({
        file,
        webkitRelativePath: pathSegments,
      });

      newUploadProgress = { ...uploadProgress };
      newFolders = [...folders];
      updateFolders = [...folderData, ...newFolders];
      updateFolders.forEach((_, index) => {
        if (!(index in newUploadProgress)) {
          newUploadProgress[index] = 0;
        }
      });
    });

    setFolderData((prev) => [...prev, ...updateFolders]);
    setUploadProgress(newUploadProgress);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  function handleFolder(evt) {
    const { files } = evt.target;
    const newUploadProgress = { ...uploadProgress };
    const folders = Array.from(files)
      .filter((file: any) => String(file.webkitRelativePath).includes("/"))
      .map((file: any) => ({
        file,
        webkitRelativePath: file.webkitRelativePath,
      }));

    const newFolders = [...folders];

    const updateFolders = [...folderData, ...newFolders];
    updateFolders.forEach((_, index) => {
      if (!(index in newUploadProgress)) {
        newUploadProgress[index] = 0;
      }
    });

    setFolderData(updateFolders);
    setUploadProgress(newUploadProgress);
  }

  function lengthOfFolder() {
    return [
      ...new Set(
        folderData.map(
          (folder) => String(folder.webkitRelativePath).split("/")[0],
        ),
      ),
    ].length;
  }

  function handleFolderTrigger() {
    folderRef.current.click();
  }

  function removeFolder(folderName) {
    setFolderData((prev) =>
      prev.filter((folder) => {
        return folder.webkitRelativePath.split("/")[0] !== folderName;
      }),
    );

    folderRef.current.value = "";
  }

  async function uploadFolder() {
    if (folderData.length > 0) {
      for (let i = 0; i < folderData.length; i++) {
        const newUploadProgress = {};
        newUploadProgress[i] = 0;
        setUploadProgress(newUploadProgress);
      }

      await handleUploadFolderV1();
      // await handleUploadFolderV2();
    }
  }

  async function handleUploadFolderV1() {
    let successFolderCount = 0;

    setIsUploading(true);
    const groupedFiles = folderData.reduce((acc, current) => {
      const key = current.webkitRelativePath;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {});

    const result = Object.keys(groupedFiles).map((key) => groupedFiles[key]);
    const foldersArray = result;
    const totalFolders = foldersArray.length;

    try {
      let currentUploadPercentage = 0;
      let uploadedSize = 0;
      const totalSize = folderData.reduce(
        (acc, folder) => acc + folder.file.size,
        0,
      );

      for (const key in foldersArray) {
        const files = foldersArray[key];
        const folderKey = key.toString();

        const progressArray = Array(files.length).fill(0);

        setFolderProgress((prev) => ({
          ...prev,
          [folderKey]: 0,
        }));

        const newData = files.map((folder) => {
          let pathFolder = folder.file.path || folder.file.webkitRelativePath;
          if (pathFolder.startsWith("/")) {
            pathFolder = String(pathFolder).substring(1);
          }

          return {
            type: folder.file.type,
            size: folder.file.size.toString(),
            path: pathFolder,
          };
        });

        const folderCancelTokenSource = CancelToken.source();
        setFolderCancelTokenSource({
          ...folderCancelTokenSource,
          [folderKey]: folderCancelTokenSource,
        });

        try {
          const folderUpload = await uploadFolderAction({
            variables: {
              data: {
                checkFolder: "main",
                pathFolder: newData,
                folder_type: "folder",
                // parentkey:
              },
            },
            // cancelToken: folderCancelTokenSource.token,
          });

          if (folderUpload.data?.uploadFolder.status === 200) {
            setFolderUploadId(folderUpload?.data?.uploadFolder._id);
            const arrayPath =
              (await folderUpload?.data?.uploadFolder.path) || [];
            if (arrayPath && arrayPath.length > 0) {
              // path, index
              await Promise.all(
                await arrayPath.map(async (path, index) => {
                  const file = files[index].file;

                  setIsDataSuccess((prev: any) => ({
                    ...prev,
                    [folderKey]: false,
                  }));

                  const blob = new Blob([file], {
                    type: file.type,
                  });
                  const newFile = new File([blob], file.name, {
                    type: file.type,
                  });

                  const formData = new FormData();
                  formData.append("file", newFile);

                  const lastIndex = path.newPath?.lastIndexOf("/");
                  const resultPath = path.newPath?.substring(0, lastIndex);
                  const resultFileName = path?.newPath?.substring(lastIndex);

                  const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
                  const headers = {
                    PATH:
                      userData.newName + "-" + userData._id + "/" + resultPath,
                    FILENAME: resultFileName?.substring(1),
                  };

                  const key = CryptoJS.enc.Utf8.parse(secretKey);
                  const iv = CryptoJS.lib.WordArray.random(16);
                  const encrypted = CryptoJS.AES.encrypt(
                    JSON.stringify(headers),
                    key,
                    {
                      iv: iv,
                      mode: CryptoJS.mode.CBC,
                      padding: CryptoJS.pad.Pkcs7,
                    },
                  );
                  const cipherText = encrypted.ciphertext.toString(
                    CryptoJS.enc.Base64,
                  );
                  const ivText = iv.toString(CryptoJS.enc.Base64);
                  const encryptedData = cipherText + ":" + ivText;

                  const source = folderCancelTokenSource;

                  await axios.post(
                    "https://coding.load.vshare.net/upload",
                    formData,
                    {
                      headers: {
                        "Content-Type": "application/octet-stream",
                        encryptedHeaders: encryptedData,
                      },
                      onUploadProgress: async (progressEvent) => {
                        const bytesUploaded = progressEvent.loaded;
                        const fileProgress =
                          Math.round(bytesUploaded * 100) / file.size;
                        progressArray[index] = fileProgress;

                        const totalProgress = Math.round(
                          progressArray.reduce((acc, p) => acc + p, 0) /
                            progressArray.length,
                        );

                        setFolderProgress((prev) => ({
                          ...prev,
                          [folderKey]: totalProgress,
                        }));

                        uploadedSize += bytesUploaded - fileProgress;
                        currentUploadPercentage = +(
                          (uploadedSize / totalSize) *
                          100
                        ).toFixed(0);

                        setTotalProgress(
                          currentUploadPercentage > 99
                            ? 100
                            : currentUploadPercentage,
                        );
                      },
                      cancelToken: source.token,
                    },
                  );
                }),
              );

              successFolderCount++;
              setTotalFolderUpload(successFolderCount);
            }
          }
        } catch (error: any) {
          console.log(error);
          setIsFailed(true);
          setTotalProgress(100);

          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(cutErr, 3000);
        } finally {
          if (successFolderCount >= totalFolders) {
            successFolderCount = 0;
            setIsDone(true);
            setIsDataSuccess((prev: any) => ({
              ...prev,
              [folderKey]: true,
            }));
          }
        }
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphError.handleErrorMessage(cutErr || "") as string,
        3000,
      );
    }
  }

  async function handleUploadFolderV2() {
    let successFolderCount = 0;
    setIsUploading(true);

    type FileData = {
      file: File & { path?: string; webkitRelativePath?: string };
      webkitRelativePath: string;
    };

    const groupedFiles: Record<string, FileData[]> = folderData.reduce(
      (acc: Record<string, FileData[]>, current: FileData) => {
        const key = current.webkitRelativePath;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {},
    );

    const foldersArray: FileData[][] = Object.values(groupedFiles);
    const totalFolders = foldersArray.length;

    try {
      let currentUploadPercentage = 0;
      let uploadedSize = 0;
      const totalSize = folderData.reduce(
        (acc, folder) => acc + folder.file.size,
        0,
      );

      console.log("Total Size:", totalSize); // Debugging output

      for (const [key, files] of foldersArray.entries()) {
        const folderKey = key.toString();
        const progressArray = Array(files.length).fill(0);

        setFolderProgress((prev) => ({ ...prev, [folderKey]: 0 }));

        const newData = files.map((folder) => {
          let pathFolder = folder.file.path || folder.file.webkitRelativePath;
          if (pathFolder.startsWith("/")) {
            pathFolder = pathFolder.substring(1);
          }

          return {
            type: folder.file.type,
            size: folder.file.size.toString(),
            path: pathFolder,
          };
        });

        const folderCancelTokenSource = CancelToken.source();
        setFolderCancelTokenSource((prev) => ({
          ...prev,
          [folderKey]: folderCancelTokenSource,
        }));

        try {
          const folderUpload = await uploadFolderAction({
            variables: {
              data: {
                checkFolder: "main",
                pathFolder: newData,
                folder_type: "folder",
              },
            },
          });

          if (folderUpload.data?.uploadFolder.status === 200) {
            setFolderUploadId(folderUpload?.data?.uploadFolder._id);
            const arrayPath = folderUpload?.data?.uploadFolder.path || [];

            if (arrayPath.length > 0) {
              await Promise.all(
                arrayPath.map(async (path, index) => {
                  const file = files[index].file;
                  setIsDataSuccess((prev: any) => ({
                    ...prev,
                    [folderKey]: false,
                  }));

                  const blob = new Blob([file], { type: file.type });
                  const newFile = new File([blob], file.name, {
                    type: file.type,
                  });
                  const formData = new FormData();
                  formData.append("file", newFile);

                  const lastIndex = path.newPath?.lastIndexOf("/");
                  const resultPath = path.newPath?.substring(0, lastIndex);
                  const resultFileName = path?.newPath?.substring(
                    lastIndex + 1,
                  );

                  const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
                  const headers = {
                    PATH: `${userData.newName}-${userData._id}/${resultPath}`,
                    FILENAME: resultFileName,
                  };

                  const key = CryptoJS.enc.Utf8.parse(secretKey);
                  const iv = CryptoJS.lib.WordArray.random(16);
                  const encrypted = CryptoJS.AES.encrypt(
                    JSON.stringify(headers),
                    key,
                    {
                      iv: iv,
                      mode: CryptoJS.mode.CBC,
                      padding: CryptoJS.pad.Pkcs7,
                    },
                  );
                  const cipherText = encrypted.ciphertext.toString(
                    CryptoJS.enc.Base64,
                  );
                  const ivText = iv.toString(CryptoJS.enc.Base64);
                  const encryptedData = `${cipherText}:${ivText}`;

                  const source = folderCancelTokenSource;

                  await axios.post(
                    "https://coding.load.vshare.net/upload",
                    formData,
                    {
                      headers: {
                        "Content-Type": "application/octet-stream",
                        encryptedHeaders: encryptedData,
                      },
                      onUploadProgress: (progressEvent) => {
                        const bytesUploaded = progressEvent.loaded;
                        const fileProgress = bytesUploaded / file.size;
                        progressArray[index] = fileProgress;

                        const totalProgress =
                          progressArray.reduce((acc, p) => acc + p, 0) /
                          progressArray.length;

                        setFolderProgress((prev) => ({
                          ...prev,
                          [folderKey]: Math.round(totalProgress * 100),
                        }));

                        uploadedSize +=
                          bytesUploaded - file.size * fileProgress;
                        currentUploadPercentage = Math.round(
                          (uploadedSize / totalSize) * 100,
                        );

                        console.log("Uploaded Size:", uploadedSize); // Debugging output
                        console.log(
                          "Current Upload Percentage:",
                          currentUploadPercentage,
                        ); // Debugging output

                        setTotalProgress(currentUploadPercentage);
                      },
                      cancelToken: source.token,
                    },
                  );
                }),
              );

              successFolderCount++;
              setTotalFolderUpload(successFolderCount);
            }
          }
        } catch (error: any) {
          console.log(error);
          setIsFailed(true);
          setTotalProgress(100);

          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(cutErr, 3000);
        } finally {
          if (successFolderCount >= totalFolders) {
            successFolderCount = 0;
            setIsDone(true);
            setIsDataSuccess((prev: any) => ({ ...prev, [folderKey]: true }));
          }
        }
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphError.handleErrorMessage(cutErr || "") || "",
        3000,
      );
    }
  }

  async function handleCancelUploadFolder(folderKey) {
    try {
      await cancelUploadFolder({
        variables: {
          where: {
            _id: folderUploadId,
            checkFolder: "main",
          },
        },
        onCompleted: () => {
          setCancelFolderStatus((prev: any) => ({
            ...prev,
            [folderKey]: true,
          }));
          setFolderProgress((prev) => ({
            ...prev,
            [folderKey]: 0,
          }));
        },
      });

      if (folderCancelTokenSource[folderKey]) {
        folderCancelTokenSource[folderKey].cancel();
      }
    } catch (error) {
      console.log("first error", error);
    }
  }

  const handleClearUpload = () => {
    setUploadProgress({});
    setFolderData([]);
    setFolderProgress({});
    setTotalProgress(0);
    setIsUploading(false);
    setIsDone(false);
    setIsDataSuccess(false);
    setTotalFolderUpload(0);
    folderRef.current.value = "";
  };

  useEffect(() => {
    if (folderData?.length > 0) {
      //
    }
  }, [folderData]);

  return (
    <Fragment>
      <MUI.UploadDialogContainer
        open={isOpen || false}
        fullWidth={true}
        onClose={handleClose}
      >
        <MUI.UploadUppyContainer>
          <MUI.UppyHeader>
            <Typography variant="h2">Upload and attach files</Typography>
          </MUI.UppyHeader>

          <input
            ref={folderRef}
            type="file"
            hidden={true}
            style={{ display: "none" }}
            directory="true"
            onChange={handleFolder}
            {...({
              webkitdirectory: "true",
              directory: "true",
            } as any)}
          />

          <Box sx={{ mt: 3 }}>
            <Box sx={{ maxWidth: "992px", margin: "0 auto" }}>
              <MUI.UploadFolderContainer>
                <MUI.UploadFolderHeaderContainer>
                  <MUI.UploadFolderHeader>
                    <MUI.UploadFolderCancelButton>
                      {!isMobile ? (
                        "Cancel"
                      ) : (
                        <FaTimes
                          style={{
                            marginRight: "10px",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </MUI.UploadFolderCancelButton>
                    <Typography variant="h2">
                      {lengthOfFolder()}{" "}
                      {isMobile ? "selected" : "Folder selected"}
                    </Typography>

                    <MUI.UploadFolderAddMoreButton
                      onClick={handleFolderTrigger}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <FaPlus style={{ marginRight: "10px" }} />
                      {!isMobile && "Add more"}
                    </MUI.UploadFolderAddMoreButton>
                  </MUI.UploadFolderHeader>
                </MUI.UploadFolderHeaderContainer>

                <MUI.UploadFolderBody isDrag={false}>
                  <div
                    {...getRootProps()}
                    style={{ width: "100%", marginBottom: "1rem" }}
                  >
                    <MUI.UploadFolderBorderDashed>
                      <Typography variant="h4">
                        {isDragActive
                          ? "Drop the files here ..."
                          : "Upload, Drag and drop your folders here to upload"}
                      </Typography>

                      <input
                        {...getInputProps()}
                        type="file"
                        hidden={true}
                        style={{ display: "none" }}
                        directory="true"
                        {...({
                          webkitdirectory: "true",
                          directory: "true",
                        } as any)}
                      />
                    </MUI.UploadFolderBorderDashed>
                  </div>

                  {isMobile ? (
                    <Fragment>
                      {Array.from(folderNames).map((folderPath, index) => {
                        const isMobileSuccess = !isDataSuccess[index]
                          ? false
                          : isDataSuccess[index];

                        const progress = !folderProgress[index]
                          ? 0
                          : folderProgress[index];

                        const fileInFolder = folderData.filter(
                          (folder: { webkitRelativePath: "" }) =>
                            String(folder.webkitRelativePath).startsWith(
                              folderPath as string,
                            ),
                        ).length;

                        return (
                          <MUI.UploadFolderContainerList key={index}>
                            <MUI.UploadFolderListFlex>
                              <MUI.UploadFolderListBoxLeft>
                                <MUI.UploadFolderListProgress>
                                  <FolderUploadFull className="folder-list" />
                                </MUI.UploadFolderListProgress>

                                <MUI.UploadFolderListBoxData>
                                  <Typography variant="h2" sx={{ mb: 0.6 }}>
                                    {folderPath as string}
                                  </Typography>
                                  <Typography variant="h2">
                                    1/{fileInFolder}
                                  </Typography>
                                </MUI.UploadFolderListBoxData>
                              </MUI.UploadFolderListBoxLeft>

                              <MUI.UploadFolderListBoxRight>
                                {isUploading && (
                                  <Fragment>
                                    {!isMobileSuccess ? (
                                      <CircularProgress
                                        size="18px"
                                        value={progress || 0}
                                      />
                                    ) : (
                                      <IconButton
                                        sx={{
                                          background: "#EEFBF3",
                                          cursor: "inherit",
                                        }}
                                        size="medium"
                                      >
                                        <DownloadDoneIcon
                                          sx={{
                                            color: "#17766B",
                                            fontSize: "17px",
                                          }}
                                        />
                                      </IconButton>
                                    )}
                                  </Fragment>
                                )}
                                {/* {!isMobileSuccess && (
                                  <MUI.UploadFolderRemoveFolderList
                                    onClick={() => removeFolder(folderPath)}
                                  >
                                    <FaTimesCircle
                                      style={{
                                        fontSize: "17px",
                                        verticalAlign: "middle",
                                      }}
                                    />
                                  </MUI.UploadFolderRemoveFolderList>
                                )} */}
                              </MUI.UploadFolderListBoxRight>
                            </MUI.UploadFolderListFlex>
                          </MUI.UploadFolderContainerList>
                        );
                      })}
                    </Fragment>
                  ) : (
                    <Fragment>
                      <MUI.UploadFolderContainerGrid>
                        {Array.from(folderNames).map((folderPath, index) => {
                          const progress = !folderProgress[index]
                            ? 0
                            : (folderProgress[index] as any);

                          const fileInFolder = folderData.filter((folder) =>
                            String(folder.webkitRelativePath).startsWith(
                              folderPath as string,
                            ),
                          ).length;

                          return (
                            <MUI.UploadFolderGridWrapper key={index}>
                              {/* <MUI.UploadFolderBackgroundProgress
                                progress={progress}
                              >
                                {!isUploading && (
                                  <MUI.UploadFolderRemoveFolder
                                    style={{
                                      position: "absolute",
                                      top: 10,
                                      right: 10,
                                      color: "#5C5C5C",
                                    }}
                                    onClick={() => removeFolder(folderPath)}
                                  >
                                    <FaTimesCircle
                                      style={{
                                        fontSize: "22px",
                                      }}
                                    />
                                  </MUI.UploadFolderRemoveFolder>
                                )}

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <FolderUploadFull
                                    style={{
                                      width: 100,
                                      height: 100,
                                      objectFit: "cover",
                                    }}
                                  />

                                  <div
                                    style={{
                                      position: "absolute",
                                      width: "20px",
                                      height: "20px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      marginTop: "1rem",
                                    }}
                                  >
                                    <Chip
                                      icon={<FaTimes fontSize={10} />}
                                      color="error"
                                      variant="filled"
                                      size="small"
                                    />
                                  </div>
                                </div>

                                <div
                                  style={{
                                    margin: "1rem 0",
                                    width: "100%",
                                    position: "absolute",
                                    bottom: "-5px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <p
                                      style={{
                                        color: "#4B465C",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        margin: "0",
                                      }}
                                    >
                                      1/{fileInFolder}
                                    </p>
                                  </div>
                                </div>
                              </MUI.UploadFolderBackgroundProgress> */}

                              <MUI.UploadFolderBackgroundProgress
                                progress={progress}
                              >
                                {!isUploading && (
                                  <MUI.UploadFolderRemoveFolder
                                    onClick={() => removeFolder(folderPath)}
                                  >
                                    <FaTimesCircle
                                      style={{
                                        fontSize: "18px",
                                      }}
                                    />
                                  </MUI.UploadFolderRemoveFolder>
                                )}

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <FolderUploadFull
                                    style={{
                                      width: 70,
                                      height: 70,
                                      objectFit: "cover",
                                    }}
                                  />

                                  <Box
                                    style={{
                                      position: "absolute",
                                      width: "35px",
                                      height: "35px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    {/* start */}
                                    {progress >= 99 ? (
                                      <img
                                        src={CheckSuccessIcon}
                                        style={{
                                          position: "relative",
                                          zIndex: 999,
                                          width: 23,
                                          height: 23,
                                          marginTop: 10,
                                        }}
                                        alt="img-success"
                                      />
                                    ) : (
                                      <Fragment>
                                        {isUploading && (
                                          <Fragment>
                                            {cancelFolderStatus[index] ? (
                                              <Chip
                                                icon={<FaTimes fontSize={12} />}
                                                color="error"
                                                variant="filled"
                                              />
                                            ) : (
                                              <CircularProgressbarWithChildren
                                                value={progress}
                                                styles={buildStyles({
                                                  textSize: "10px",
                                                  pathColor: "#4caf50",
                                                  textColor: "#000",
                                                })}
                                              >
                                                <span
                                                  style={{
                                                    cursor: "pointer",
                                                    color: "#fff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                  onClick={() =>
                                                    handleCancelUploadFolder(
                                                      index,
                                                    )
                                                  }
                                                >
                                                  <FaTimes
                                                    style={{
                                                      fontSize: 14,
                                                      verticalAlign: "middle",
                                                    }}
                                                  />
                                                </span>
                                              </CircularProgressbarWithChildren>
                                            )}
                                          </Fragment>
                                        )}
                                      </Fragment>
                                    )}
                                  </Box>
                                </div>

                                <Box
                                  style={{
                                    margin: "1rem 0",
                                    width: "100%",
                                    position: "absolute",
                                    bottom: "-5px",
                                  }}
                                >
                                  <Box
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Typography
                                      component="p"
                                      sx={{
                                        color: "#4B465C",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        margin: "0",
                                      }}
                                    >
                                      1/{fileInFolder}
                                    </Typography>
                                  </Box>
                                </Box>
                              </MUI.UploadFolderBackgroundProgress>
                              <MUI.UploadFolderNameContainer>
                                <Typography variant="h4">
                                  {folderPath as string}
                                </Typography>
                              </MUI.UploadFolderNameContainer>
                            </MUI.UploadFolderGridWrapper>
                          );
                        })}
                      </MUI.UploadFolderContainerGrid>
                    </Fragment>
                  )}
                </MUI.UploadFolderBody>
              </MUI.UploadFolderContainer>

              {folderData.length > 0 && isUploading && (
                <MUI.UploadFolderProgressContainer>
                  <MUI.UploadFolderAllProgress
                    progress={totalProgress}
                    isFailed={isFailed}
                  />
                  <MUI.UploadFolderProgressBody>
                    <MUI.UploadFolderBottomProgress>
                      <MUI.UploadFolderBoxLeftProgress>
                        <MUI.UploadFolderMiniProgress>
                          {isDone ? (
                            <Fragment>
                              {isFailed ? (
                                <AiOutlineClose fontSize={22} color="#FF0001" />
                              ) : (
                                <img
                                  src={CheckSuccessIcon}
                                  style={{
                                    width: 20,
                                    height: 20,
                                  }}
                                  alt="img-success"
                                />
                              )}
                            </Fragment>
                          ) : (
                            <CircularProgress
                              size="1.5rem"
                              variant="determinate"
                              value={totalProgress || 0}
                            />
                          )}
                        </MUI.UploadFolderMiniProgress>
                        <MUI.UploadFolderContentData>
                          {isDone ? (
                            <Typography variant="h2" sx={{ mb: 0.6 }}>
                              Uploaded to success
                            </Typography>
                          ) : (
                            <Typography variant="h2">
                              Uploading: {totalProgress}%{" "}
                            </Typography>
                          )}

                          {isDone ? (
                            <Typography variant="h2">
                              {totalFolderUpload} of{" "}
                              {Array.from(folderNames).length} folders uploaded
                            </Typography>
                          ) : (
                            <Typography variant="h2">
                              {totalFolderUpload} of{" "}
                              {Array.from(folderNames).length} folders uploaded
                              .
                            </Typography>
                          )}
                        </MUI.UploadFolderContentData>
                      </MUI.UploadFolderBoxLeftProgress>
                      <MUI.UploadFolderCancelAll onClick={handleClearUpload}>
                        <FaTimesCircle
                          style={{
                            fontSize: "20px",
                          }}
                        />
                      </MUI.UploadFolderCancelAll>
                    </MUI.UploadFolderBottomProgress>
                  </MUI.UploadFolderProgressBody>
                </MUI.UploadFolderProgressContainer>
              )}

              <MUI.ButtonActionBody>
                <MUI.ButtonActionContainer>
                  <MUI.ButtonCancelAction onClick={handleClearUpload}>
                    Cancel
                  </MUI.ButtonCancelAction>
                  <MUI.ButtonUploadAction
                    onClick={uploadFolder}
                    disabled={false}
                    // disabled={isUploading ? true : false}
                  >
                    Upload {lengthOfFolder() ? lengthOfFolder() : ""} folders
                  </MUI.ButtonUploadAction>
                </MUI.ButtonActionContainer>
              </MUI.ButtonActionBody>
            </Box>
          </Box>
        </MUI.UploadUppyContainer>
      </MUI.UploadDialogContainer>
    </Fragment>
  );
}

export default UploadFolderManual;
