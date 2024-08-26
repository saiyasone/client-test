import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as chatSlice from "stores/features/chatSlice";
import * as yup from "yup";
import * as MUI from "./styles/chat.style";

// material ui
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { MUTATION_CREATE_TICKET } from "api/graphql/ticket.graphql";
import { useDropzone } from "react-dropzone";
import { errorMessage } from "utils/alert.util";
import DialogUploadChatFile from "./DialogUploadChatFile";

export default function ChatFormReply(props) {
  const { dataReply, handleReloading, isAdmin } = props;
  const [isFile, setIsFile] = useState(false);

  const inputRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [_textMessage, _setTextMessage] = useState("");
  const [createReplyMessage] = useMutation(MUTATION_CREATE_TICKET, {
    fetchPolicy: "no-cache",
  });
  const chatSelector = useSelector(chatSlice.chatMessageSelector);
  const dispatch = useDispatch();

  const onDropFile = useCallback(
    (acceptFiles) => {
      acceptFiles.map((file) => {
        dispatch(chatSlice.setFiles(file));
      });
      setIsFile(true);
    },
    [chatSelector?.files],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropFile,

    multiple: true,
  });

  const handleIsFileClose = () => {
    setIsFile(false);
    dispatch(chatSlice.setFilesEmpty());
    dispatch(chatSlice.setCurrentIndex(0));
    handleReloading();
  };

  const handleClearMessage = () => dispatch(chatSlice.setChatMessageEMPTY());

  // values, action
  const submitFormReply = async (values, action) => {
    // if (!textMessage) {
    //   return;
    // }

    try {
      setIsLoading(true);
      const result = await createReplyMessage({
        variables: {
          data: {
            typeTicketID: parseInt(dataReply?._id),
            title: dataReply?.title,
            email: dataReply?.email,
            // message: textMessage,
            message: values?.reply,
            image: [],
            statusSend: chatSelector?.dataReply?._id ? null : "answerMessage",
            replyMessage: chatSelector?.dataReply?._id
              ? parseInt(chatSelector?.dataReply?._id)
              : parseInt("0"),
          },
          request: isAdmin ? "backoffice" : "client",
        },
      });

      if (result?.data?.createTickets?._id) {
        handleReloading();
        setIsLoading(false);
        handleClearMessage();
        // setTextMessage("");
        action?.resetForm();
      }
    } catch (error) {
      setIsLoading(false);
      errorMessage("Something went wrong, please try again", 3000);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Fragment>
      <Formik
        initialValues={{
          reply: "",
        }}
        validationSchema={yup.object().shape({
          reply: yup.string().required(),
        })}
        onSubmit={submitFormReply}
      >
        {({ handleSubmit, errors, touched, handleChange, values }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              multiple={true}
              hidden={true}
              {...getInputProps()}
            />
            <OutlinedInput
              id="labelReply"
              name="reply"
              type="text"
              size="medium"
              placeholder="Type your message here..."
              fullWidth={true}
              multiline={true}
              ref={inputRef}
              error={Boolean(touched.reply && errors.reply)}
              value={values.reply}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <MUI.ChatReplyInput>
                    <IconButton
                      aria-label="toggle password visibility"
                      edge="end"
                      type="button"
                      sx={{ marginRight: "0.8rem" }}
                      {...getRootProps()}
                    >
                      {<UploadFileIcon sx={{ fontSize: "1.2rem" }} />}
                    </IconButton>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isLoading}
                    >
                      Send
                    </LoadingButton>
                  </MUI.ChatReplyInput>
                </InputAdornment>
              }
            />
          </form>
        )}
      </Formik>

      <DialogUploadChatFile
        isOpen={isFile}
        isAdmin={isAdmin}
        dataReply={dataReply}
        onClose={handleIsFileClose}
        onConfirm={handleIsFileClose}
        selectFileMore={{ ...getRootProps() }}
      />
    </Fragment>
  );
}
