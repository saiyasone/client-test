import { useMutation } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDoc from "@mui/icons-material/ReceiptSharp";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";
import {
  MUTATION_CREATE_TICKET,
  MUTATION_CREATE_TICKET_TYPE,
} from "api/graphql/ticket.graphql";
import CircularProgressBar from "components/loading/CircularProgressBar";
import { Formik } from "formik";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { Fragment, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { errorMessage, successMessage } from "utils/alert.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import * as Yup from "yup";
import { InputWrapper, Label } from "./styles/createTicket.style";
import { BrowseImageButton, ButtonUpload } from "./styles/ticket2.style";
import * as MUI from "./styles/ticketForm.style";

export default function TicketForm() {
  const manageGraphqlError = useManageGraphqlError();

  const [imgLoading, setImgLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  // const [] = useState(false);
  // const
  const [createTypeTicket] = useMutation(MUTATION_CREATE_TICKET_TYPE);
  const [createTicket] = useMutation(MUTATION_CREATE_TICKET);
  const schemaValidation = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    email: Yup.string().required("Email is required").email("Email is invalid"),
    message: Yup.string().required("Message is required"),
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach(() => {
        setFiles([...files, ...acceptedFiles]);
      });
    },
    [files],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,

    multiple: true,
  });

  function handleDelete(index) {
    setFiles(() => {
      return files.filter((_, i) => i !== index);
    });
  }

  async function onSubmitForm(values) {
    try {
      setLoading(true);
      const fileNames = files.map((file) => {
        let newName = "";
        if (file.name?.includes("'")) {
          newName = file?.name.replace(/'/g, "");
        } else {
          newName = file.name;
        }

        return newName;
      }) || [""];
      // ["a.png", "b.png", "c.png]
      const fileUploads = [...files] || [];

      const typeResult = await createTypeTicket({
        variables: {
          data: {
            title: values.title,
            email: values.email,
          },
        },
      });
      const typeId = await typeResult?.data?.createTypetickets?._id;
      if (typeId) {
        const result = await createTicket({
          variables: {
            data: {
              title: values.title,
              typeTicketID: parseInt(typeId),
              email: values.email,
              message: values.message,
              image: [...fileNames],
              statusSend: "createTypeticket",
            },
          },
        });
        if (result?.data?.createTickets?._id) {
          // const imageAccess = (await result?.data?.createTickets?.image) || [];
          if (fileUploads.length) {
            // setImgLoading(true);
            // for (let i = 0; i < fileUploads.length; i++) {
            //   await axios.put(
            //     `${bunnyUrl}/${user?.newName}-${user?._id}/${imageAccess[i].newNameImage}`,
            //     fileUploads[i],
            //     {
            //       headers: {
            //         AccessKey: accessKey,
            //         "Content-Type": "multipart/form-data",
            //       },
            //       onUploadProgress: (progressEvent: any) => {
            //         const percentCompleted = Math.round(
            //           (progressEvent.loaded * 100) / progressEvent.total,
            //         );
            //         if (percentCompleted === 100) {
            //           setProgress(99);
            //         } else {
            //           setProgress(percentCompleted);
            //         }
            //       },
            //     },
            //   );
            // }
            // setImgLoading(false);
          }
          setProgress(0);
          setLoading(false);
          setFiles([]);
          successMessage("Ticket is created", 2000);
          window.history.back();
        }
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      setImgLoading(false);
      setLoading(false);

      errorMessage(
        manageGraphqlError.handleErrorMessage(
          cutErr || "Something went wrong, Please try again",
        ) as string,
        3000,
      );
    }
  }

  return (
    <Fragment>
      <CircularProgressBar
        dialogProps={{
          PaperProps: {
            sx: {
              overflowY: "initial",
              maxWidth: "sm",
            },
          },
          sx: {
            columnGap: "20px",
          },
        }}
        dialogContentProps={{
          sx: {
            backgroundColor: "white !important",
            borderRadius: "6px",
            padding: (theme) => `${theme.spacing(5)}`,
          },
        }}
        isOpen={imgLoading}
        value={progress}
      />

      {/* <Button variant="contained" onClick={isCheckFileSize}>
        Try
      </Button> */}
      <Formik
        initialValues={{
          message: "",
          title: "",
          email: "",
        }}
        validationSchema={schemaValidation}
        onSubmit={onSubmitForm}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          touched,
          values,
        }) => (
          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <Label htmlFor="labelTitle">Title</Label>
              <TextField
                id="labelTitle"
                name="title"
                placeholder="Title"
                // label="title"
                fullWidth={true}
                size="small"
                error={Boolean(touched.title && errors.title)}
                helperText={touched.title && errors.title}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.title}
              />
            </InputWrapper>

            <InputWrapper>
              <Label htmlFor="labelEmail">Email</Label>
              <TextField
                id="labelEmail"
                name="email"
                placeholder="Email"
                // label="email"
                fullWidth={true}
                size="small"
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
              />
            </InputWrapper>

            <InputWrapper>
              <Label htmlFor="labelMessage">Message</Label>
              <TextField
                id="labelMessage"
                name="message"
                placeholder="message"
                // label="message"
                multiline={true}
                rows={7}
                fullWidth={true}
                error={Boolean(touched.message && errors.message)}
                helperText={touched.message && errors.message}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.message}
              />
            </InputWrapper>

            <MUI.TicketContainerUpload>
              <Typography variant="h4">Attachments</Typography>
              {/* <TicketFileUpload handleFile={callBackFile} /> */}

              <MUI.TicketContainerWrapper>
                <MUI.TicketBodyUpload>
                  <MUI.TicketHeader {...getRootProps()}>
                    <Box mb={5}>
                      <Typography component="span">
                        10 MB Limit per file
                      </Typography>
                    </Box>
                    <ButtonUpload style={{ marginBottom: "8px" }}>
                      <FiUpload
                        style={{
                          fontSize: "30px",
                        }}
                      />
                    </ButtonUpload>
                    <Typography variant="h4">Drag & drop to upload</Typography>
                    <Box>
                      <Typography component="span">or</Typography>
                    </Box>
                    <BrowseImageButton
                      style={{ marginTop: "1rem" }}
                      type="button"
                    >
                      Browse image
                      <input {...getInputProps()} hidden={true} />
                    </BrowseImageButton>
                  </MUI.TicketHeader>

                  {files.length > 0 && (
                    <MUI.FileList mt={3}>
                      {files.map((file, index) => {
                        return (
                          <MUI.FileListItem key={index}>
                            <Box className="box-img">
                              <FileDoc className="icon" />
                            </Box>
                            <Box className="text-file">
                              <Box className="file-wrapper">
                                <Typography component="p">
                                  {file.name}
                                </Typography>
                                <Typography component="span">
                                  {convertBytetoMBandGB(file.size)}
                                </Typography>
                              </Box>

                              <Box className="action-file">
                                <DeleteIcon
                                  className="icon"
                                  onClick={() => handleDelete(index)}
                                />
                              </Box>
                            </Box>
                          </MUI.FileListItem>
                        );
                      })}
                    </MUI.FileList>
                  )}
                </MUI.TicketBodyUpload>
              </MUI.TicketContainerWrapper>
            </MUI.TicketContainerUpload>

            <LoadingButton
              type="submit"
              variant="contained"
              style={{ marginTop: "1.5rem" }}
              loading={loading}
            >
              Create Ticket
            </LoadingButton>
          </form>
        )}
      </Formik>
    </Fragment>
  );
}
