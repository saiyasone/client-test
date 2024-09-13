import { useMutation } from "@apollo/client";
import { ContentCopy } from "@mui/icons-material";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { MUTATION_UPDATE_FILE } from "api/graphql/file.graphql";
import { MUTATION_UPDATE_FOLDER } from "api/graphql/folder.graphql";
import BaseDialogV1 from "components/BaseDialogV1";
import Loader from "components/Loader";
import CryptoJS from "crypto-js";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import * as htmlToImage from "html-to-image";
import { htmlToText } from "html-to-text";
import { Fragment, useRef, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import * as MUI from "styles/passwordLink.style";
import { errorMessage, successMessage } from "utils/alert.util";
import { getFileType } from "utils/file.util";
import { limitContent } from "utils/string.util";

function DialogCreateMultipleFilePassword(props) {
  const { onClose, onConfirm } = props;
  const manageGraphqlError = useManageGraphqlError();
  const passwordRef = useRef<any>();
  const isMobile = useMediaQuery("(max-width: 600px)");

  const [lockPassword, setLockPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  async function handleCopy() {
    setCopyLoading(true);
    const element = passwordRef.current?.innerHTML;
    const text = htmlToText(element);
    if ("clipboard" in navigator) {
      setTimeout(async () => {
        setCopyLoading(false);
        setIsCopy(true);
        await navigator.clipboard.writeText(`${text}`);
        successMessage("Copied successfully", 2000);
      }, 500);
    } else {
      setTimeout(async () => {
        setCopyLoading(false);
        setIsCopy(true);
        await document.execCommand("copy", true, `${text}`);
        successMessage("Copied successfully", 2000);
      }, 500);
    }
  }

  async function handleUpdateFile() {
    if (!lockPassword) {
      return;
    }

    const genCodePassword = CryptoJS.MD5(lockPassword).toString();

    const lockFileData = [...dataSelector.selectionFileAndFolderData];
    if (lockFileData.length > 0) {
      try {
        await lockFileData.map(async (item) => {
          if (item.checkType === "folder") {
            await updateFolder({
              variables: {
                data: {
                  access_password: lockPassword,
                },

                where: {
                  _id: item.id,
                },
              },
              onCompleted: async () => {
                onConfirm();
              },
            });
          } else {
            await updateFile({
              variables: {
                data: {
                  filePassword: genCodePassword,
                },

                where: {
                  _id: item.id,
                },
              },
              onCompleted: async () => {
                onConfirm();
              },
            });
          }
        });

        dispatch(checkboxAction.setFileDataPassword(lockFileData));
        setIsDone(true);

        successMessage("Update lock data successfully", 2000);
      } catch (error: any) {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(
            cutErr || "Something went wrong, Please try again",
          ) as string,
          3000,
        );
      }
    }
  }

  const generateMainPassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setLockPassword(password);
  };

  function clearGenerate() {
    setLockPassword("");
  }

  function handleCloseForm() {
    dispatch(checkboxAction.setRemoveDataPassword());
    clearGenerate();
    setShowPassword(false);
    setIsDone(false);
    setIsCopy(false);
    onClose();
  }

  const handleDownloadPasswordAsImage = () => {
    const element = passwordRef.current;
    const style = `
    font-size: 18px;
    background-color: white;
    color: black;
  `;
    element.style = style;

    htmlToImage.toPng(element).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "lock-password.png";
      link.href = dataUrl;
      link.click();
    });
  };

  function handleShowPassword() {
    setShowPassword(!showPassword);
  }

  return (
    <Fragment>
      <BaseDialogV1
        {...props}
        dialogProps={{
          PaperProps: {
            sx: {
              overflowY: "initial",
              maxWidth: "500px",
            },
          },
        }}
        dialogContentProps={{
          padding: "20px",
          sx: {
            backgroundColor: "white !important",
            borderRadius: "6px",
            padding: 0,
          },
        }}
        onClose={handleCloseForm}
      >
        <Box sx={{ padding: 10 }}>
          {!isDone && (
            <Fragment>
              <MUI.HeaderPasswordContainer>
                <MUI.HeaderTitle>
                  <Typography variant="h2">
                    Please enter your password
                  </Typography>
                  <Typography variant="h5">
                    Please enter a password that is entry to remember, both
                    letters and numbers.
                  </Typography>
                </MUI.HeaderTitle>
              </MUI.HeaderPasswordContainer>

              <MUI.HeaderFileItemContainer>
                <Typography variant="h2">Files detail:</Typography>

                {dataSelector?.selectionFileAndFolderData?.map(
                  (file, index) => {
                    return (
                      <MUI.HeaderFileItem key={index}>
                        <Typography component="p">
                          {index + 1}. {file?.name}
                        </Typography>
                      </MUI.HeaderFileItem>
                    );
                  },
                )}
              </MUI.HeaderFileItemContainer>

              <MUI.HeaderForm>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateFile();
                  }}
                >
                  <MUI.FormInput>
                    <OutlinedInput
                      id="passwordLink"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      fullWidth={true}
                      size="small"
                      onChange={(e) => setLockPassword(e.target.value)}
                      value={lockPassword}
                      endAdornment={
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                          <Box
                            sx={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {showPassword ? (
                              <AiOutlineEye
                                size="18"
                                onClick={handleShowPassword}
                              />
                            ) : (
                              <AiOutlineEyeInvisible
                                size="18"
                                onClick={handleShowPassword}
                              />
                            )}
                          </Box>
                        </InputAdornment>
                      }
                    />
                  </MUI.FormInput>

                  <MUI.FormAction>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={lockPassword ? false : true}
                    >
                      Create password
                    </Button>
                    <Button variant="contained" onClick={generateMainPassword}>
                      <LockOpenIcon
                        sx={{
                          fontSize: "18px",
                          cursor: "pointer",
                          mr: 1,
                          color: "#fff",
                        }}
                      />
                      {isMobile ? "" : "Random"}
                    </Button>
                  </MUI.FormAction>
                </form>
              </MUI.HeaderForm>
            </Fragment>
          )}

          {isDone && (
            <Fragment>
              <MUI.HeaderDoneContainer>
                <Typography variant="h2">Enter Password Success</Typography>
                <Typography variant="h5">
                  This is your password, Can be downloaded as an image.
                </Typography>
              </MUI.HeaderDoneContainer>

              <MUI.DoneWrapperContainer ref={passwordRef}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MUI.DoneLabel sx={{ mr: 2 }}>Your password:</MUI.DoneLabel>
                  <Typography variant="h2">
                    {lockPassword || "unknown"}
                  </Typography>
                </Box>

                <MUI.DoneItemContainer>
                  <Typography variant="h2">Files or Folders:</Typography>
                  {dataSelector?.selectionDataPasswords?.map((item, index) => {
                    return (
                      <MUI.DoneItem key={index}>
                        <Typography component="p">
                          {index + 1}. {limitContent(item.name + 30, 15)}(
                          {getFileType(item.name)})
                        </Typography>
                      </MUI.DoneItem>
                    );
                  })}
                </MUI.DoneItemContainer>
              </MUI.DoneWrapperContainer>

              <MUI.DoneAction>
                <Button type="button" variant="outlined" onClick={handleCopy}>
                  {copyLoading ? (
                    <Loader size={20} />
                  ) : isCopy ? (
                    <DownloadDoneIcon sx={{ fontSize: "16px" }} />
                  ) : (
                    <ContentCopy sx={{ fontSize: "18px" }} />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleDownloadPasswordAsImage}
                >
                  Download
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="greyTheme"
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
              </MUI.DoneAction>
            </Fragment>
          )}
        </Box>
      </BaseDialogV1>
    </Fragment>
  );
}

export default DialogCreateMultipleFilePassword;
