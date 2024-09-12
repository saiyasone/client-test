import { Fragment, useContext, useEffect, useRef, useState } from "react";

// uppy package
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import ImageEditor from "@uppy/image-editor";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import Webcam from "@uppy/webcam";
import AudioFile from "@uppy/audio";
import AwsS3Multipart from "@uppy/aws-s3";

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
import { Typography } from "@mui/material";
import useAuth from "hooks/useAuth";
import { encryptData } from "utils/secure.util";
import { getFileNameExtension } from "utils/file.util";
import { UAParser } from "ua-parser-js";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";

type Props = {
  open: boolean;
  onClose?: () => void;
};

function WasabiUpload(props: Props) {
  const [canClose, setCanClose] = useState(false);

  const [fileId, setFileId] = useState({});
  const [selectFiles, setSelectFiles] = useState<any>([]);

  const [uppyInstance, setUppyInstance] = useState(() => new Uppy());
  const selectFileRef = useRef(selectFiles);
  const fileIdRef = useRef<any>(fileId);

  const UA = new UAParser();
  const result = UA.getResult();

  // auth
  const { user }: any = useAuth();
  const eventUploadTrigger = useContext(EventUploadTriggerContext);

  //   graphql
  const [uploadFileAction] = useMutation(MUTATION_CREATE_FILE);
  const [deleteFile] = useMutation(MUTATION_DELETE_FILE);

  const manageGraphError = useManageGraphqlError();

  async function handleUploadV1() {
    if (!uppyInstance.getFiles().length) return;

    setCanClose(true);

    try {
      await uppyInstance.upload();
    } catch (error: any) {
      //
    }
  }

  async function handleCancelUpload({ index }) {
    try {
      const _id = fileIdRef.current[index];

      if (_id) {
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

  function handleCloseDialog() {
    handleDoneUpload();
    props.onClose?.();
  }

  function handleDoneUpload() {
    setFileId({});
    setSelectFiles([]);
    setCanClose(false);
    fileIdRef.current.value = null;
    selectFileRef.current = [];

    const files = uppyInstance.getFiles();

    files.forEach((file) => {
      uppyInstance.removeFile(file.id);
    });

    const dashboard = uppyInstance.getPlugin("Dashboard");
    if (dashboard) {
      dashboard;
    }
  }

  function getIndex(fileId) {
    return selectFileRef.current.findIndex(
      (selected) => selected.id === fileId,
    );
  }

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

        uppy.on("file-added", async (file) => {
          try {
            setSelectFiles((prev: any) => [
              ...prev,
              {
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.data.type,
              },
            ]);

            const newFilename = await fetchRandomData();
            file.newFilename = newFilename + getFileNameExtension(file.name);
          } catch (error) {
            //
          }
        });
        uppy.on("file-removed", (file) => {
          try {
            if (canClose) {
              const index = getIndex(file.id);
              handleCancelUpload({ index });
            }
          } catch (error) {
            console.error("Error removing file:", error);
          }
        });

        uppy.on("cancel-all", () => {
          // handleDoneUpload();
        });
        uppy.on("complete", () => {
          eventUploadTrigger?.trigger();
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
          shouldUseMultipart: true,
          limit: 4,
          endpoint: "",

          async createMultipartUpload(file: File | Blob | any) {
            const uploading = await uploadFileAction({
              variables: {
                data: {
                  destination: "",
                  newFilename: file.newFilename,
                  filename: file.name,
                  fileType: file.data.type,
                  size: file.size.toString(),
                  checkFile: "main",
                  country: "other",
                  device: result.os.name || "" + result.os.version || "",
                  totalUploadFile: uppy.getFiles().length,
                  newPath: "",
                },
              },
            });

            await uploading.data?.createFiles?._id;
            const headers = {
              createdBy: user?._id,
              FILENAME: file.newFilename,
              PATH: `${user?.newName}-${user?._id}`,
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
              PATH: `${user?.newName}-${user?._id}`,
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
              PATH: `${user?.newName}-${user?._id}`,
            };
            const _encryptHeader = await encryptData(headers);

            const formData = new FormData();
            formData.append("parts", JSON.stringify(parts));
            formData.append("uploadId", uploadId);
            // formData.append("FILENAME", file.newFileName);

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
          uppy.clear();
        };
      } catch (error: any) {
        console.log(error);
      }
    };

    initializeUppy();
  }, []);

  useEffect(() => {
    if (selectFiles.length > 0) {
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
                    onClick={canClose ? () => {} : handleCloseDialog}
                  >
                    Cancel
                  </MUI.ButtonCancelAction>
                  <MUI.ButtonUploadAction onClick={handleUploadV1}>
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
