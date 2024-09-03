import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import * as MUI from "./style";

// components
import vShareLogo from "assets/images/logo-vshare-all-white-11.svg";

// material icons and component
import { useSubscription } from "@apollo/client";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { IconButton, Link, Typography, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  // MUTATION_FACEBOOK_OAUTH,
  // MUTATION_SOCIAL_AUTH,
  USER_SIGNUP_SUBSCRIPTION,
} from "api/graphql/social.graphql";
import BaseSignUp from "components/BaseSignup";
import { ENV_KEYS } from "constants/env.constant";
import { SETTING_KEYS } from "constants/setting.constant";
import useAuth from "hooks/useAuth";
import useManageSetting from "hooks/useManageSetting";
import { errorMessage, warningMessage } from "utils/alert.util";
import { LeftBoxRowAuthenticationLimit } from "./style";
import { v4 as uuidv4 } from "uuid";

function SignUp() {
  const theme = useTheme();
  const [showGithub, setShowGithub] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showFacebook, setShowFacebook] = useState(false);
  const [hideSignUp, setHideSignUp] = useState(false);
  const [signUpCaptcha, setSignUpCaptcha] = useState(null);
  const [signUpLimit, setSignUpLimit] = useState(null);
  const [timestamp, setTimestamp] = useState(60);
  const mobileScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // const manageGraphqlError = useManageGraphqlError();

  const { oauthLogin }: any = useAuth();
  // const [signUpWithFacebook] = useMutation(MUTATION_FACEBOOK_OAUTH);
  // const [loginWithGithub] = useMutation(MUTATION_SOCIAL_AUTH);
  const useDataSetting = useManageSetting();

  const authWindowRef = useRef<Window | null>(null);
  const clientIdRef = useRef<string>(uuidv4());

  const SocialMediaAuths = async (str_path: string) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = `${ENV_KEYS.VITE_APP_API_URL}/auth/${str_path}?clientId=${clientIdRef.current}`;

    authWindowRef.current = window.open(
      url,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top} rel='noopener noreferrer'`,
    );
  };

  const { data, error } = useSubscription(USER_SIGNUP_SUBSCRIPTION, {
    variables: {
      signupId: clientIdRef.current,
    },
  });

  function findDataSetting(productKey) {
    const dataSetting = useDataSetting.data?.find(
      (data) => data?.productKey === productKey,
    );

    return dataSetting;
  }

  useEffect(() => {
    const getDataSetting = () => {
      // Sign up Captcha
      const signUpData = findDataSetting(SETTING_KEYS.CAPCHA_GOOGLE);
      if (signUpData) setSignUpCaptcha(signUpData);

      // Sign up limit
      const signUpLimitData = findDataSetting(SETTING_KEYS.SIGN_IN_LIMIT);
      if (signUpLimitData) {
        setSignUpLimit(signUpLimitData);
      }

      // Github
      const githubData = findDataSetting(SETTING_KEYS.OAUTH_GITHUB);
      if (githubData) {
        const data = githubData?.status;
        if (data === "on") setShowGithub(true);
      }

      // Facebook
      const facebookData = findDataSetting(SETTING_KEYS.OAUTH_FACEBOOK);
      if (facebookData) {
        const data = facebookData?.status;
        if (data === "on") setShowFacebook(true);
      }

      // Google
      const googleData = findDataSetting(SETTING_KEYS.OAUTH_GOOGLE);
      if (googleData) {
        const data = googleData?.status;
        if (data === "on") setShowGoogle(true);
      }

      // End
    };

    getDataSetting();
  }, [useDataSetting.data]);

  useEffect(() => {
    if (hideSignUp) {
      // const interval = setInterval(() => {
      //   if (timestamp >= 0) {
      //     setTimestamp(() => timestamp - 1);
      //   }
      // }, 1000);
      // if (timestamp <= 0) {
      //   setSignUpCount(0);
      //   setHideSignUp(false);
      //   setTimestamp(60);
      // }
      // return () => clearInterval(interval);
    }
  }, [hideSignUp, timestamp]);

  useEffect(() => {
    if (data) {
      if (!data || data?.subscribeSignupWithSocial?.message !== "SUCCESS") {
        return;
      }

      if (authWindowRef.current) {
        authWindowRef.current.close();
      }

      if (data && data.subscribeSignupWithSocial) {
        const token = data?.subscribeSignupWithSocial?.token;
        const obj = data?.subscribeSignupWithSocial?.data;

        if (token && obj) {
          oauthLogin(obj[0], token);
        } else {
          warningMessage(
            "Register failed failed. Please, try again later.",
            3000,
          );
        }
      }
    }
    if (error) {
      errorMessage(
        "Subscription error at => " + (error?.message || error),
        3000,
      );
    }
  }, [data, error]);

  return (
    <React.Fragment>
      <MUI.BoxSignUp>
        <MUI.LeftBox>
          <MUI.BoxShowLogo>
            <Link href="/">
              <img src={vShareLogo} alt="logo" />
            </Link>
          </MUI.BoxShowLogo>
          <MUI.BoxShowText>
            <Typography sx={{ fontSize: "3.5rem", fontWeight: 700 }}>
              Welcome Back!
            </Typography>
            <MUI.BoxShowDetail>
              <Typography variant="h4">
                To keep connected with us please
              </Typography>
              <Typography variant="h4">
                login with your personal info
              </Typography>
            </MUI.BoxShowDetail>
            <NavLink to="/auth/sign-in">
              <MUI.ButtonLogin>Login</MUI.ButtonLogin>
            </NavLink>
          </MUI.BoxShowText>
        </MUI.LeftBox>
        <MUI.RightBox>
          {hideSignUp ? (
            <LeftBoxRowAuthenticationLimit>
              <Typography variant="h2">Whoops something went wrong.</Typography>
              <Typography variant="h4">
                To many login attemps. Please try again in{" "}
                <strong> {timestamp} </strong> seconds
              </Typography>
            </LeftBoxRowAuthenticationLimit>
          ) : (
            <MUI.BoxShowSignUpDetail>
              <Typography
                sx={{
                  fontSize: mobileScreen ? "1.5rem" : "2rem",
                  fontWeight: 700,
                  color: "#17766B",
                }}
              >
                Create Account
              </Typography>
              <MUI.BoxShowSocialMediaSignUp>
                {showGoogle && (
                  <IconButton
                    onClick={() => SocialMediaAuths("google")}
                    sx={{
                      border: "1px solid gray",
                      width: mobileScreen ? "30px" : "50px",
                      height: mobileScreen ? "30px" : "50px",
                      margin: "0 1rem",
                    }}
                  >
                    <GoogleIcon />
                  </IconButton>
                )}

                {showFacebook && (
                  <IconButton
                    onClick={() => SocialMediaAuths("facebook")}
                    sx={{
                      border: "1px solid gray",
                      width: mobileScreen ? "30px" : "50px",
                      height: mobileScreen ? "30px" : "50px",
                      margin: "0 1rem",
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                )}

                {showGithub && (
                  <IconButton
                    onClick={() => SocialMediaAuths("github")}
                    sx={{
                      border: "1px solid gray",
                      width: mobileScreen ? "30px" : "50px",
                      height: mobileScreen ? "30px" : "50px",
                      margin: "0 1rem",
                    }}
                  >
                    <GitHubIcon />
                  </IconButton>
                )}
              </MUI.BoxShowSocialMediaSignUp>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  [theme.breakpoints.down("sm")]: {
                    fontSize: "0.9rem",
                  },
                }}
              >
                Or use your email for registration:
              </Typography>
            </MUI.BoxShowSignUpDetail>
          )}

          <MUI.BoxShowFormik>
            <BaseSignUp
              signUpCaptcha={signUpCaptcha}
              // handleSignUpFailure={handleSignUpFailure}
              hideSignUp={hideSignUp}
            />
          </MUI.BoxShowFormik>
        </MUI.RightBox>
      </MUI.BoxSignUp>
    </React.Fragment>
  );
}

export default SignUp;
