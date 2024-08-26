import styled from "@emotion/styled";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import {
  Box,
  InputLabel,
  Link,
  Alert as MuiAlert,
  TextField as MuiTextField,
} from "@mui/material";
import { spacing } from "@mui/system";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";
import useManageSetting from "hooks/useManageSetting";
import ReCAPTCHA from "react-google-recaptcha";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
//components
const LinkBack = styled(Link)({
  display: "flex",
  justifyContent: "center",
  color: "#17766B",
  marginTop: "10px",
  fontWeight: "bold",
});

const Alert = styled(MuiAlert)(spacing);

const TextField = styled(MuiTextField)(spacing);

function ForgotPasswordUsage() {
  const [captcha, setCaptcha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const { forgetPassowrd, resetForgetPassword }: any = useAuth();
  const settingKeys = {
    forgetCaptcha: "ECOTFOR",
  };
  const useDataSetting = useManageSetting();

  const captchaStyle = {
    transform: "scale(0.9)",
    width: "100%",
  };

  function handleData(data) {
    if (data) {
      window.__reCaptcha = data;
      setCaptcha(false);
    }
  }

  function handleClearDateForgetPassword() {
    resetForgetPassword();
  }

  useEffect(() => {
    function getDataSetting() {
      const resData = useDataSetting.data?.find(
        (data) => data?.productKey === settingKeys.forgetCaptcha,
      );

      if (resData) {
        console.log(resData);
        const forgetCaptcha = resData?.status;
        if (forgetCaptcha === "on") {
          setCaptcha(true);
          setShowCaptcha(true);
        }
      }
    }

    getDataSetting();
  }, [useDataSetting.data]);

  useEffect(() => {
    const handleNavigation = () => {
      handleClearDateForgetPassword();
    };

    if (!pathname.includes("/auth/forgot-password")) {
      handleNavigation();
    }

    function handleBeforeUnload(event) {
      if (event.type !== "beforeunload") {
        if (!pathname.includes("/auth/forgot-password")) {
          handleNavigation();
        }
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, navigate]);

  return (
    <Formik
      initialValues={{
        email: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        setIsLoading(true);
        try {
          if (!captcha) {
            await forgetPassowrd(values.email);
            setIsLoading(false);
            setCaptcha(true);
          }
        } catch (error: any) {
          setIsLoading(false);
          setCaptcha(true);
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
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
        <form noValidate onSubmit={handleSubmit}>
          {errors.submit && (
            <Alert mt={2} mb={1} severity="warning">
              {errors.submit}
            </Alert>
          )}
          <InputLabel sx={{ mt: 5, mb: -2 }}>Email</InputLabel>
          <TextField
            type="email"
            name="email"
            size="small"
            value={values.email}
            error={Boolean(touched.email && errors.email)}
            fullWidth
            helperText={touched.email && errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
            my={3}
            placeholder="john.deos@gmail.com"
          />

          {showCaptcha && (
            <Box sx={{ margin: "auto", display: "table", mt: 2, mb: 5 }}>
              <ReCAPTCHA
                sitekey={ENV_KEYS.VITE_APP_RECAPTCHA_KEY}
                onChange={handleData}
                style={captchaStyle}
              />
            </Box>
          )}
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            color="primaryTheme"
            disabled={captcha}
            sx={{ borderRadius: "6px" }}
            loading={isLoading}
          >
            Send Reset Link
          </LoadingButton>
          <LinkBack
            href={`${ENV_KEYS.VITE_APP_URL_REDIRECT_CLIENT_PAGE}auth/sign-in`}
            onClick={() => {
              handleClearDateForgetPassword();
            }}
          >
            <ArrowBackIosIcon sx={{ fontSize: "15px", mt: 0.5 }} />
            Back to sign in
          </LinkBack>
        </form>
      )}
    </Formik>
  );
}

export default ForgotPasswordUsage;
