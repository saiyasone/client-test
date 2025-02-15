import React, { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Typography,
  TextField,
  Grid,
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
import { removeFileNameOutOfPath } from "utils/file.util";
import { errorMessage, successMessage } from "utils/alert.util";
import QRCode from "react-qr-code";
import {
  handleDownloadQRCode,
  handleShareQR,
} from "utils/image.share.download";
import { IoMdClose } from "react-icons/io";
import {
  BURN_ONE_TIME_LINK,
  CREATE_ONE_TIME_LINK,
  GET_MANAGE_LINKS,
} from "api/graphql/onetimelink.graphql";
import { useLazyQuery, useMutation } from "@apollo/client";
import DialogBackendVerifyPassword from "./DialogBackendVerifyPassword";
import DialogShare from "./DialogShare.SocialMedia";
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
    width: '100%',
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
  password: string;
}

const DialogOneTimeLink = (props) => {
  const { user }: any = useAuth();
  const { onClose, onCreate, data } = props;
  const qrCodeRef = useRef<SVGSVGElement | any>(null);
  const [burnLinkId, setBurnLinkId] = useState("");
  const [password, setPassword] = useState("");
  const [openConfirmPWD, setOpenConfirmPWD] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [generatedLink, setGeneratedLink] = useState({
    shortLink:'',
    longLink:''
  });
  const [isShared, setIsShared] = useState(false);

  const [createOneTimeLink] = useMutation(CREATE_ONE_TIME_LINK);
  const [getManageLinks] = useLazyQuery(GET_MANAGE_LINKS);
  const [burnOneTimeLink] = useLazyQuery(BURN_ONE_TIME_LINK);

  const resetGenerateLink = () => {
    setGeneratedLink({
      shortLink:'',
      longLink:''
    });
  }
  const resetAll = () => {
    setBurnLinkId("");
    setPassword("");
    setOpenConfirmPWD(false);
    setFolders([]);
    setFiles([]);
    setStep(1);
    resetGenerateLink();
    setIsShared(false);
    ////close the modal anyway.
    onClose();
  };

  const handleGenerate = async () => {

    const data: apiProps[] = [];

    if (folders && folders?.length > 0) {
      folders.map((folder) =>
        data.push({
          type: "folder",
          folderId: folder?._id || folder?.id,
          password: password,
        }),
      );
    }

    if (files && files?.length > 0) {
      files.map((file) =>
        data.push({
          type: "file",
          fileId: file?._id || file?.id,
          password: password,
        }),
      );
    }

    if (!data || data?.length < 1) {
      errorMessage("Please, can not get source to create Url.", 3000);
      return false;
    }

    return await createOneTimeLink({
      variables: {
        input: {
          password,
          data,
        },
      },
      onCompleted: (result) => {
        if (result && result?.createOneTimeLink?.longLink) {
          setGeneratedLink({
            shortLink: result?.createOneTimeLink?.shortLink,
            longLink: result?.createOneTimeLink?.longLink
          });
          setBurnLinkId(result?.createOneTimeLink?._id);
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

  const handleBurnLink = async () => {
    if (!burnLinkId) {
      errorMessage("Not found reference to burn this secret Url.", 3000);
      return false;
    }

    if (!confirm("Do you want to burn this secret Url?")) {
      return false;
    }

    return await getManageLinks({
      variables: {
        where: {
          _id: burnLinkId,
          status: "active",
        },
      },
      onCompleted: (response) => {
        if (response && response?.getManageLinks?.data[0]) {
          const result = response?.getManageLinks?.data[0];
          if (result?.password) {
            setOpenConfirmPWD(true);
          } else {
            handleCompletedBurnLink();
          }
        }
      },
      onError: (error) => {
        console.log(error);
        errorMessage(error?.message || "Can not burn this secret Url.", 3000);
        setOpenConfirmPWD(false);
        return false;
      },
    });
  };

  const handleConfirmPassword = async (confirmPassword: string) => {
    if (!confirmPassword) {
      return;
    }

    await handleCompletedBurnLink(confirmPassword);
  };

  const handleCompletedBurnLink = async (password: string = "") => {
    if (!burnLinkId) {
      return false;
    }

    return await burnOneTimeLink({
      variables: {
        where: {
          ...(password && { password }),
          _id: burnLinkId,
        },
      },
      onCompleted: (response) => {
        if (
          response &&
          response?.getOneTimeLinkDetails?.message === "Success" &&
          response?.getOneTimeLinkDetails?.code === "200"
        ) {
          successMessage("The secret Url burn successfully!", 3000);
          setTimeout(() => {
            resetAll();
          }, 1000);
          return true;
        }

        errorMessage(
          response?.getOneTimeLinkDetails?.message || "Something went wrong!",
          3000,
        );

        return false;
      },
      onError: (error) => {
        errorMessage(
          error?.message || "Burning the secret Url is incompleted",
          3000,
        );
        return false;
      },
    });
  };

  const handleSubmit = () => {
    handleCopy(generatedLink.shortLink);
    resetGenerateLink();
    setBurnLinkId("");
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
        if (value && (value?.folder_type || value?.checkType) === "folder") {
          setFolders((prevFolders) => [...prevFolders, value]);
        } else {
          setFiles((prevFiles) => [...prevFiles, value]);
        }
      });
    } else {
      if (data && (data?.folder_type || data?.checkType) === "folder") {
        setFolders((prevFolders) => [...prevFolders, data]);
      } else {
        setFiles((prevFiles) => [...prevFiles, data]);
      }
    }
  }, [data]);

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
                  Paste a password, secret message or private link below
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
                                {item?.name || item?.filename?.length <= 15
                                  ? item?.name || item?.filename
                                  : item?.name?.substring(0, 9) ||
                                    item?.filename?.substring(0, 9) +
                                      "..." +
                                      item?.name ||
                                    item?.filename?.substring(
                                      item?.name || item?.filename?.length - 6,
                                      item?.name || item?.filename?.length,
                                    )}
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
                    md={7}
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
                    md={5}
                    sx={{ paddingLeft: { md: 5, lg: 7 } }}
                  >
                    <ButtonContainer
                    type="button"
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => handleGenerate()}
                    style={{marginTop: '38px', width:'100%'}}
                    disabled={
                      !(
                        (folders && folders?.length > 0) ||
                        (files && files?.length > 0)
                      )
                    }
                  >
                    Generate secret link Url
                  </ButtonContainer>
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
                  <Typography>* Please, keep your URL in secure!</Typography>
                </Box>
            </Typography>
          ) : (
            <Box>
              <Typography
                variant="h6"
                sx={{ width: "100%", mb: 4, textAlign: "center" }}
              >
                Your Onetime Secret URL
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
              {/* <Divider sx={{ marginY: 2 }} /> */}
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
                    border: "1px solid gray",
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
                  pt: 4,
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
                <Divider sx={{ color: "#aaa", my: 2}}>Or</Divider>
                <ButtonContainer
                  variant="outlined"
                  color="error"
                  onClick={handleBurnLink}
                  sx={{ width: "100%", mt: 2 }}
                >
                  Burn this Secret URL
                </ButtonContainer>
                
                <Box sx={{mt: 4, textAlign:'center'}}>
                  * Burning this secret will delete it before it has been read
                  (click to cofnirm).
                </Box>
              </Box>
            </Box>
          )}
          {openConfirmPWD && (
            <DialogBackendVerifyPassword
              isOpen={openConfirmPWD}
              onClose={() => setOpenConfirmPWD(false)}
              onConfirm={handleConfirmPassword}
              OneTimeUrl={generatedLink.shortLink}
            />
          )}
        </Box>
      </BaseDialogV1>
    </React.Fragment>
  );
};

export default DialogOneTimeLink;
