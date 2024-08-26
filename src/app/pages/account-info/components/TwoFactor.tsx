import { useMutation } from "@apollo/client";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  styled,
  useMediaQuery,
} from "@mui/material";
import {
  MUTATION_CREATE_TWO_FACTOR,
  MUTATION_TWO_FACTOR_DISABLE,
  MUTATION_TWO_FACTOR_VERIFY,
} from "api/graphql/twoFactor.graphql";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import QRCode from "qrcode.react";
import { Fragment, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { errorMessage, successMessage } from "utils/alert.util";
import * as MUI from "../styles/accountInfo.styles";
const ContainerQR = styled("div")({
  minHeight: "50px",
  width: "auto",
});

const ContainerQRContent = styled("div")({
  width: "auto",
  display: "block",
});

function TwoFactor(props) {
  const { user }: any = useAuth();
  const manageGraphqlError = useManageGraphqlError();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { data } = props;
  const [copied, setCopied] = useState<any>(false);
  const [open, setOpen] = useState<any>(false);
  const [createTwoFactor] = useMutation(MUTATION_CREATE_TWO_FACTOR);
  const [verityTwoFactor] = useMutation(MUTATION_TWO_FACTOR_VERIFY);
  const [disableTwoFactor] = useMutation(MUTATION_TWO_FACTOR_DISABLE);
  const [otpTwoFactorBase, setOtpTwoFactorBase] = useState<any>(null);
  const [otpTwoFatorQRcode, setOtpTwoFatorQRcode] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState<any>("");
  const [otpIsEnable, setOtpIsEnable] = useState<any>(0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEnableTwoFactor = async (val) => {
    try {
      if (val === "enable") {
        const create = await createTwoFactor({
          variables: {
            id: user?._id,
          },
        });

        if (create?.data?.create2FA?._id) {
          setOtpTwoFactorBase(create?.data?.create2FA?.twoFactorSecret);
          setOtpTwoFatorQRcode(create?.data?.create2FA?.twoFactorQrCode);
          props.refetch();
          setTimeout(() => {
            if (val === "enable") {
              handleClickOpen();
            }
          }, 300);
        }
      } else {
        const create = await disableTwoFactor({
          variables: {
            id: user?._id,
          },
        });

        if (create?.data?.disable2FA?._id) {
          props.refetch();
          successMessage("Disable two-factor authentication success ", 2000);
          setOtpIsEnable(0);
        }
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  // verify two factor
  const handleVerifyTwofa = async () => {
    try {
      const authenVerify = await verityTwoFactor({
        variables: {
          id: parseInt(user?._id),
          input: {
            code: verifyCode,
          },
        },
        onCompleted: (data) => {
          setOtpIsEnable(data?.verify2FA?.twoFactorIsEnabled);
        },
      });
      if (authenVerify?.data?.verify2FA?._id) {
        successMessage("Verifty two-factor success", 2000);
        handleClose();
        setVerifyCode(null);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  // download RQcode
  const downloadQR = () => {
    const canvas: any = document.querySelector("#qr-code-canvas");
    const dataURL = canvas.toDataURL();

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "qrcode-two-factor.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function handleCopy() {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <Fragment>
      <MUI.PaperGlobal
        elevation={5}
        sx={{
          marginTop: "2rem",
        }}
      >
        <Typography variant="h6" sx={{ color: "#5D596C", fontWeight: "600" }}>
          Two-steps verification
        </Typography>
        <Typography variant="h6" sx={{ color: "#5D596C", margin: "1rem 0" }}>
          Two-factor authentication is not enabled yet.
        </Typography>
        <Typography variant="h6" sx={{ color: "#5D596C", fontSize: "0.8rem" }}>
          Two-factor authentication adds a layer of security to your account by
          requiring more than just a password to log in. Learn more
        </Typography>
        <Button
          sx={{
            background: `${
              data?.twoFactorIsEnabled === 1 || otpIsEnable === 1
                ? "#EA5455"
                : "#17766B"
            }`,
            color: "#ffffff",
            padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
            fontSize: isMobile ? "0.8rem" : "",
            "&:hover": {
              color: "#17766B",
            },
            marginTop: "2rem",
          }}
          onClick={() =>
            handleEnableTwoFactor(
              data?.twoFactorIsEnabled === 1 || otpIsEnable === 1
                ? "disable"
                : "enable",
            )
          }
        >
          {data?.twoFactorIsEnabled === 1 || otpIsEnable === 1
            ? "Disable two-factor authentication"
            : "Enable two-factor authentication"}
        </Button>
      </MUI.PaperGlobal>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogContent>
          <ContainerQRContent>
            <ContainerQR>
              <Typography variant="h3" sx={{ fontSize: 20 }}>
                QR code two factor
              </Typography>
              {/* <Typography component="p" sx={{ fontSize: 13 }}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Laudantium hic quis rerum!
              </Typography> */}
            </ContainerQR>
            <div
              style={{
                width: "100%",
                border: "1px solid #fff",
                display: `${isMobile ? "block" : "flex"}`,
                gap: "2rem",
              }}
            >
              <Box>
                <QRCode
                  id="qr-code-canvas"
                  value={otpTwoFatorQRcode}
                  size={isMobile ? 150 : 200}
                  level="H"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                  renderAs="canvas"
                />

                <Box sx={{ display: "flex", mt: 3, alignItems: "center" }}>
                  <Button
                    variant="contained"
                    color="primaryTheme"
                    onClick={downloadQR}
                  >
                    Download QR
                  </Button>

                  <Box sx={{ ml: 4 }}>
                    {copied ? (
                      <IconButton>
                        <DownloadDoneIcon sx={{ color: "#17766B" }} />
                      </IconButton>
                    ) : (
                      <CopyToClipboard
                        text={otpTwoFactorBase}
                        onCopy={handleCopy}
                      >
                        <Tooltip title="Copy key code two-factor">
                          <ContentCopyIcon />
                        </Tooltip>
                      </CopyToClipboard>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h4">Verify Code</Typography>
                <TextField
                  size="small"
                  id="outlined-basic"
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
              </Box>
            </div>
          </ContainerQRContent>
        </DialogContent>

        <DialogActions sx={{ mb: 3, mr: 3 }}>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primaryTheme"
            onClick={handleVerifyTwofa}
            autoFocus
            disabled={verifyCode ? false : true}
          >
            Verify Code
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default TwoFactor;
