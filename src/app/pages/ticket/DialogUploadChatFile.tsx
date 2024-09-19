import {
  Box,
  Dialog,
  DialogContent,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
// import DialogV1 from "./DialogV1";
import { useMutation } from "@apollo/client";
import IconAdd from "@mui/icons-material/Add";
import IconDel from "@mui/icons-material/Close";
import IconEmpty from "@mui/icons-material/CreateNewFolder";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";

import { MUTATION_CREATE_TICKET } from "api/graphql/ticket.graphql";
import useAuth from "hooks/useAuth";
import * as ChatAction from "stores/features/chatSlice";
import { errorMessage } from "utils/alert.util";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import {
  BoxAddFile,
  BoxDelFile,
  BoxPreviewFile,
  BoxPreviewFileContainer,
  BoxPreviewFileInnerV1,
  BoxPreviewFileInnerV1Container,
  BoxPreviewFileV1,
  BoxProgressItem,
  BoxProgressItemLine,
  BoxProgressText,
  ChatPreviewFileData,
  ChatPreviewUploadFile,
  ChatShowUploadFileContainer,
  ChatShowUploadFileHeader,
  ShowUploadChatFile,
  ShowUploadChatForm,
} from "./styles/chat.style";
import { encryptData } from "utils/secure.util";
import { ENV_KEYS } from "constants/env.constant";
import axios from "axios";

function DialogUploadChatFile(props) {
  const { dataReply, isAdmin, onConfirm, selectFileMore } = props;
  const [showUpload, setShowUpload] = useState(false);
  const [showProgress, setShowProgress] = useState<any>({});
  const { user }: any = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const schema = yup
    .object()
    .shape({ reply: yup.string().required("Reply is required") });
  const [createReplyMessage] = useMutation(MUTATION_CREATE_TICKET, {
    fetchPolicy: "no-cache",
  });
  const chatSelector = useSelector(ChatAction.chatMessageSelector);

  function handlePreviewIndex(index) {
    dispatch(ChatAction.setCurrentIndex(index));
  }

  function handleDelFile(index) {
    dispatch(ChatAction.setCurrentIndex(index));
    dispatch(ChatAction.setRemoveFile(index));
  }

  function ShowIconEmpty() {
    return (
      <IconEmpty
        sx={{
          width: "100px",
          height: "100px",
          color: "#ccc",
        }}
      />
    );
  }

  const submitDialogFormReply = async (values) => {
    setIsLoading(true);
    try {
      const fileNames = chatSelector?.files.map((file) => file.name) || [];
      const result = await createReplyMessage({
        variables: {
          data: {
            title: dataReply?.title,
            typeTicketID: parseInt(dataReply?._id),
            email: dataReply?.email,
            message: values?.reply,
            image: [...fileNames],
            statusSend: chatSelector?.dataReply?._id ? null : "answerMessage",
            replyMessage: chatSelector?.dataReply?._id
              ? parseInt(chatSelector?.dataReply?._id)
              : parseInt("0"),
          },
          request: isAdmin ? "backoffice" : "client",
        },
      });

      if (result?.data?.createTickets?._id) {
        if (chatSelector?.files.length) {
          setShowUpload(true);
          const imageAccess = (await result?.data?.createTickets?.image) || [];

          const uploadPromises = chatSelector?.files.map(
            async (file, index) => {
              const headers = {
                PATH: `${user?.newName}-${user?._id}/chat-message`,
                FILENAME: `${imageAccess[index]?.newNameImage}`,
                createdBy: user?._id,
              };

              const formData = new FormData();
              formData.append("file", file);

              const encryptedHeader = encryptData(headers);
              await axios.post(
                `${ENV_KEYS.VITE_APP_LOAD_UPLOAD_URL}`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    encryptedheaders: encryptedHeader!,
                  },

                  onUploadProgress: (event: any) => {
                    const percentCompleted = Math.round(
                      (event.loaded * 100) / event.total,
                    );

                    setShowProgress((prev) => ({
                      ...prev,
                      [index]: percentCompleted,
                    }));
                  },
                },
              );
            },
          );

          await Promise.all(uploadPromises);
          handleClose();
        }
      }
    } catch (error) {
      setShowUpload(false);
      setIsLoading(false);
      errorMessage("Something went wrong, please try again", 3000);
    }
  };

  const handleClose = () => {
    setIsLoading(false);
    setShowUpload(false);
    dispatch(ChatAction.setChatMessageEMPTY());
    setShowProgress({});
    onConfirm();
  };

  return (
    <Fragment>
      <Dialog
        open={props?.isOpen || false}
        fullWidth={true}
        maxWidth="sm"
        onClose={() => {
          if (showUpload) {
            return;
          }

          handleClose();
        }}
      >
        <DialogContent>
          {/* Preview Header file name */}
          <ChatShowUploadFileHeader>
            {chatSelector?.files.length ? (
              chatSelector?.currentIndexFile !== -1 ? (
                <Typography component="span">
                  {chatSelector?.files[chatSelector?.currentIndexFile]?.name}
                </Typography>
              ) : null
            ) : (
              <Typography component="span">No File selected</Typography>
            )}
          </ChatShowUploadFileHeader>

          <ChatShowUploadFileContainer>
            <ShowUploadChatFile>
              {chatSelector?.files.length ? (
                <>
                  {chatSelector?.files[chatSelector?.currentIndexFile]?.name ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      {/* Preview Photo */}
                      <ChatPreviewUploadFile>
                        {/* file icon */}
                        <FileIcon
                          color="white"
                          extension={getFileType(
                            chatSelector?.files[chatSelector?.currentIndexFile]
                              ?.name,
                          )}
                          {...{
                            ...defaultStyles[
                              getFileType(
                                chatSelector?.files[
                                  chatSelector?.currentIndexFile
                                ]?.name,
                              ) as string
                            ],
                          }}
                        />
                      </ChatPreviewUploadFile>

                      {/* Preview File with Data */}
                      <ChatPreviewFileData>
                        <Typography component="span">
                          {convertBytetoMBandGB(
                            chatSelector?.files[chatSelector?.currentIndexFile]
                              ?.size,
                          )}
                        </Typography>
                      </ChatPreviewFileData>
                    </Box>
                  ) : (
                    ShowIconEmpty()
                  )}
                </>
              ) : (
                ShowIconEmpty()
              )}
            </ShowUploadChatFile>

            <ShowUploadChatForm>
              <Formik
                initialValues={{ reply: "" }}
                validationSchema={schema}
                onSubmit={submitDialogFormReply}
              >
                {({ errors, touched, handleChange, handleSubmit, values }) => (
                  <form onSubmit={handleSubmit}>
                    <OutlinedInput
                      id="labelReply"
                      type="text"
                      name="reply"
                      size="medium"
                      placeholder="Type your message here..."
                      fullWidth={true}
                      multiline={true}
                      error={Boolean(touched.reply && errors.reply)}
                      value={values.reply}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={isLoading}
                          >
                            Send
                          </LoadingButton>
                        </InputAdornment>
                      }
                    />
                  </form>
                )}
              </Formik>
            </ShowUploadChatForm>

            <BoxPreviewFileContainer>
              {showUpload ? (
                <Fragment>
                  {chatSelector?.files.map((file, index) => {
                    const progress = showProgress[index]
                      ? showProgress[index]
                      : 0;

                    return (
                      <BoxPreviewFileV1 key={index}>
                        <BoxPreviewFileInnerV1Container>
                          <BoxPreviewFileInnerV1>
                            <Box
                              sx={{
                                width: "16px",
                              }}
                            >
                              <FileIcon
                                color="white"
                                extension={getFileType(file.path)}
                                {...{
                                  ...defaultStyles[
                                    getFileType(file.path) as string
                                  ],
                                }}
                              />
                            </Box>

                            <BoxProgressText>
                              <Typography component="span" color="initial">
                                {file?.path}
                              </Typography>
                              <BoxProgressItem>
                                <BoxProgressItemLine
                                  sx={{
                                    width: progress + "%",
                                  }}
                                ></BoxProgressItemLine>
                              </BoxProgressItem>
                            </BoxProgressText>
                          </BoxPreviewFileInnerV1>
                        </BoxPreviewFileInnerV1Container>
                      </BoxPreviewFileV1>
                    );
                  })}
                </Fragment>
              ) : (
                <Fragment>
                  {chatSelector?.files?.length ? (
                    <Fragment>
                      {chatSelector?.files?.map((file, index) => (
                        <BoxPreviewFile
                          className={
                            chatSelector?.currentIndexFile === index
                              ? "active"
                              : ""
                          }
                          key={index}
                          onClick={() => handlePreviewIndex(index)}
                        >
                          <BoxDelFile
                            className="icon-del"
                            onClick={() => handleDelFile(index)}
                          >
                            <IconDel
                              sx={{ fontSize: "0.7rem", color: "#D53333" }}
                            />
                          </BoxDelFile>
                          <Box
                            sx={{
                              width: "20px",
                            }}
                          >
                            <FileIcon
                              color="white"
                              extension={getFileType(file?.name)}
                              {...{
                                ...defaultStyles[
                                  getFileType(file?.name) as string
                                ],
                              }}
                            />
                          </Box>
                        </BoxPreviewFile>
                      ))}
                    </Fragment>
                  ) : null}
                  <BoxAddFile
                    {...selectFileMore}
                    //  onClick={handleFile}
                  >
                    <IconAdd className="icon-add" />
                  </BoxAddFile>
                </Fragment>
              )}
            </BoxPreviewFileContainer>
          </ChatShowUploadFileContainer>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default DialogUploadChatFile;
