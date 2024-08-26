import { Formik } from "formik";
import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { NavLink } from "react-router-dom";

// component and functions
import * as MUI from "styles/baseSignUp.style";
import * as Yup from "yup";

// material ui
import styled from "@emotion/styled";
import {
  Box,
  Button,
  Grid,
  Alert as MuiAlert,
  TextField as MuiTextField,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, spacing } from "@mui/system";
import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";

const Alert = styled(MuiAlert)(spacing);
const TextField = styled(MuiTextField)(spacing);

function BaseSignUp(props) {
  const theme = createTheme();
  const { signUpCaptcha, hideSignUp, handleSignUpFailure } = props;
  const { signUp, authLoading }: any = useAuth();
  const [captcha, setCaptcha] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const mobileScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isLoading, setIsLoading] = useState(false);

  const captchaStyle = {
    width: "100%",
  };

  function handleData(data) {
    if (data) {
      window.__reCaptcha = data;
      setCaptcha(false);
    }
  }

  useEffect(() => {
    function getDataSetting() {
      if (signUpCaptcha) {
        const registerCaptcha = signUpCaptcha?.status;
        if (registerCaptcha === "on") {
          setShowCaptcha(true);
          setCaptcha(true);
        }
      }
    }
    getDataSetting();
  }, [signUpCaptcha]);

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        firstName: Yup.string().max(255).required("First name is required"),
        lastName: Yup.string().max(255).required("Last name is required"),
        username: Yup.string().max(255).required("Username is required"),
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
        password: Yup.string()
          .nullable()
          .oneOf([Yup.ref("confirm_password"), null], "Passwords must match")
          .max(255)
          .required("Password is required"),
        confirm_password: Yup.string()
          .nullable()
          .oneOf([Yup.ref("password"), null], "Passwords must match") // Custom validation for matching passwords
          .max(255)
          .required("Confirm password is required"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          if (!captcha) {
            setIsLoading(true);
            await signUp(
              values.firstName,
              values.lastName,
              values.username,
              values.email,
              values.password,
            );
            setIsLoading(false);

            /* reset captcha and button */
            if(window.grecaptcha) {
              window.grecaptcha?.reset();
              setCaptcha(true);
            }

          }
        } catch (error: any) {
          setIsLoading(false);
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
          handleSignUpFailure();
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
        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ textAlign: "center" }}
        >
          {errors.submit && <Alert severity="warning">{errors.submit}</Alert>}
          <Grid container spacing={{ sm: 0, md: 2, lg: 2 }}>
            <Grid item xs={12}>
              <Grid container spacing={{ sm: 0, md: 0, lg: 2 }}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <TextField
                    type="text"
                    name="firstName"
                    label="First name"
                    value={values.firstName}
                    error={Boolean(touched.firstName && errors.firstName)}
                    fullWidth
                    helperText={touched.firstName && errors.firstName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    my={3}
                    InputLabelProps={{
                      style: {
                        color: "gray",
                        fontSize: mobileScreen ? "0.7rem" : "1rem",
                      },
                    }}
                    size={mobileScreen ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <TextField
                    type="text"
                    name="lastName"
                    label="Last name"
                    value={values.lastName}
                    error={Boolean(touched.lastName && errors.lastName)}
                    fullWidth
                    helperText={touched.lastName && errors.lastName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    my={3}
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
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={{ sm: 0, md: 2, lg: 2 }}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <TextField
                    type="text"
                    name="username"
                    label="Username"
                    value={values.username}
                    error={Boolean(touched.username && errors.username)}
                    fullWidth
                    helperText={touched.username && errors.username}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    my={3}
                    InputLabelProps={{
                      style: {
                        color: "gray",
                        fontSize: mobileScreen ? "0.7rem" : "1rem",
                      },
                    }}
                    size={mobileScreen ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <TextField
                    type="email"
                    name="email"
                    label="Email address"
                    value={values.email}
                    error={Boolean(touched.email && errors.email)}
                    fullWidth
                    helperText={touched.email && errors.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    my={3}
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
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={{ sm: 0, md: 2, lg: 2 }}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <TextField
                    type="password"
                    name="password"
                    label="Password"
                    value={values.password}
                    error={Boolean(touched.password && errors.password)}
                    fullWidth
                    helperText={touched.password && errors.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    my={3}
                    InputLabelProps={{
                      style: {
                        color: "gray",
                        fontSize: mobileScreen ? "0.7rem" : "1rem",
                      },
                    }}
                    size={mobileScreen ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <TextField
                    type="password"
                    name="confirm_password"
                    label="Confirm password"
                    value={values.confirm_password}
                    error={Boolean(
                      touched.confirm_password && errors.confirm_password,
                    )}
                    fullWidth
                    helperText={
                      touched.confirm_password && errors.confirm_password
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                    my={3}
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
            </Grid>
          </Grid>

          {showCaptcha && (
            <Box sx={{ display: "table", margin: "auto", mt: 4, mb: 3 }}>
              <ReCAPTCHA
                sitekey={ENV_KEYS.VITE_APP_RECAPTCHA_KEY}
                onChange={handleData}
                style={captchaStyle}
              />
            </Box>
          )}

          <Box
            sx={{ padding: "0", margin: "0", fontSize: "0.9rem" }}
            display={{ sm: "none", xs: "block" }}
          >
            Already have an account!
            <Button
              component={NavLink}
              to="/auth/sign-in"
              sx={{ fontSize: "0.9rem" }}
            >
              Login
            </Button>
          </Box>

          {!hideSignUp && (
            <MUI.ButtonRegister
              sx={{ mt: 4, mb: 2 }}
              type="submit"
              variant="contained"
              color="primary"
              disabled={captcha}
              loading={isLoading}
              size={mobileScreen ? "small" : "medium"}
            >
              Register
            </MUI.ButtonRegister>
          )}
        </form>
      )}
    </Formik>
  );
}

export default BaseSignUp;
