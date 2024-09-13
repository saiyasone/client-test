import { useMutation } from "@apollo/client";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Button,
  InputAdornment,
  TextField,
  Typography,
  styled,
  useMediaQuery,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { createTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import {
  MUTATION_CREATE_SHARE,
  MUTATION_CREATE_SHARE_FROM_SHARING,
} from "api/graphql/share.graphql";
import Loader from "components/Loader";
import NormalButton from "components/NormalButton";
import ActionCreateShare from "components/share/ActionCreateShare";
import ActionShareStatus from "components/share/ActionShareStatus";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useGetUrl from "hooks/url/useGetUrl";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { produce } from "immer";
import _ from "lodash";
import { MuiChipsInput } from "mui-chips-input";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import * as FaIcon from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import "styles/chipInput.style.css";
import * as MUI from "styles/dialog/dialogCreateShare.style";
import { errorMessage, successMessage } from "utils/alert.util";
import { base64Encode } from "utils/base64.util";
import { cutStringWithEllipsis } from "utils/string.util";

const theme = createTheme();
const TextFieldShare = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  margin: "0px 0px 40px 0px",
});
const ButtonGet = styled("div")({
  padding: "0 0 0 10px",
});
const ActionContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  margin: "50px 0px 30px 0px",
});
const TextInputdShare = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  margin: "10px 0px",
  [theme.breakpoints.down("sm")]: {
    display: "column",
    flexDirection: "column",
  },
}));

const BoxImage = styled("div")({
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  marginLeft: "-0.8rem",
  border: "3px solid #fff",
  background: "#F6F6F7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  h2: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#454554",
  },
});

const SharedUserProfileImage = (props) => {
  const [imageFound, setImageFound] = useState(true);
  const [showNotFoundImage, setShowNotFoundImage] = useState(false);

  const handleThumbnailImageError = () => {
    setImageFound(false);
  };

  const handleImageError = () => {
    setShowNotFoundImage(true);
  };

  return (
    <Typography
      component="div"
      className="user-profile"
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      {imageFound && props.thumbnailSrc ? (
        <Avatar
          onError={handleThumbnailImageError}
          src={props.thumbnailSrc}
          alt={props.title}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            borderRadius: "50%",
          }}
        />
      ) : (
        <>
          {showNotFoundImage ? (
            <Avatar
              alt={props.title}
              sx={{
                borderRadius: "50%",
              }}
            >
              {_.toUpper(_.first(props.title))}
            </Avatar>
          ) : (
            <>
              <Avatar
                src={props.src}
                onError={handleImageError}
                alt={props.title}
                sx={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: "50%",
                }}
              />
            </>
          )}
        </>
      )}
    </Typography>
  );
};

const DialogCreateShare = (props) => {
  const manageGraphqlError = useManageGraphqlError();
  const { open, data, onClose, share: propShare } = props;

  const share = useMemo(() => {
    return propShare || {};
  }, [propShare]);

  const { user }: any = useAuth();
  const [createShare] = useMutation(MUTATION_CREATE_SHARE);
  const [createShareFromSharing] = useMutation(
    MUTATION_CREATE_SHARE_FROM_SHARING,
  );
  const [statusShare, setStatusShare] = useState("view");
  const [accessStatusShare, setAccessStatusShare] = useState<string>("public");
  const [copied, setCoppied] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:350px)");
  const [getURL, setGetURL] = useState("");
  const { setIsAutoClose } = useMenuDropdownState();
  const [sharedSelectedUserList, setSharedSelectedUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const encodeKey = ENV_KEYS.VITE_APP_ENCODE_KEY;
  const newUrl = ENV_KEYS.VITE_APP_LOAD_URL + "preview?path=";
  const totalHandleUrl = useGetUrl(props?.data);

  const [sharedUserList, setSharedUserList] = useState<any[]>([]);

  useEffect(() => {
    setSharedUserList(
      props.sharedUserList?.map((data) => {
        const user = data.toAccount;
        return {
          ...data,
          toAccount: {
            ...user,
            title: `${user.firstName} ${user.lastName}`,
            src:
              user?.newName +
              "-" +
              user?._id +
              "/" +
              ENV_KEYS.VITE_APP_ZONE_PROFILE +
              "/" +
              user?.profile,
          },
          _isDeleted: false,
          _permission: data.permission,
        };
      }) || [],
    );
  }, [props.sharedUserList]);

  const changedSharedUserList =
    sharedUserList.length > 3 ? sharedUserList.slice(0, 3) : sharedUserList;

  const isValidEmail = (data) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(data);
  };

  const handleChange = (val) => {
    const sharedUserVal = val[sharedSelectedUserList.length];
    if (sharedUserVal) {
      if (isValidEmail(sharedUserVal)) {
        setSharedSelectedUserList(val);
      }
    } else {
      setSharedSelectedUserList(val);
    }
  };

  useEffect(() => {
    let createdById = "";
    let fileId = "";

    const dataType =
      data?.folder_type || data?.folderId?._id ? "folder" : "file";
    const ownerData = data?.createdBy?._id || data?.ownerId?._id;
    const newNameData = data?.createdBy?.newName || data?.ownerId?.newName;

    fileId = base64Encode(
      {
        _id: data?._id,
        type: dataType,
      },
      encodeKey,
    );

    createdById = base64Encode(ownerData, encodeKey);

    const baseURL = `${fileId}-${createdById}-${newNameData}`;

    const params = new URLSearchParams();
    params.set("lc", baseURL);

    let getVshareUrl;
    if (accessStatusShare === "private") {
      getVshareUrl = new URL(ENV_KEYS.VITE_APP_VSHARE_URL_PRIVATE);
      getVshareUrl.search = params.toString();
      setGetURL(getVshareUrl);
    } else {
      // getVshareUrl = new URL(ENV_KEYS.VITE_APP_DOWNLOAD_URL_SERVER);
      setGetURL(data?.shortUrl);
    }
  }, [data, user, accessStatusShare]);

  const handleShareStatus = async () => {
    try {
      if (sharedSelectedUserList.length > 0) {
        setSendLoading(true);
        if (
          data?.folder_type === "folder" ||
          data?.checkTypeItem === "folder"
        ) {
          let shareCount = 0;
          for (let i = 0; i < sharedSelectedUserList.length; i++) {
            if (share.isFromShare) {
              shareCount += 1;
              await createShareFromSharing({
                variables: {
                  body: {
                    permission: statusShare,
                    toAccount: sharedSelectedUserList[i],
                    shareId: share._id,
                  },
                },
              });
            } else {
              shareCount += 1;
              await createShare({
                variables: {
                  body: {
                    folderId: data?._id,
                    isPublic: accessStatusShare,
                    permission: statusShare,
                    toAccount: sharedSelectedUserList[i],
                  },
                },
              });
            }
          }
          if (shareCount === sharedSelectedUserList.length) {
            successMessage("Shared folder successful", 3000);
            eventUploadTrigger.trigger();
            onClose();
          }
        } else {
          let shareCount = 0;
          for (let i = 0; i < sharedSelectedUserList.length; i++) {
            if (share.isFromShare) {
              shareCount += 1;
              await createShareFromSharing({
                variables: {
                  body: {
                    permission: statusShare,
                    toAccount: sharedSelectedUserList[i],
                    shareId: share._id,
                  },
                },
              });
            } else {
              shareCount += 1;
              await createShare({
                variables: {
                  body: {
                    fileId: data?._id,
                    isPublic: accessStatusShare,
                    permission: statusShare,
                    toAccount: sharedSelectedUserList[i],
                  },
                },
              });
            }
          }
          if (shareCount === sharedSelectedUserList.length) {
            setIsAutoClose(true);
            onClose();
            successMessage("Shared file successful", 3000);
            eventUploadTrigger.trigger();
          }
        }
      } else {
        onClose();
      }
    } catch (error: any) {
      setSendLoading(false);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    } finally {
      setSendLoading(false);
    }
  };

  async function copyTextToClipboard(text) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  // get link
  const handleGetFolderLink = async () => {
    copyTextToClipboard(getURL)
      .then(() => {
        totalHandleUrl?.(props?.data);
        setLoading(true);
        setCoppied(true);
      })
      .catch((err) => {
        errorMessage(err, 2000);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 400);
      });
  };

  // status share
  const handleStatus = async (data) => {
    setStatusShare(data);
    setIsAutoClose(true);
  };

  const handleIsGlobal = async (data) => {
    setAccessStatusShare(data);
    setIsAutoClose(true);
  };

  const handleSelecteDeletedUserFromShare = (id) => {
    setSharedUserList(
      produce((draftState) => {
        const personToUpdate: any = draftState.find((item) => item._id === id);
        if (personToUpdate) {
          personToUpdate._isDeleted = !personToUpdate._isDeleted;
        }
      }),
    );
  };

  const handleChangeUserPermissionFromShare = (id, permission) => {
    setSharedUserList(
      produce((draftState) => {
        const personToUpdate: any = draftState.find((item) => item._id === id);
        if (personToUpdate) {
          personToUpdate._permission = permission;
        }
      }),
    );
  };

  const handleSelectedDeletedUserFromShareOnSave = () => {
    props.onDeletedUserFromShareSave(
      sharedUserList.filter((data) => data._isDeleted),
    );

    props.onChangedUserPermissionFromShareSave?.(
      sharedUserList.filter((data) => data._permission !== data.permission),
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      fullWidth={true}
      PaperProps={{
        sx: {
          overflowX: "hidden",
          overFlowY: "hidden",
        },
      }}
    >
      <Box
        sx={{
          [theme.breakpoints.up("sm")]: {
            minWidth: "450px",
          },
        }}
      >
        {!showShared ? (
          <>
            <DialogContent
              sx={{
                overflowY: "initial",
              }}
            >
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {data?.folder_type === "folder" ||
                data?.checkTypeItem === "folder" ? (
                  <Typography
                    variant="h6"
                    fontSize={isMobile ? "0.8rem" : "1rem"}
                  >
                    Share "{data?.folder_name || data?.name}"
                  </Typography>
                ) : (
                  <Typography
                    variant="h6"
                    fontSize={isMobile ? "0.8rem" : "1rem"}
                  >
                    Share "
                    {cutStringWithEllipsis(
                      data?.filename || data?.name,
                      isMobile ? 20 : 50,
                    )}
                    "
                  </Typography>
                )}
                <NormalButton
                  onClick={() => {
                    setShowShared(true);
                  }}
                  sx={{
                    width: "auto",
                    height: "50px",
                  }}
                >
                  {sharedUserList.length > 0 ? (
                    <>
                      {changedSharedUserList.map((changedSharedUser, index) => {
                        return (
                          <Fragment key={index}>
                            <BoxImage>
                              <SharedUserProfileImage
                                {...{
                                  ...user,
                                  title: `${user.firstName} ${user.lastName}`,
                                  src:
                                    newUrl +
                                    changedSharedUser?.toAccount?.newName +
                                    "-" +
                                    changedSharedUser?.toAccount?._id +
                                    "/" +
                                    ENV_KEYS.VITE_APP_ZONE_PROFILE +
                                    "/" +
                                    changedSharedUser?.toAccount?.profile,
                                }}
                              />
                            </BoxImage>
                          </Fragment>
                        );
                      })}
                      {sharedUserList.length > 3 && (
                        <BoxImage>
                          <Typography variant="h2">
                            +
                            {sharedUserList.length -
                              changedSharedUserList.length}
                          </Typography>
                        </BoxImage>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </NormalButton>
              </Box>
            </DialogContent>

            <DialogContent>
              {accessStatusShare && (
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: 3,
                  }}
                >
                  General access
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <ActionShareStatus
                  isglobals={accessStatusShare}
                  _handleIsGlobal={handleIsGlobal}
                />

                <Typography
                  component="p"
                  sx={{
                    marginTop: isSmallMobile ? 2 : 0,
                    ml: 1,
                    fontSize: isSmallMobile ? "10px" : "12px",
                  }}
                >
                  {accessStatusShare === "public"
                    ? "(Anyone on the internet with the link can view)"
                    : "(Only people with access can open with the link)"}
                </Typography>
              </Box>
              <TextFieldShare>
                {isMobile ? (
                  <TextField
                    autoFocus
                    size="small"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={accessStatusShare === "public" ? getURL || "" : ""}
                    InputLabelProps={{
                      shrink: false,
                    }}
                    sx={{ userSelect: "none" }}
                    disabled={accessStatusShare === "private" ? true : false}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {loading ? (
                            <Loader size={16} />
                          ) : copied ? (
                            <DownloadDoneIcon
                              sx={{
                                color: "#17766B",
                                fontSize: "18px",
                              }}
                            />
                          ) : (
                            <ContentCopyIcon
                              /* disabled={
                                accessStatusShare === "private" || copied
                                  ? true
                                  : false
                              } */
                              onClick={handleGetFolderLink}
                            />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <TextField
                    autoFocus
                    size="small"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={accessStatusShare === "public" ? getURL || "" : ""}
                    disabled={accessStatusShare === "private" ? true : false}
                    sx={{ userSelect: "none" }}
                  />
                )}
                {!isMobile && (
                  <ButtonGet>
                    <Button
                      variant="outlined"
                      sx={{
                        minWidth: isSmallMobile ? "100px" : "120px",
                      }}
                      disabled={
                        accessStatusShare === "private" || copied ? true : false
                      }
                      onClick={handleGetFolderLink}
                    >
                      {loading ? (
                        <Loader size={22} />
                      ) : copied ? (
                        <DownloadDoneIcon
                          sx={{
                            color: "#17766B",
                            fontSize: "22px",
                          }}
                        />
                      ) : (
                        "Get Link"
                      )}
                    </Button>
                  </ButtonGet>
                )}
              </TextFieldShare>
              <Typography
                component="div"
                {...{
                  ...(accessStatusShare === "public" && {
                    sx: {
                      opacity: 0.7,
                    },
                  }),
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: isMobile ? "1px" : "4px",
                  }}
                  fontSize={isMobile ? "0.8rem" : "1rem"}
                >
                  Send the document via email
                </Typography>
                <TextInputdShare>
                  <MuiChipsInput
                    value={sharedSelectedUserList}
                    placeholder="Add user and Group"
                    fullWidth
                    {...{
                      ...(accessStatusShare === "private"
                        ? {
                            onChange: handleChange,
                          }
                        : {
                            disabled: true,
                          }),
                    }}
                  />

                  {sharedSelectedUserList.length > 0 && (
                    <ActionCreateShare
                      accessStatusShare={accessStatusShare}
                      statusshare={statusShare}
                      handleStatus={handleStatus}
                    />
                  )}
                </TextInputdShare>
              </Typography>

              <ActionContainer>
                <Button
                  sx={{
                    borderRadius: "6px",
                    padding: "8px 25px",
                  }}
                  type="button"
                  variant="contained"
                  color="greyTheme"
                  onClick={() => onClose()}
                >
                  Close
                </Button>
                <LoadingButton
                  sx={{
                    borderRadius: "6px",
                    padding: "8px 25px",
                  }}
                  type="button"
                  variant="contained"
                  loading={sendLoading}
                  color="primaryTheme"
                  {...{
                    ...(accessStatusShare === "private" &&
                    sharedSelectedUserList.length > 0
                      ? {
                          onClick: handleShareStatus,
                        }
                      : {
                          disabled: true,
                        }),
                  }}
                >
                  Send
                </LoadingButton>
              </ActionContainer>
            </DialogContent>
          </>
        ) : (
          <DialogContent>
            <MUI.ShareSelectHeader>
              <Typography variant="h2">Who has access</Typography>
              <Typography component="p">
                Owned by {data?.ownerId?.email}
              </Typography>
            </MUI.ShareSelectHeader>
            <MUI.ShareSelectOwnerContainer>
              <MUI.ShareProfileContainer>
                <MUI.ShareProfileImage>
                  <SharedUserProfileImage
                    {...{
                      ...user,
                      title: `${user.firstName} ${user.lastName}`,
                      src:
                        newUrl +
                        sharedUserList?.[0]?.ownerId?.newName +
                        "-" +
                        sharedUserList?.[0]?.ownerId?._id +
                        "/" +
                        ENV_KEYS.VITE_APP_ZONE_PROFILE +
                        "/" +
                        sharedUserList?.[0]?.ownerId?.profile,
                    }}
                  />
                </MUI.ShareProfileImage>

                <MUI.ShareProfileInfo>
                  <Typography variant="h2">
                    {_.startCase(
                      `${data?.ownerId?.firstName} ${data?.ownerId?.lastName}`,
                    )}
                  </Typography>
                  <Typography variant="h5">{data?.ownerId?.email}</Typography>
                </MUI.ShareProfileInfo>
              </MUI.ShareProfileContainer>
              <MUI.ShareProfileInfoList>
                <Typography variant="h2">
                  Share with {sharedUserList.length} accounts
                </Typography>

                {sharedUserList.map((sharedUser, index) => {
                  return (
                    <Box key={index} sx={{ margin: "0.6rem 0" }}>
                      <MUI.FlexBetween>
                        <MUI.ShareProfileContainer>
                          <MUI.ShareProfileImage>
                            <SharedUserProfileImage
                              {...{
                                ...user,
                                title: `${user.firstName} ${user.lastName}`,
                                src:
                                  newUrl +
                                  sharedUser?.toAccount?.newName +
                                  "-" +
                                  sharedUser?.toAccount?._id +
                                  "/" +
                                  ENV_KEYS.VITE_APP_ZONE_PROFILE +
                                  "/" +
                                  sharedUser?.toAccount?.profile,
                              }}
                            />
                          </MUI.ShareProfileImage>

                          <MUI.ShareProfileInfo>
                            <Typography variant="h3" sx={{ fontSize: "15px" }}>
                              {_.startCase(sharedUser?.toAccount?.title)}
                            </Typography>
                            <Typography variant="h5">
                              {sharedUser?.toAccount?.email}
                            </Typography>
                          </MUI.ShareProfileInfo>
                        </MUI.ShareProfileContainer>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            "& .menu-dropdown": {
                              height: "100%",
                            },
                          }}
                        >
                          {props.onChangedUserPermissionFromShareSave && (
                            <ActionCreateShare
                              accessStatusShare={"private"}
                              statusshare={sharedUser._permission}
                              handleStatus={(val) => {
                                setIsAutoClose(true);
                                handleChangeUserPermissionFromShare(
                                  sharedUser._id,
                                  val,
                                );
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              ml: 2,
                              position: "relative",
                              height: "100%",
                            }}
                          >
                            {sharedUser._isDeleted && (
                              <Typography
                                component="span"
                                sx={{
                                  color: "#3DC03C",
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  transform: "translate(40%,-40%)",
                                }}
                              >
                                <FaIcon.FaCheckCircle />
                              </Typography>
                            )}

                            <MUI.ButtonShare
                              sx={{
                                height: "100%",
                              }}
                              onClick={() =>
                                handleSelecteDeletedUserFromShare(
                                  sharedUser?._id,
                                )
                              }
                            >
                              <HiOutlineTrash
                                style={{ verticalAlign: "middle" }}
                              />
                            </MUI.ButtonShare>
                          </Box>
                        </Box>
                      </MUI.FlexBetween>
                    </Box>
                  );
                })}
              </MUI.ShareProfileInfoList>
            </MUI.ShareSelectOwnerContainer>

            <ActionContainer sx={{ justifyContent: "flex-end", gap: "1.5rem" }}>
              <Button
                sx={{
                  borderRadius: "6px",
                  padding: "8px 25px",
                }}
                type="button"
                variant="contained"
                color="greyTheme"
                onClick={() => {
                  setShowShared(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                sx={{
                  borderRadius: "6px",
                  padding: "8px 25px",
                }}
                onClick={handleSelectedDeletedUserFromShareOnSave}
                type="button"
                variant="contained"
                color="primaryTheme"
              >
                Save change
              </LoadingButton>
            </ActionContainer>
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

export default DialogCreateShare;
