import styled from "@emotion/styled";
import {
  Box,
  Grid,
  IconButton,
  Link,
  TextField as MuiTextField,
  useMediaQuery,
} from "@mui/material";
import { Formik } from "formik";
import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import * as MUI from "styles/baseSignin.style";
import * as Yup from "yup";

import { useMutation } from "@apollo/client";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { createTheme, spacing } from "@mui/system";
import { MUTATION_VERIFY_2FA } from "api/graphql/secure.graphql";
import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";
import ReCAPTCHA from "react-google-recaptcha";
import { errorMessage } from "utils/alert.util";

const TextField = styled(MuiTextField)(spacing);

const TitleContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
});

function BaseSignin(props) {
  const theme = createTheme();
  const { signInCaptcha, handleLoginFailure } = props;
  const { signIn, authentication2FA }: any = useAuth();
  const [open, setOpen] = React.useState(false);
  const [captchaKey, setCaptchaKey] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [verifyCode, setVerifyCode] = React.useState("");
  const [data, setData] = React.useState<any>({});
  const [token, setToken] = React.useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const mobileScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [verify2FA] = useMutation(MUTATION_VERIFY_2FA);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const verifyAuthentication = async () => {
    try {
      const codeVerify = await verify2FA({
        variables: {
          id: parseInt(data?._id),
          input: {
            code: verifyCode,
          },
        },
      });
      if (codeVerify?.data?.validate2FA?._id) {
        await authentication2FA(data, token);
      }
    } catch (error: any) {
      if (error) {
        const message = error.message;
        const verificationFailed = message.split(":")[1].trim();
        if (verificationFailed === "Verification failed") {
          errorMessage("Your verify code not correct!", 2000);
        }
      } else {
        errorMessage("Something went wrong! Please try again!", 2000);
      }
    }
  };

  const handleData = (value) => {
    if (value) {
      window.__reCaptcha = value;
      setCaptchaKey(false);
    }
  };

  useEffect(() => {
    const getLoginCaptcha = () => {
      if (signInCaptcha) {
        const data = signInCaptcha?.status;
        if (data === "on") {
          setShowCaptcha(true);
          setCaptchaKey(true);
        }
      }
    };

    getLoginCaptcha();
  }, [signInCaptcha]);

  return (
    <Fragment>
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string().max(255).required("Username is required"),
          password: Yup.string().max(255).required("Password is required"),
        })}
        onSubmit={async (values, { setStatus }) => {
          setIsLoading(true);
          try {
            if (!captchaKey) {
              const enabled2FA = await signIn(values.username, values.password);
              setIsLoading(false);

              /* reset captcha and button */
              if(window.grecaptcha) {
                window.grecaptcha?.reset();
                setCaptchaKey(true);
              }

              if (enabled2FA) {
                setOpen(enabled2FA.authen);
                setData(enabled2FA.user);
                setToken(enabled2FA.checkRole);
              }
            }
          } catch (error: any) {
            setCaptchaKey(false);
            setIsLoading(false);
            handleLoginFailure(error);
            setStatus({ success: false });
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          touched,
          values,
        }) => (
          <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
            <Grid container spacing={{ sm: 0, md: 2, lg: 2 }}>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  name="username"
                  label="Username"
                  error={Boolean(touched.username && errors.username)}
                  fullWidth
                  helperText={touched.username && errors.username}
                  value={values.username}
                  onChange={handleChange}
                  my={touched.username && errors.username ? 0 : 2}
                  InputLabelProps={{
                    style: {
                      color: "gray",
                      fontSize: mobileScreen ? "0.7rem" : "1rem",
                    },
                  }}
                  size={mobileScreen ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="password"
                  name="password"
                  label="Password"
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  onBlur={handleBlur}
                  value={values.password}
                  onChange={handleChange}
                  my={2}
                  InputLabelProps={{
                    style: {
                      color: "gray",
                      fontSize: mobileScreen ? "0.7rem" : "1rem",
                    },
                  }}
                  size={mobileScreen ? "small" : "medium"}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "space-between" : "flex-end",
                flexDirection: isMobile ? "column" : "row",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{ padding: "0", margin: "0", fontSize: "0.9rem" }}
                display={{ sm: "none", xs: "block" }}
              >
                Dont have an account yet!
                <Button component={NavLink} to="/auth/sign-up">
                  Register
                </Button>
              </Box>
              <Link
                href="/auth/forgot-password"
                sx={{ color: "grey", fontSize: "0.9rem" }}
              >
                Forget Password?
              </Link>
            </Box>
            {showCaptcha && (
              <Box sx={{ margin: "auto", mt: 4, mb: 3, display: "table" }}>
                <ReCAPTCHA
                  sitekey={ENV_KEYS.VITE_APP_RECAPTCHA_KEY}
                  onChange={handleData}
                  onExpired={() => {
                    setCaptchaKey(false);
                  }}
                />
              </Box>
            )}

            {/* {!hideLogin && ( */}
            <MUI.ButtonLogin
              type="submit"
              variant="contained"
              color="success"
              size="large"
              sx={{
                padding: "0.8rem 5rem",
                my: touched.username && errors.username ? 0 : 2,
              }}
              disabled={captchaKey}
              loading={isLoading}
            >
              Login
            </MUI.ButtonLogin>
            {/* )} */}
          </form>
        )}
      </Formik>

      <Dialog
        open={open}
        sx={{
          border: 0,
          backdropFilter: "blur(5px) sepia(5%)",
        }}
      >
        <TitleContainer>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </TitleContainer>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
            fontWeight: "bold",
          }}
        >
          Two factor authentication
        </DialogTitle>
        <DialogContent
          sx={{ margin: isMobile ? "0 0 30px 0" : "10px 50px 50px 50px" }}
        >
          <DialogContentText sx={{ mb: 1, fontSize: "12px" }}>
            Please privide the 6 code
          </DialogContentText>
          <TextField
            sx={{ mt: 1 }}
            autoFocus
            size="small"
            id="name"
            placeholder="Enter code"
            type="number"
            fullWidth
            variant="outlined"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            InputProps={{ inputProps: { maxLength: 6 } }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primaryTheme"
            sx={{ mt: 5 }}
            onClick={verifyAuthentication}
          >
            Verify
          </Button>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default BaseSignin;
