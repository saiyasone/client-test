import { Fragment, useContext, useEffect, useRef, useState } from "react";

// uppy package
import AudioFile from "@uppy/audio";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import Uppy from "@uppy/core";
import ImageEditor from "@uppy/image-editor";
import { Dashboard } from "@uppy/react";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import Webcam from "@uppy/webcam";

import * as MUI from "../styles/uppyStyle.style";

// uppy css
import "@uppy/core/dist/style.css";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.css";
import "@uppy/webcam/dist/style.min.css";
import "../styles/uppy-theme.css";

import { useLazyQuery, useMutation } from "@apollo/client";
import { Typography } from "@mui/material";
import {
  MUTATION_ACTION_FILE,
  MUTATION_CREATE_FILE,
  MUTATION_DELETE_FILE,
} from "api/graphql/file.graphql";
import { QUERY_PATH_FOLDER } from "api/graphql/folder.graphql";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { UAParser } from "ua-parser-js";
import { errorMessage, successMessage, warningMessage } from "utils/alert.util";
import { getFileNameExtension } from "utils/file.util";
import { encryptData } from "utils/secure.util";

type Props = {
  open: boolean;
  onClose?: () => void;
};

function WasabiUpload(props: Props) {
  const [canClose, setCanClose] = useState(false);

  const [fileId, setFileId] = useState({});
  const [selectFiles, setSelectFiles] = useState<any>([]);

  const [subPath, setSubPath] = useState("");
  const [newFilePath, setNewFilePath] = useState("");

  const [uppyInstance, setUppyInstance] = useState(() => new Uppy());
  const selectFileRef = useRef(selectFiles);
  const fileIdRef = useRef<any>(fileId);

  const UA = new UAParser();
  const result = UA.getResult();

  const [actionFile] = useMutation(MUTATION_ACTION_FILE);

  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const { folderId, trackingFolderData }: any = useContext(FolderContext);

  // auth
  const { user: userAuth }: any = useAuth();
  const user = trackingFolderData?.createdBy?._id
    ? trackingFolderData?.createdBy
    : userAuth;

  //   graphql
  const [uploadFileAction] = useMutation<{ createFiles: { _id?: string } }>(
    MUTATION_CREATE_FILE,
  );
  const [queryPath] = useLazyQuery(QUERY_PATH_FOLDER, {
    fetchPolicy: "no-cache",
  });
  const [deleteFile] = useMutation(MUTATION_DELETE_FILE);

  const manageGraphError = useManageGraphqlError();

  async function handleAllCancelUpload() {
    const dataFiles = selectFileRef.current;

    try {
      const deletePromise = await dataFiles.map(async (file, index) => {
        const fileId = fileIdRef.current[index];

        if (file.status === "uploading" && fileId) {
          await deleteFile({
            variables: { id: fileId },
            onCompleted: () => {},
          });
        }
      });

      await Promise.all(deletePromise);
      handleDoneUpload();
    } catch (error: any) {
      handleDoneUpload();
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphError.handleErrorMessage(cutErr || error.message) as string,
        3000,
      );
    }
  }

  async function handleUploadToStorage() {
    const dataFiles = uppyInstance.getFiles() as any[];

    if (!dataFiles.length) {
      return;
    }

    setCanClose(true);
    await uppyInstance.upload();
    try {
      // const uploadPromise = dataFiles.map(async (file, index) => {
      //   const filePath = newFilePath + "/" + file.newFilename;
      //   const uploading = await uploadFileAction({
      //     variables: {
      //       data: {
      //         destination: "",
      //         newFilename: file.newFilename,
      //         filename: file.name,
      //         fileType: file.data.type,
      //         size: file.size.toString(),
      //         checkFile: folderId > 0 ? "sub" : "main",
      //         ...(folderId > 0 ? { folder_id: folderId } : ""),
      //         ...(folderId > 0 ? { newPath: filePath } : ""),
      //         country: "other",
      //         device: result.os.name || "" + result.os.version || "",
      //         totalUploadFile: dataFiles.length,
      //       },
      //     },
      //   });
      //   const fileId = await uploading.data?.createFiles?._id;
      //   if (fileId) {
      //     await handleActionFile(fileId);
      //     setFileId((prev) => {
      //       const updatedFileIds = { ...prev, [index]: fileId };
      //       fileIdRef.current = updatedFileIds;
      //       return updatedFileIds;
      //     });
      //   }
      // });
      // await Promise.all(uploadPromise);
      // await uppyInstance.upload();
    } catch (error: any) {
      setCanClose(false);
      errorMessage(error.message, 3000);
    }
  }

  const handleActionFile = async (id: string) => {
    try {
      await actionFile({
        variables: {
          fileInput: {
            createdBy: parseInt(user?._id),
            fileId: parseInt(id),
            actionStatus: "upload",
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // async function handleCancelUpload({ index }) {
  //   try {
  //     const _id = fileIdRef.current[index];

  //     if (_id) {
  //       setFileId((prev) => {
  //         const newFileId = { ...prev };
  //         delete newFileId[index];
  //         fileIdRef.current = newFileId;

  //         return newFileId;
  //       });

  //       await deleteFile({
  //         variables: {
  //           id: _id,
  //         },
  //         onCompleted: () => {
  //           const remainingFileIds = Object.keys(fileIdRef.current).length;

  //           if (remainingFileIds === 0) {
  //             handleDoneUpload();
  //           }
  //         },
  //       });
  //     }
  //   } catch (error: any) {
  //     console.log(error);
  //     const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
  //     errorMessage(
  //       manageGraphError.handleErrorMessage(
  //         cutErr || "Something wrong please try again !",
  //       ) as string,
  //       3000,
  //     );
  //   }
  // }

  async function fetchRandomData() {
    const randomName = Math.floor(111111111 + Math.random() * 999999999);
    return randomName;
  }

  function handleCloseDialog() {
    const dataFiles = uppyInstance.getFiles();
    dataFiles.forEach((file) => {
      uppyInstance.removeFile(file.id);
    });

    handleDoneUpload();
    props.onClose?.();
  }

  async function handleDoneUpload() {
    setCanClose(false);
    setFileId({});
    fileIdRef.current = {};
    setSelectFiles([]);
    selectFileRef.current = [];
  }

  // function getIndex(fileId) {
  //   return selectFileRef.current.findIndex(
  //     (selected) => selected.id === fileId,
  //   );
  // }

  useEffect(() => {
    const initializeUppy = () => {
      try {
        const numberOfFileUpload =
          userAuth?.packageId?.numberOfFileUpload || 15;

        const limitUpload = userAuth?.packageId?.totalImageUpload;
        const maxFileSize = userAuth?.packageId?.maxUploadSize;
        const queueUpload = userAuth?.packageId?.numberOfQueueUpload;

        const uppy = new Uppy({
          id: "upload-file-id",
          autoProceed: false,
          allowMultipleUploadBatches: true,
          restrictions: {
            maxFileSize: parseInt(maxFileSize),
          },
          locale: {
            strings: {
              exceedsSize: "File size is too large, max size is %{size}.",
              youCanOnlyUploadX: {
                0: "You can only upload %{smart_count} file",
                1: "You can only upload %{smart_count} files",
              },
              cancel: "no-cancel",
              failedToUpload:
                "Failed to upload %{smart_count} file due to an error.",
            },
          },
        });

        uppy.on("file-added", async (file: any) => {
          const files = uppy.getFiles();
          const fileTypes = files.map((f) => f.data.type);

          const nonImageTypes = fileTypes.filter(
            (type) => !type.startsWith("image/"),
          );

          const maxFiles =
            nonImageTypes.length > 0 ? numberOfFileUpload : limitUpload;

          if (files.length > maxFiles) {
            uppy.removeFile(file.id);
            warningMessage(
              `You can only upload a maximum of ${maxFiles} files.`,
              3000,
            );

            return;
          }

          setSelectFiles((prev: any) => [
            ...prev,
            {
              ...file,
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.data.type,
              status: "uploading",
            },
          ]);

          const newFilename = await fetchRandomData();
          file.newFilename = newFilename + getFileNameExtension(file.name);
        });

        uppy.on("file-removed", (_file) => {
          try {
            // const index = getIndex(file.id);
            // handleCancelUpload({ index });
            if (!uppy.getFiles().length) {
              handleDoneUpload();
            }
          } catch (error) {
            console.error("Error removing file:", error);
          }
        });

        uppy.on("upload-success", async (file: File | Blob | any) => {
          const filePath = newFilePath + "/" + file.newFilename;

          const response = await uploadFileAction({
            variables: {
              data: {
                destination: "",
                newFilename: file.newFilename,
                filename: file.name,
                fileType: file.data.type,
                size: file.size.toString(),
                checkFile: folderId > 0 ? "sub" : "main",
                ...(folderId > 0 ? { folder_id: folderId } : ""),
                ...(folderId > 0 ? { newPath: filePath } : ""),
                country: "other",
                device: result.os.name || "" + result.os.version || "",
                totalUploadFile: uppy.getFiles().length,
              },
            },
          });

          const fileId = (await response.data?.createFiles?._id) as string;
          await handleActionFile(fileId);

          setSelectFiles((prev: any) => {
            return prev.map((f) => {
              if (f.id === file!.id) {
                return { ...f, status: "uploaded" };
              }
              return f;
            });
          });
        });

        uppy.on("cancel-all", () => {
          handleAllCancelUpload();
          handleDoneUpload();
          eventUploadTrigger?.trigger();
        });

        uppy.on("complete", async (result) => {
          await handleDoneUpload();

          const updatePromise = await result.successful.map((file) => {
            uppy.removeFile(file.id);
          });

          await Promise.all(updatePromise);
          await eventUploadTrigger?.trigger();
          successMessage("Upload files successfully", 3000);
          props?.onClose?.();
        });

        uppy.use(Webcam, {});
        uppy.use(ThumbnailGenerator, {
          thumbnailWidth: 200,
          thumbnailHeight: 200,
        });
        uppy.use(ImageEditor, {
          quality: 0.7,
          cropperOptions: {
            croppedCanvasOptions: {},
            viewMode: 1,
            background: false,
            center: true,
            responsive: true,
          },
        });
        uppy.use(AudioFile, {
          showAudioSourceDropdown: true,
        });
        uppy.use(AwsS3Multipart, {
          companionUrl: "",
          limit: queueUpload || 5,
          async createMultipartUpload(file: File | Blob | any) {
            const headers = {
              createdBy: user?._id,
              FILENAME: file.newFilename,
              PATH: `${subPath}`,
            };

            const _encryptHeader = await encryptData(headers);
            return fetch(
              `${ENV_KEYS.VITE_APP_LOAD_URL}initiate-multipart-upload`,
              {
                method: "POST",
                headers: {
                  encryptedheaders: _encryptHeader,
                },
              },
            )
              .then((response) => response.json())
              .then((data) => ({
                uploadId: data.uploadId,
                key: data.key,
              }));
          },
          async signPart(file: File | Blob | any, { uploadId, partNumber }) {
            const headers = {
              createdBy: user?._id,
              FILENAME: file.newFilename,
              PATH: `${subPath}`,
            };

            const _encryptHeader = await encryptData(headers);
            const formData = new FormData();
            formData.append("partNumber", partNumber.toString());
            formData.append("uploadId", uploadId);
            formData.append("FILENAME", file.newFilename);
            return fetch(
              `${ENV_KEYS.VITE_APP_LOAD_URL}generate-presigned-url`,
              {
                method: "POST",
                body: formData,
                headers: {
                  encryptedheaders: _encryptHeader,
                },
              },
            )
              .then((response) => response.json())
              .then((data) => ({
                url: data.url,
              }));
          },
          async completeMultipartUpload(
            file: File | Blob | any,
            { uploadId, parts },
          ) {
            const headers = {
              createdBy: user?._id,
              FILENAME: file.newFilename,
              PATH: `${subPath}`,
            };
            const _encryptHeader = await encryptData(headers);
            const formData = new FormData();

            formData.append("FILENAME", file.newFilename);
            formData.append("parts", JSON.stringify(parts));
            formData.append("uploadId", uploadId);
            return fetch(
              `${ENV_KEYS.VITE_APP_LOAD_URL}complete-multipart-upload`,
              {
                method: "POST",
                body: formData,
                headers: {
                  encryptedheaders: _encryptHeader,
                },
              },
            ).then((response) => response.json());
          },
        });

        setUppyInstance(uppy);

        return () => {
          uppy.close();
        };
      } catch (error: any) {
        console.log(error);
      }
    };

    initializeUppy();
  }, [subPath, user, userAuth, fileIdRef, folderId, subPath, newFilePath]);

  useEffect(() => {
    async function querySubFolder() {
      if (folderId > 0) {
        try {
          const queryfolderPath = await queryPath({
            variables: {
              where: {
                _id: folderId,
                createdBy: user?._id,
              },
            },
          });
          const newPath = queryfolderPath?.data?.folders?.data[0]?.newPath;
          if (newPath) {
            const real_path = `${user?.newName}-${user?._id}/${newPath}`;
            setSubPath(real_path);
            setNewFilePath(newPath);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        const newPath = `${user?.newName}-${user?._id}`;
        setSubPath(newPath);
        setNewFilePath("");
      }
    }

    querySubFolder();
  }, [folderId, user]);

  useEffect(() => {
    if (selectFiles?.length > 0) {
      selectFileRef.current = selectFiles;
    }
  }, [selectFiles]);

  return (
    <Fragment>
      <MUI.UploadDialogContainer
        fullWidth={true}
        open={props.open}
        onClose={canClose ? () => {} : handleCloseDialog}
      >
        <MUI.UploadUppyContainer>
          <MUI.UppyHeader>
            <Typography variant="h2">Upload and attach files</Typography>
          </MUI.UppyHeader>
          {uppyInstance && (
            <Fragment>
              <Dashboard
                uppy={uppyInstance}
                width={`${100}%`}
                showProgressDetails={true}
                locale={{
                  strings: {
                    addMore: "Add more",
                    cancel: "Cancel",
                    browseFiles: "browse files",
                    dropHint: "Drop your files here",
                  },
                }}
                plugins={["Webcam", "AudioFile"]}
                hideUploadButton={true}
                proudlyDisplayPoweredByUppy={false}
              />

              <MUI.ButtonActionBody>
                <MUI.ButtonActionContainer>
                  <MUI.ButtonCancelAction
                    disabled={canClose}
                    onClick={canClose ? () => {} : handleCloseDialog}
                  >
                    Cancel
                  </MUI.ButtonCancelAction>
                  <MUI.ButtonUploadAction
                    onClick={canClose ? () => {} : handleUploadToStorage}
                    disabled={canClose}
                  >
                    Upload now
                  </MUI.ButtonUploadAction>
                </MUI.ButtonActionContainer>
              </MUI.ButtonActionBody>
            </Fragment>
          )}
        </MUI.UploadUppyContainer>
      </MUI.UploadDialogContainer>
    </Fragment>
  );
}

export default WasabiUpload;
