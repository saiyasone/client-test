import React, { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Select,
  MenuItem,
  styled,
  createTheme,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import BaseDialogV1 from "components/BaseDialogV1";
import useAuth from "hooks/useAuth";
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
import { convertBytetoMBandGB } from "utils/storage.util";
import ImageComponent from "components/getImage";
import { cutFileName, removeFileNameOutOfPath } from "utils/file.util";
import { errorMessage, successMessage } from "utils/alert.util";
import moment from "moment";
import QRCode from "react-qr-code";
import {
  handleDownloadQRCode,
  handleShareQR,
} from "utils/image.share.download";
import DialogShare from "./DialogShare.SocialMedia";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@apollo/client";
import { calculateExpirationDate } from "utils/date.util";
import { CREATE_MANAGE_LINK } from "api/graphql/getlink.graphsql";
import { LuCopy } from "react-icons/lu";
const theme = createTheme();

export const ButtonLoadingContainer = styled(LoadingButton)({
  padding: "0.3rem",
  fontSize: "14px",
  marginBottom: "1rem",
  borderRadius: "2rem",
  background: "#17766B",
  width: "70%",
  [theme.breakpoints.down("sm")]: {
    padding: "0.2rem",
  },
});
export const ButtonContainer = styled(Button)({
  fontSize: "14px",
  marginBottom: "1rem",
  padding: ".4rem 1rem",
  borderRadius: ".2rem",
  [theme.breakpoints.down("sm")]: {
    padding: "0.2rem",
  },
});

const IconFolderContainer = styled(Box)({
  width: "30px",
});

interface apiProps {
  type: string;
  folderId?: string | number;
  fileId?: string | number;
  expiredAt: string;
  password: string;
}

const DialogOneTimeLink = (props) => {
  const { user }: any = useAuth();
  const { onClose, onCreate, data } = props;
  const qrCodeRef = useRef<SVGSVGElement | any>(null);
  const [expireDays, setExpireDays] = useState(0);
  const [expiredAt, setExpiredAt] = useState("");
  const [password, setPassword] = useState("");
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [generatedLink, setGeneratedLink] = useState({
    shortLink:'',
    longLink:''
  });
  const [isShared, setIsShared] = useState(false);

  const [createManageLink] = useMutation(CREATE_MANAGE_LINK);

  const resetGenerateLink = () => {
    setGeneratedLink({
      shortLink:'',
      longLink:''
    });
  }

  const resetAll = () => {
    setExpireDays(7);
    setExpiredAt("");
    setPassword("");
    setFolders([]);
    setFiles([]);
    setStep(1);
    resetGenerateLink();
    setIsShared(false);
    ////close the modal anyway.
    onClose();
  };

  const handleSelectItemChange = (e) => {
    if (!e || !e?.target?.value) {
      return;
    }

    const days = Number(e?.target?.value);
    
    const expirationDateTime = calculateExpirationDate(days);

    setExpiredAt(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
    setExpireDays(days);
  };

  const handleGenerate = async () => {
    const data: apiProps[] = [];

    if (folders && folders?.length > 0) {
      folders.map((folder) =>
        data.push({
          type: "folder",
          folderId: folder?._id || folder?.id,
          expiredAt,
          password,
        }),
      );
    }

    if (files && files?.length > 0) {
      files.map((file) =>
        data.push({
          type: "file",
          fileId: file?._id || file?.id,
          expiredAt,
          password,
        }),
      );
    }

    if (!data || data?.length < 1) {
      errorMessage("Please, can not get source to create Url.", 3000);
      return false;
    }
    return await createManageLink({
      variables: {
        input: [...data],
      },
      onCompleted: (result) => {
        if (result && result?.createManageLink?.longLink) {
          setGeneratedLink({
            shortLink: result?.createManageLink?.shortLink,
            longLink: result?.createManageLink?.longLink
          });
          setStep(2);
        }
        return true;
      },
      onError: (error) => {
        errorMessage(error?.message || "Can not create link", 3000);
        return false;
      },
    });
  };

  const handleSubmit = () => {
    handleCopy(generatedLink.shortLink);
    resetGenerateLink();
    setExpiredAt("");
    setExpireDays(7);
    setStep(1);
    onCreate();
  };

  async function copyTextToClipboard(link: string) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(link);
    } else {
      return document.execCommand("copy", true, link);
    }
  }

  const handleCopy = (link: string) => {
    copyTextToClipboard(link)
      .then(() => {
        successMessage("Link is copied!", 2000);
      })
      .catch((err: any) => {
        errorMessage(err, 3000);
      });
  };

  useEffect(() => {
    setFiles([]);
    setFolders([]);

    if (Array.isArray(data)) {
      data.forEach((value) => {
        if (
          (value && (value?.folder_type || value?.checkType) === "folder") ||
          value?.folderId?._id
        ) {
          if (value?.folderId?._id) {
            const validValue = value?.folderId;
            setFolders((prevFolders) => [...prevFolders, validValue]);
          } else {
            setFolders((prevFolders) => [...prevFolders, value]);
          }
        } else {
          if (value?.fileId?._id) {
            const validValue = value?.fileId;
            setFiles((prevFiles) => [...prevFiles, validValue]);
          } else {
            setFiles((prevFiles) => [...prevFiles, value]);
          }
        }
      });
    } else {
      if (
        (data && (data?.folder_type || data?.checkType) === "folder") ||
        data?.folderId?._id
      ) {
        if (data?.folderId?._id) {
          const validValue = data?.folderId;
          setFolders((prevFolders) => [...prevFolders, validValue]);
        } else {
          setFolders((prevFolders) => [...prevFolders, data]);
        }
      } else {
        if (data?.fileId?._id) {
          const validValue = data?.fileId;
          setFiles((prevFiles) => [...prevFiles, validValue]);
        } else {
          setFiles((prevFiles) => [...prevFiles, data]);
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (expireDays) {
      const expirationDateTime = calculateExpirationDate(expireDays);
      setExpiredAt(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
    }
  }, [expireDays, expiredAt]);

  return (
    <React.Fragment>
      <BaseDialogV1
        {...props}
        dialogProps={{
          PaperProps: {
            sx: {
              overflowY: "initial",
              maxWidth: "650px",
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
        disableOnClose={true}
        onClose={resetAll}
      >
        <IconButton
          onClick={() => onClose()}
          sx={{ position: "absolute", right: 0, top: 0 }}
        >
          <IoMdClose />
        </IconButton>
        <Box
          style={{
            padding: 15,
            margin: "15px",
            borderRadius: "10%",
            border: 2,
          }}
        >
          {step === 1 ? (
            <Typography component={"div"} sx={{ borderRadius: "5px" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingY: 3,
                }}
              >
                <Typography variant="h6">
                  Paste a password, secret message or private key below
                </Typography>
                <Typography
                  component={"p"}
                  sx={{ opacity: "90%", fontSize: 14, mt: 2 }}
                >
                  Keep sensitive info out of your email and chat logs
                </Typography>
              </Box>
              {((files && files?.length > 0) ||
                (folders && folders?.length > 0)) && (
                <Box
                  sx={{
                    border: "1px solid #d6d6d6",
                    borderRadius: "5px",
                    padding: 3,
                    marginY: 5,
                  }}
                >
                  {folders &&
                    folders?.length > 0 &&
                    folders.map(
                      (item, index) =>
                        item && (
                          <Box
                            key={index}
                            sx={{ height: "100%", width: "100%" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  columnGap: "6px",
                                }}
                              >
                                <IconFolderContainer>
                                  {(item?.total_size || item.totalSize!) > 0 ? (
                                    <FolderNotEmptyIcon />
                                  ) : (
                                    <FolderEmptyIcon />
                                  )}
                                </IconFolderContainer>
                                {item?.folder_name ||
                                  item?.name ||
                                  item?.newFilename ||
                                  item?._id}
                              </div>
                              <Typography>
                                {convertBytetoMBandGB(
                                  item?.total_size || item.totalSize!,
                                )}
                              </Typography>
                            </Box>

                            {folders?.length > 1 &&
                              index + 1 < folders?.length && <Divider />}
                          </Box>
                        ),
                    )}
                  {files &&
                    files.length > 0 &&
                    files.map(
                      (item, index) =>
                        item && (
                          <Box
                            key={index}
                            sx={{ height: "100%", width: "100%" }}
                          >
                            {folders?.length > 1 &&
                              index + 1 < folders?.length && <Divider />}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  columnGap: "6px",
                                }}
                              >
                                <Box
                                  style={{
                                    width: "100px !important",
                                    height: "100px !important",
                                  }}
                                >
                                  <ImageComponent
                                    imagePath={
                                      user?.newName +
                                      "-" +
                                      user?._id +
                                      "/" +
                                      (item?.newPath
                                        ? removeFileNameOutOfPath(item?.newPath)
                                        : "") +
                                      "/" +
                                      item?.newFilename
                                    }
                                    fileType={item?.fileType}
                                  />
                                </Box>
                                {item.name
                                  ? cutFileName(item.name, 20)
                                  : cutFileName(item?.filename || "", 20)}
                              </div>
                              <Typography>
                                {convertBytetoMBandGB(
                                  item?.size || item.totalSize!,
                                )}
                              </Typography>
                            </Box>
                            {files?.length > 1 && index + 1 < files?.length && (
                              <Divider />
                            )}
                          </Box>
                        ),
                    )}
                </Box>
              )}
              <Grid container>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ paddingRight: { md: 5, lg: 7 } }}
                >
                  <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
                    Password
                  </Typography>
                  <TextField
                    type="password"
                    name="password"
                    label="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputLabelProps={{
                      style: {
                        color: "gray",
                        height: "35px",
                        minHeight: "35px",
                      },
                    }}
                    size={"small"}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "35px",
                      },
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ paddingLeft: { md: 5, lg: 7 } }}
                >
                  <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
                    Expire date
                  </Typography>
                  <Select
                    labelId="expiredAt"
                    id="expiredAt"
                    value={expireDays}
                    onChange={handleSelectItemChange}
                    fullWidth
                    style={{
                      height: "35px",
                      minHeight: "35px",
                      marginRight: "0.5rem",
                      width: "100%",
                    }}
                    defaultValue={7}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "35px",
                      },
                    }}
                  >
                    <MenuItem value={0}>1 Never</MenuItem>
                    <MenuItem value={-1}>1 days</MenuItem>
                    <MenuItem value={3}>3 days</MenuItem>
                    <MenuItem value={5}>5 days</MenuItem>
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={15}>15 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                  </Select>
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <ButtonLoadingContainer
                  type="button"
                  variant="contained"
                  color="success"
                  size="small"
                  fullWidth
                  onClick={() => handleGenerate()}
                  disabled={
                    !(
                      (folders && folders?.length > 0) ||
                      (files && files?.length > 0)
                    )
                  }
                >
                  Generate secret link Url
                </ButtonLoadingContainer>
                <Typography>* Please, keep your URL in secure!</Typography>
              </Box>
            </Typography>
          ) : (
            <Box>
              <Typography
                variant="h6"
                sx={{ width: "100%", mb: 4, textAlign: "center" }}
              >
                Keep Your Secret Url In Safe
              </Typography>
              <Typography component={'div'}
                sx={{
                  display:'flex',
                  alignContent:'center',
                  justifyContent:'space-between',
                  padding: "0.4rem 1rem",
                  fontWeight: 600,
                  backgroundColor: "#E9E9E9",
                  borderRadius:'3px',
                  mt: 5
                }}
              >
                {generatedLink.shortLink}
                <Box sx={{display:'inline-block', position:'relative', "&:hover":{cursor: "pointer", color: "#17766B"}}} onClick={() => handleCopy(generatedLink.shortLink)}>
                  <LuCopy fontSize={18} style={{position:'absolute', top:1, right: 0}}/>
                </Box>
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: {xs: 'column', md: 'row'},
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 5,
                  // border: "1px solid #d6d6d6",
                  borderRadius: "7px",
                  paddingY: 7,
                }}
              >
                <div
                  ref={qrCodeRef}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    // padding: "7px",
                    // border: "1px solid gray",
                    borderRadius: "7px",
                  }}
                >
                  <QRCode
                    style={{ width: "100px", height: "100px" }}
                    value={generatedLink.longLink}
                    viewBox={`0 0 256 256`}
                  />
                </div>
                <Box sx={{ display:'flex',flexDirection:'column',justifyContent: {xs:'center', md: 'space-between'},width:'100%', padding: 2, ml:{sm: 0, md: 15}}}>
                <Typography sx={{ mb: 4, alignSelf: {xs: 'center', md: 'start'} }}>
                    This link
                    <span style={{ color: "#2e7d32", margin: "0 4px" }}>
                      {generatedLink.shortLink}
                    </span>
                    will be expired on
                    <span style={{ color: "#2e7d32", margin: "0 5px" }}>
                      {expiredAt ? expiredAt : <span style={{fontWeight: 900}}>Never</span>}
                    </span>
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: {xs:'center', md: 'start'}, gap: 5, mt:4, position: "relative"}}>
                    <ButtonContainer
                      variant="contained"
                      onClick={(e) =>
                        handleDownloadQRCode(e, qrCodeRef, {
                          title: "Secret Url",
                          description:
                            "This link will be automatically expired",
                        })
                      }
                    >
                      Download
                    </ButtonContainer>
                    <ButtonContainer
                      variant="contained"
                      onClick={async (e) => {
                        if (isShared) {
                          setIsShared(false);
                        } else {
                          await handleShareQR(e, qrCodeRef, {
                            title: "Secret Url",
                            description:
                              "This link will be automatically expired",
                          });
                          setIsShared(!isShared);
                        }
                      }}
                    >
                      Share
                    </ButtonContainer>
                    {isShared && generatedLink.shortLink && (
                      <Typography
                        component={"div"}
                        sx={{
                          position: "absolute",
                          left: "30%",
                          top: 54,
                          zIndex: 9999,
                          transform: {
                            xs: "translateX(-60%)",
                            md: "none",
                          },
                          "@media (max-width: 600px)": {
                            maxWidth: "90vw",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsShared(!isShared);
                        }}
                      >
                        <DialogShare
                          onClose={() => setIsShared(!isShared)}
                          isOpen={isShared}
                          url={generatedLink.shortLink}
                        />
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 5,
                  // px: 7,
                  py: 4,
                  // border: "1px solid #d6d6d6",
                  borderRadius: "7px",
                }}
              >
                <ButtonContainer
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ width: "100%", mt: 2 }}
                >
                  Finish
                </ButtonContainer>
                <Box sx={{mt: 4, textAlign:'center'}}>
                  * Share this secret Url to trust people who may access to this file.
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </BaseDialogV1>
    </React.Fragment>
  );
};

export default DialogOneTimeLink;
