import { useMutation } from "@apollo/client";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import {
  Alert,
  AlertTitle,
  AvatarGroup,
  Box,
  Button,
  CardActions,
  createTheme,
  Divider,
  IconButton,
  styled,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { MUTATION_CREATE_SHARE } from "api/graphql/share.graphql";
import Loader from "components/Loader";
import ActionCreateShare from "components/share/ActionCreateShare";
import ActionShareStatus from "components/share/ActionShareStatus";
import { ENV_KEYS } from "constants/env.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useLockedFile } from "hooks/file/useLockedFile";
import useGetUrl from "hooks/url/useGetUrl";
import React from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { IFileTypes } from "types/filesType";
import { IUserToAccountTypes } from "types/shareTypes";
import { IUserTypes } from "types/userType";
import { errorMessage, successMessage } from "utils/alert.util";
import { base64Encode } from "utils/base64.util";
import { cutStringWithEllipsis } from "utils/string.util";
import { isValidEmail } from "utils/validateEmail";
import ActionPreviewCreateShare from "components/share/ActionPreviewShare";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
const theme = createTheme();

const TextInputdShare = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  margin: "10px 0px",
  [theme.breakpoints.down("sm")]: {
    display: "column",
    flexDirection: "column",
  },
}));

interface fileTypes {
  data: IFileTypes;
  user: IUserTypes;
  propsStatus: string;
}

export default function SharePrevieFile({
  user,
  data,
  propsStatus,
}: fileTypes) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [message, setMessage] = React.useState<string>("");
  const [statusShare, setStatusShare] = React.useState("view");
  const [shareAccount, setShareAccount] = React.useState<string>("");
  const [checkAlert, setcheckAlert] = React.useState<boolean>(false);
  const [shareAccountList, setShareAccountList] = React.useState<
    IUserToAccountTypes[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { setIsAutoClose } = useMenuDropdownState();

  const [isVisibleAccount, setIsVisibleAccount] =
    React.useState<boolean>(false);
  const totalHandleUrl = useGetUrl(data);
  const encodeKey = ENV_KEYS.VITE_APP_ENCODE_KEY;

  const [accessStatusShare, setAccessStatusShare] =
    React.useState<string>("public");
  const [getURL, setGetURL] = React.useState("");
  const [copied, setCoppied] = React.useState(false);
  const [createShare] = useMutation(MUTATION_CREATE_SHARE);
  const isSmallMobile = useMediaQuery("(max-width:350px)");
  const profileUrl = ENV_KEYS.VITE_APP_LOAD_URL + "preview?path=";

  const handleStatus = async (data: string) => {
    setStatusShare(data);
    setIsAutoClose(true);
  };

  React.useEffect(() => {
    let createdById = "";
    let fileId = "";
    const ownerData =
      propsStatus !== "share" ? data?.createdBy?._id : data.ownerId._id;
    const newNameData = data?.createdBy?.newName;

    fileId = base64Encode(
      {
        _id: propsStatus !== "share" ? data?._id : data.fileId._id,
        type: "file",
      },
      encodeKey,
    );

    createdById = base64Encode(ownerData, encodeKey);
    const baseURL = `${fileId}-${createdById}-${newNameData}`;
    const params = new URLSearchParams();
    params.set("lc", baseURL);
    let getVshareUrl: string;
    if (accessStatusShare === "private") {
      const url = new URL(ENV_KEYS.VITE_APP_VSHARE_URL_PRIVATE);
      url.search = params.toString();
      getVshareUrl = url.toString();
      setGetURL(getVshareUrl);
    } else {
      setGetURL(
        propsStatus !== "share" ? data?.shortUrl : data.fileId?.shortUrl,
      );
    }
  }, [data, user, accessStatusShare]);

  const handleIsGlobal = async (data: any) => {
    setAccessStatusShare(data);
    setIsAutoClose(true);
  };
  async function copyTextToClipboard(text: string) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }
  const handleGetFolderLink = async () => {
    copyTextToClipboard(getURL)
      .then(() => {
        totalHandleUrl?.(data);
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
  const handSubmit = async () => {
    if (!shareAccount) {
      setMessage("Please enter email");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }

    const isInvalidEmail = isValidEmail(shareAccount);
    if (!isInvalidEmail) {
      errorMessage("Email is invalid", 2000);
      return;
    }

    try {
      setIsSubmitting(true);
      await createShare({
        variables: {
          body: {
            fileId: data?._id,
            isPublic: accessStatusShare,
            permission: statusShare,
            toAccount: shareAccount,
          },
        },
      });
      setIsAutoClose(true);
      setShareAccount("");
      setIsSubmitting(false);
      successMessage("Shared file successful", 3000);
    } catch (error: any) {
      setIsSubmitting(false);
      errorMessage("Share someting wrong", 1000);
    }
  };

  const manageUserFromShare = useManageUserFromShare({
    inputFileOrFolder: data,
    inputType: data.fileType,
    user,
  });

  React.useEffect(() => {
    setShareAccountList(manageUserFromShare.sharedUserList);
  }, [manageUserFromShare.sharedUserList]);

  const handleChangeUserPermissionFromShare = async (
    id: string,
    permission: string,
  ) => {
    const seletedAccount = shareAccountList.filter((data) => data._id == id);

    if (seletedAccount) {
      seletedAccount[0]._permission = permission;
      await manageUserFromShare.handleChangedUserFromShareOnSave(
        seletedAccount,
        {
          onSuccess: () => {
            successMessage(
              "Changed user permission of share successful!!",
              3000,
            );
          },
          onFailed: (error: any) => {
            errorMessage(error, 3000);
          },
        },
      );
      setShareAccountList((prevList) =>
        prevList.map((item) =>
          item._id === id ? { ...item, permission: permission } : item,
        ),
      );
    }
  };

  const handleDeletedUserFromShareOnSave = async (id: string) => {
    const seletedAccount = shareAccountList.filter((data) => data._id == id);
    if (seletedAccount) {
      await manageUserFromShare.handleDeletedUserFromShareOnSave(
        seletedAccount,
        {
          onSuccess: () => {
            successMessage("Deleted user out of share successful!!", 3000);
            setShareAccountList((prevList) =>
              prevList.filter((item) => item._id !== id),
            );
          },
          onFailed: (error: any) => {
            errorMessage(error, 3000);
          },
        },
      );
    }
  };

  return (
    <Box
      sx={{
        overflowY: "scroll",
        maxHeight: "90vh",
        paddingBottom: "2rem",
        [theme.breakpoints.down("sm")]: {
          paddingBottom: "4rem",
          maxHeight: "60vh",
        },
      }}
    >
      <Box
        sx={{
          margin: "30px 30px 20px 20px",
          [theme.breakpoints.down("sm")]: {
            margin: "30px 20px 10px 20px",
          },
        }}
      >
        <Typography
          sx={{
            mb: isMobile ? "1px" : "4px",
          }}
          fontSize={isMobile ? "0.8rem" : "1rem"}
          variant="h6"
        >
          Share &nbsp;
          {cutStringWithEllipsis(
            propsStatus !== "share" ? data.filename : data.fileId.filename,
            isMobile ? 35 : 30,
          )}
          "
        </Typography>

        <Box sx={{ mt: 5 }}>
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

        <TextField
          autoFocus
          size="small"
          type="text"
          fullWidth
          variant="outlined"
          value={accessStatusShare === "public" ? getURL || "" : ""}
          disabled={accessStatusShare === "private" ? true : false}
          sx={{ userSelect: "none", mt: 2, mb: 2, fontSize: "12px" }}
        />

        <Box sx={{ mt: 2, mb: 2, display: "flex", gap: 5 }}>
          <Button
            variant="outlined"
            disabled={accessStatusShare === "private" || copied ? true : false}
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
          <ActionShareStatus
            isglobals={accessStatusShare}
            _handleIsGlobal={handleIsGlobal}
          />
        </Box>
        {accessStatusShare !== "private" && checkAlert && (
          <Alert sx={{ mt: 3, boxShadow: theme.shadows[2] }} severity="error">
            Your information will be shared privately
          </Alert>
        )}
        <Box sx={{ mt: 3}}>
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
            <TextField
              autoFocus
              size="medium"
              type="text"
              fullWidth
              variant="outlined"
              placeholder="example@gmail.com"
              required={true}
              value={shareAccount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const checkIsEmail = event.target.value.endsWith(".com");
                console.log(checkIsEmail);
                if (checkIsEmail) {
                  setcheckAlert(true);
                } else {
                  setcheckAlert(false);
                }
                setShareAccount(event.target.value);
              }}
            />
            {accessStatusShare === "private" && (
              <ActionCreateShare
                accessStatusShare={accessStatusShare}
                statusshare={statusShare}
                handleStatus={handleStatus}
              />
            )}
          </TextInputdShare>
          {message && (
            <Typography
              variant="h6"
              sx={{
                color: "#e53935",
                fontSize: "12px",
              }}
            >
              {message}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 5 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth={isMobile ? true : false}
            onClick={handSubmit}
            disabled={accessStatusShare == "private" ? false : true}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </Box>

        <Box sx={{ py: 4, mt: 5 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6">Who has access</Typography>
          <Typography component="p">
            By &nbsp;
            {propsStatus !== "share"
              ? data.createdBy?.email
              : data.ownerId.email}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
            }}
          >
            {isVisibleAccount ? (
              "See Less..."
            ) : (
              <AvatarGroup max={4}>
                {shareAccountList.map((shared, index) => {
                  const sourcePath =
                    shared.toAccount.newName +
                    "-" +
                    shared.toAccount._id +
                    `/${ENV_KEYS.VITE_APP_ZONE_PROFILE}/`;
                  return (
                    <Avatar
                      sx={{ cursor: "pointer" }}
                      key={index}
                      alt={shared.toAccount.firstName}
                      src={profileUrl + sourcePath + shared.toAccount.profile}
                      onClick={() => setIsVisibleAccount(!isVisibleAccount)}
                    />
                  );
                })}
              </AvatarGroup>
            )}

            {shareAccountList.length > 0 && (
              <Box>
                {isVisibleAccount ? (
                  <ExpandLessIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsVisibleAccount(!isVisibleAccount)}
                  />
                ) : (
                  <ExpandMoreIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsVisibleAccount(!isVisibleAccount)}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
        {isVisibleAccount && (
          <Box>
            {shareAccountList.map((user) => {
              return (
                <Box
                  key={user.toAccount._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{ cursor: "pointer" }}
                      alt={user.toAccount.firstName}
                      src={
                        profileUrl +
                        user.toAccount.newName +
                        "-" +
                        user.toAccount._id +
                        `/${ENV_KEYS.VITE_APP_ZONE_PROFILE}/` +
                        user.toAccount.profile
                      }
                    />
                    <Typography>
                      {cutStringWithEllipsis(user.toAccount.email, 20)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ActionPreviewCreateShare
                      accessStatusShare={"private"}
                      statusshare={user.permission}
                      handleStatus={(val) => {
                        setIsAutoClose(true);
                        handleChangeUserPermissionFromShare(user._id, val);
                      }}
                    />

                    <HiOutlineTrash
                      size={18}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeletedUserFromShareOnSave(user._id)}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
