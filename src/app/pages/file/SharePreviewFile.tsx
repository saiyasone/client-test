import { useMutation } from "@apollo/client";
import { Label, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  createTheme,
  Divider,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  styled,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import { MUTATION_UPDATE_FILE } from "api/graphql/file.graphql";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useLockedFile } from "hooks/file/useLockedFile";
import React from "react";
import { IFileTypes } from "types/filesType";
import { errorMessage, successMessage } from "utils/alert.util";
import Loader from "components/Loader";
import ActionShareStatus from "components/share/ActionShareStatus";
import useGetUrl from "hooks/url/useGetUrl";
import { base64Encode } from "utils/base64.util";
import { ENV_KEYS } from "constants/env.constant";
import { IUserTypes } from "types/userType";
import ActionCreateShare from "components/share/ActionCreateShare";
import { isValidEmail } from "utils/validateEmail";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { MUTATION_CREATE_SHARE } from "api/graphql/share.graphql";
import { set } from "lodash";
import { IUserToAccountTypes } from "types/shareTypes";
import useResizeImage from "hooks/useResizeImage";
const theme = createTheme();

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
interface fileTypes {
  data: IFileTypes;
  handleClose: () => void;
  user: IUserTypes;
  sharedUserList: IUserToAccountTypes[];
}

export default function SharePrevieFile({
  user,
  data,
  handleClose,
  sharedUserList,
}: fileTypes) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [message, setMessage] = React.useState<string>("");
  const [statusShare, setStatusShare] = React.useState("view");
  const [shareAccount, setShareAccount] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { createLockFile } = useLockedFile();
  const { setIsAutoClose } = useMenuDropdownState();
  const totalHandleUrl = useGetUrl(data);
  const encodeKey = ENV_KEYS.VITE_APP_ENCODE_KEY;

  const [accessStatusShare, setAccessStatusShare] =
    React.useState<string>("public");
  const [getURL, setGetURL] = React.useState("");
  const [copied, setCoppied] = React.useState(false);
  const [createShare] = useMutation(MUTATION_CREATE_SHARE);
  const isSmallMobile = useMediaQuery("(max-width:350px)");
  const handleStatus = async (data: string) => {
    setStatusShare(data);
    setIsAutoClose(true);
  };
  //   const resizeImage = useResizeImage({
  //     imagePath: `${data.newName}-${userAccount._id}/${ENV_KEYS.VITE_APP_ZONE_PROFILE}/${userAccount.profile}`,
  //     fileType: "image",
  //     user,
  //     height: 200,
  //     isPublic: false,
  //     width: 200,
  //   });
  React.useEffect(() => {
    let createdById = "";
    let fileId = "";
    const ownerData = data?.createdBy?._id;
    const newNameData = data?.createdBy?.newName;

    fileId = base64Encode(
      {
        _id: data?._id,
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
      setGetURL(data?.shortUrl);
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
      return; // Return early if no email is provided
    }

    const isInvalidEmail = isValidEmail(shareAccount);
    if (!isInvalidEmail) {
      errorMessage("Email is invalid", 2000);
      return; // Return early if the email is invalid
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
      setShareAccount("");
      setIsSubmitting(false);
      successMessage("Shared file successful", 3000);
    } catch (error: any) {
      setIsSubmitting(true);
      errorMessage("Share someting wrong", 1000);
    }
  };

  console.log(sharedUserList);

  return (
    <>
      <Box
        sx={{
          margin: "30px 30px 20px 20px",
          [theme.breakpoints.down("sm")]: {
            margin: "30px 20px 20px 20px",
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
          Share "{data.filename}"
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
        <Box sx={{ mt: 5 }}>
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
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setShareAccount(event.target.value)
              }
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
          <Typography component="p">By {data.createdBy?.email}</Typography>

          <Box sx={{ display: "flex", mt: 3 }}>
            <AvatarGroup max={4}>
              {sharedUserList.map((shared, index) => {
                const image = `${shared.toAccount.newName}-${shared.toAccount._id}/${ENV_KEYS.VITE_APP_ZONE_PROFILE}/${shared.toAccount.profile}`;
                return (
                  <Avatar
                    key={index}
                    alt={shared.toAccount.firstName}
                    src={image}
                  />
                );
              })}
            </AvatarGroup>
          </Box>
        </Box>
      </Box>
    </>
  );
}
