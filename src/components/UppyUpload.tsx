import { Fragment, useEffect, useRef, useState } from "react";

// uppy package
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import xhrUpload from "@uppy/xhr-upload";
import ImageEditor from "@uppy/image-editor";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import Webcam from "@uppy/webcam";
import AudioFile from "@uppy/audio";

import * as MUI from "../styles/uppyStyle.style";

// uppy css
import "../styles/uppy-theme.css";
import "@uppy/core/dist/style.min.css";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import "@uppy/image-editor/dist/style.css";
import "@uppy/audio/dist/style.min.css";

import { useMutation } from "@apollo/client";
import {
  MUTATION_CREATE_FILE,
  MUTATION_DELETE_FILE,
} from "api/graphql/file.graphql";
import { ENV_KEYS } from "constants/env.constant";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { errorMessage } from "utils/alert.util";
import { Box, Button, Typography } from "@mui/material";
import UploadFolderManual from "./UploadFolder";
import useAuth from "hooks/useAuth";
import { encryptData } from "utils/secure.util";

// type Props = {
//   open?: boolean;
// };

function UppyUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [isOpenFolder, setIsOpenFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [canClose, setCanClose] = useState(false);

  const [fileId, setFileId] = useState({});
  const [selectFiles, setSelectFiles] = useState<any>([]);

  const [uppyInstance, setUppyInstance] = useState(() => new Uppy());
  const selectFileRef = useRef(selectFiles);
  const fileIdRef = useRef<any>(fileId);

  // auth
  const { user }: any = useAuth();
  let uploadSuccess = 0;

  //   graphql
  const [uploadFileAction] = useMutation(MUTATION_CREATE_FILE);
  const [deleteFile] = useMutation(MUTATION_DELETE_FILE);

  const manageGraphError = useManageGraphqlError();

  async function handleUpload() {
    if (!uppyInstance.getFiles().length) return;

    setIsUploading(true);
    setCanClose(true);

    try {
      const dataFile = uppyInstance.getFiles() as any[];

      await dataFile.map(async (file, index) => {
        const extension = file?.name?.lastIndexOf(".");
        const fileExtension = file.name?.slice(extension);
        if (uppyInstance) {
          const result = await uploadFileAction({
            variables: {
              data: {
                newFilename: `${file.data.customeNewName}${fileExtension}`,
                filename: file.name,
                fileType: file.type,
                size: file.size.toString(),
                checkFile: "main",
                country: null,
                device: "Windows10",
                totalUploadFile: dataFile.length,
              },
            },
          });
          const fileId = await result.data?.createFiles?._id;
          if (fileId) {
            fileIdRef.current = {
              ...fileIdRef.current,
              [index]: fileId,
            };

            setFileId(fileIdRef.current);
            await uppyInstance.upload();
          }
        }
      });
    } catch (error: any) {
      handleDoneUpload();
      console.log(error);
    }
  }

  async function handleCancelUpload({ index }) {
    try {
      const _id = fileIdRef.current[index];

      if (_id) {
        // setSelectFiles(() =>
        //   selectFileRef.current.filter((selected) => selected.id !== file.id),
        // );
        setFileId((prev) => {
          const newFileId = { ...prev };
          delete newFileId[index];
          fileIdRef.current = newFileId;

          return newFileId;
        });

        await deleteFile({
          variables: {
            id: _id,
          },
          onCompleted: () => {},
        });
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphError.handleErrorMessage(
          cutErr || "Something wrong please try again !",
        ) as string,
        3000,
      );
    }
  }

  async function fetchRandomData() {
    const randomName = Math.floor(11111111 + Math.random() * 99999999);
    return randomName;
  }

  function handleDoneUpload() {
    setFileId({});
    setSelectFiles([]);
    setIsUploading(false);
    setCanClose(false);
    setFileCount(0);
    fileIdRef.current.value = null;
    selectFileRef.current = [];
  }

  function handleIsUploading() {
    if (canClose) {
      return;
    }
    setIsOpen(false);
    handleDoneUpload();
  }

  function getIndex(fileId) {
    return selectFileRef.current.findIndex(
      (selected) => selected.id === fileId,
    );
  }

  const checkAllFilesRemoved = () => {
    const files = selectFileRef.current;
    console.log(files);
    // if (files.length === 0) {
    //   console.log("All files removed");
    // }
  };

  useEffect(() => {
    const initializeUppy = () => {
      try {
        const uppy = new Uppy({
          id: "upload-file-id",
          restrictions: {
            maxNumberOfFiles: user?.packageId?.numberOfFileUpload || 1,
          },
          autoProceed: false,
          allowMultipleUploadBatches: true,
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
        uppy.on("file-added", (file: any) => {
          try {
            setSelectFiles((prev: any) => [
              ...prev,
              {
                id: file.id,
                name: file.name,
                size: file.data.size,
                type: file.data.type,
              },
            ]);

            fetchRandomData().then((data) => {
              file.data.customeNewName = data;
            });
          } catch (error) {
            //
          }
        });
        uppy.on("file-removed", (file) => {
          try {
            const index = getIndex(file.id);
            handleCancelUpload({ index });
            // checkAllFilesRemoved();
          } catch (error) {
            console.error("Error removing file:", error);
          }
        });
        uppy.on("upload-error", () => {});
        uppy.on("cancel-all", () => {
          handleDoneUpload();
        });
        uppy.on("upload-success", () => {
          uploadSuccess++;
          setFileCount(uploadSuccess);
          // console.log({
          //   selectFile: selectFileRef.current?.length,
          // });

          if (uploadSuccess === selectFileRef.current?.length) {
            handleDoneUpload();
          }
          // if (result.successful.length === selectFileRef.current?.length) {
          //   handleDoneUpload();
          //   console.log("upload file successfully uploaded");
          // }
        });

        uppy.use(xhrUpload, {
          endpoint: ENV_KEYS.VITE_APP_LOAD_UPLOAD_URL,
          formData: true,
          method: "POST",
          fieldName: "file",

          headers: (file: any) => {
            const extension = file?.name?.lastIndexOf(".");
            const fileExtension = file.name?.slice(extension);

            const headers = {
              PATH: `${user?.newName}-${user?._id}`,
              FILENAME: `${file.data?.customeNewName}${fileExtension}`,
              createdBy: user?._id,
            };

            const encryptedData = encryptData(headers);

            return {
              encryptedHeaders: encryptedData,
            };
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
  }, [user]);

  useEffect(() => {
    if (selectFiles.length > 0) {
      selectFileRef.current = selectFiles;
    }
  }, [selectFiles]);

  return (
    <Fragment>
      <Box sx={{ display: "flex", gap: "1rem", mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Upload file
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setIsOpenFolder(true);
          }}
        >
          Upload folder
        </Button>
      </Box>

      <UploadFolderManual
        isOpen={isOpenFolder}
        userData={user}
        handleClose={() => {
          setIsOpenFolder(false);
        }}
      />
      <MUI.UploadDialogContainer
        //   onClose={canClose ? () => {} : handleCloseModal}
        // open={open || false}
        fullWidth={true}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
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
                    // dropPaste: "Hello files",
                    // browse: "browse",
                    browseFiles: "browse files",
                    dropHint: "Drop your files here",
                  },
                }}
                plugins={[
                  "Webcam",
                  "AudioFile",
                  "Dropbox",
                  "Instagram",
                  "Url",
                  "PauseResumeButton",
                ]}
                hideUploadButton={true}
                proudlyDisplayPoweredByUppy={false}
              />

              <MUI.ButtonActionBody>
                <MUI.ButtonActionContainer>
                  <MUI.ButtonCancelAction
                    disabled={canClose}
                    onClick={handleIsUploading}
                  >
                    Cancel
                  </MUI.ButtonCancelAction>
                  <MUI.ButtonUploadAction onClick={handleUpload}>
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

export default UppyUpload;
