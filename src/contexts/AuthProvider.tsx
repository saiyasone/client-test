import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADMIN_LOGIN,
  CREATE_LOG,
  MUATION_FORGOT_PASS,
  MUTATION_REFRESH_TOKEN,
  MUTATION_RESET_PASS,
  QUERY_PERMISSION,
  QUERY_STAFF_LOGIN,
  USER_LOGIN,
  USER_SIGNUP,
} from "api/graphql/secure.graphql";
import React, { createContext, useEffect, useReducer, useState } from "react";

import { QUERY_USER } from "api/graphql/user.graphql";
import axios from "axios";
import DialogWarning from "components/dialog/DialogWarning";
import { ENV_KEYS } from "constants/env.constant";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { UAParser } from "ua-parser-js";
import { errorMessage, successMessage, warningMessage } from "utils/alert.util";
import {
  checkAccessToken,
  decryptId,
  decryptToken,
  encryptId,
  isValidToken,
} from "utils/secure.util";

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const LOG_IN = "LOG_IN";
const LOG_OUT = "LOG_OUT";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";
const FORGET_PASSWORD = "FORGET_PASSWORD";
const RESET_FORGET_PASSWORD = "RESET_FORGET_PASSWORD";

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  dateForgetPassword: "",
};

const JWTReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case LOG_IN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case FORGET_PASSWORD:
      return { ...state, dateForgetPassword: action.payload };
    case SIGN_IN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case LOG_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    case RESET_FORGET_PASSWORD:
      return {
        ...state,
        dateForgetPassword: "",
      };
    case SIGN_UP:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };

    default:
      return state;
  }
};

const AuthContext = createContext(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(JWTReducer, initialState);
  const [userLogin] = useMutation(USER_LOGIN);
  const [adminLogin] = useMutation(ADMIN_LOGIN);
  const [register] = useMutation(USER_SIGNUP);
  const [userForgotPasword] = useMutation(MUATION_FORGOT_PASS);
  const [userResetPassword] = useMutation(MUTATION_RESET_PASS);
  const [refreshToken] = useMutation(MUTATION_REFRESH_TOKEN);
  const [openWarning, setOpenWarning] = React.useState(false);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const manageGraphqlError = useManageGraphqlError();

  const [getUsers] = useLazyQuery(QUERY_USER, {
    fetchPolicy: "no-cache",
  });

  const [getSaffLogin] = useLazyQuery(QUERY_STAFF_LOGIN);

  const [createLog] = useMutation(CREATE_LOG);

  const [getPermission, { data: permissionData }] = useLazyQuery(
    QUERY_PERMISSION,
    {
      fetchPolicy: "no-cache",
    },
  );

  const UA = new UAParser();
  const result: any = UA.getResult();
  const formattedResult = `{
  "browser": "${result.browser.name}",
  "cpu": "${result.cpu.architecture}",
  "os": "${result.os.name} ${result.os.version}",
  "from": "Location: ${result.ua}",
  "brand": "${result.device.brand || null}",
  "build": "${result.device.build || null}",
  "model": "${result.device.model || null}",
  "systemName": "${result.os.name}"
}`;

  const handleCreateLog = async (id, name, refreshId, formattedResult) => {
    try {
      await createLog({
        variables: {
          input: {
            createdBy: parseInt(id),
            name: name,
            refreshID: refreshId,
            description: formattedResult,
          },
        },
      });
    } catch (error) {
      errorMessage("refresh token failed", 2000);
    }
  };

  // const accessToken = window.localStorage.getItem("accessToken");
  const accessToken = window.localStorage.getItem(
    ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY,
  );

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const userStaff = localStorage.getItem(ENV_KEYS.VITE_APP_USER_DATA_KEY);
      try {
        if (accessToken && isValidToken(accessToken)) {
          const decoded = accessToken;
          const userPayload = decryptToken(
            decoded,
            ENV_KEYS.VITE_APP_TOKEN_SECRET_KEY,
          );

          const dataDecode = JSON.parse(decryptId(userStaff) as string);

          if (dataDecode?.role?._id) {
            await getSaffLogin({
              variables: {
                where: {
                  _id: dataDecode?._id,
                },
              },
              onCompleted: (data) => {
                const user = data?.queryStaffs?.data[0];
                const userEncrypted = encryptId(
                  JSON.stringify(user),
                  ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
                );
                localStorage.setItem(
                  ENV_KEYS.VITE_APP_USER_DATA_KEY,
                  userEncrypted,
                );
                dispatch({
                  type: INITIALIZE,
                  payload: {
                    isAuthenticated: true,
                    user: user,
                  },
                });
              },
            });
          } else {
            await getUsers({
              variables: {
                where: {
                  _id: userPayload._id,
                },
              },
              onCompleted: (data) => {
                const user = data?.getUser?.data[0];
                const userEncrypted = encryptId(
                  JSON.stringify(user),
                  ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
                );
                localStorage.setItem(
                  ENV_KEYS.VITE_APP_USER_DATA_KEY,
                  userEncrypted,
                );
                // localStorage.setItem("userData", JSON.stringify(user));
                dispatch({
                  type: INITIALIZE,
                  payload: {
                    isAuthenticated: true,
                    user: user,
                  },
                });
              },
            });
          }
        } else {
          dispatch({
            type: INITIALIZE,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
        setIsLoading(false);
      } catch (err) {
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const [localPermission, setLocalPermission] = useState(null);
  useEffect(() => {
    // const storeValue = localStorage.getItem("permission");
    const storeValue = localStorage.getItem(
      ENV_KEYS.VITE_APP_PERMISSION_LOCAL_KEY,
    );

    if (storeValue) {
      const storeParseJson = JSON.parse(decryptId(storeValue) as string);
      const objectValue = storeParseJson;
      setLocalPermission(objectValue);
    }
  }, []);

  useEffect(() => {
    // const dateJson = localStorage.getItem("dateForgetPassword");
    const dateJson = localStorage.getItem(
      ENV_KEYS.VITE_APP_DATE_FORGET_LOCAL_KEY,
    );
    if (dateJson) {
      dispatch({
        type: FORGET_PASSWORD,
        payload: dateJson,
      });
    }
  }, []);

  //  v1, v2, v3, v4

  const fetchPermission = (id) => {
    if (id) {
      getPermission({
        variables: {
          where: { _id: parseInt(id) },
        },
        onCompleted: (data) => {
          if (data) {
            // localStorage.setItem(
            //   "permission",
            //   JSON.stringify(data?.role_staffs?.data[0]?.permision),
            // );
            const permissionEncrypted = encryptId(
              JSON.stringify(data?.role_staffs?.data[0]?.permision),
              ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
            );
            localStorage.setItem(
              ENV_KEYS.VITE_APP_USER_DATA_KEY,
              permissionEncrypted,
            );
          }
        },
      });
    }
  };

  const generateNewToken = async () => {
    const existToken = localStorage.getItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
    const newToken = (
      await refreshToken({
        variables: {
          refreshToken: existToken,
        },
      })
    ).data?.refreshToken;

    const accessToken = newToken?.accessToken;
    if (accessToken) {
      const decoded = accessToken;
      const userPayload = decryptToken(
        decoded,
        ENV_KEYS.VITE_APP_TOKEN_SECRET_KEY,
      );
      await getUsers({
        variables: {
          where: {
            _id: userPayload._id,
          },
        },
        onCompleted: (data) => {
          const user = data?.getUser?.data?.[0];
          checkAccessToken(accessToken);
          // localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem(
            ENV_KEYS.VITE_APP_USER_DATA_KEY,
            JSON.stringify(user),
          );
          dispatch({
            type: INITIALIZE,
            payload: {
              isAuthenticated: true,
              user: user,
            },
          });
        },
      });

      return newToken;
    }
    throw new Error("Token provided is invalid");
  };

  const oauthLogin = async (data, token) => {
    const role = "customer";
    if (token && role === "customer") {
      const checkRole = token;
      const user = data;
      const enable2FA = data?.twoFactorIsEnabled;
      const authen = true;
      const decoded = checkRole;
      const tokenData = decryptToken(
        decoded,
        ENV_KEYS.VITE_APP_TOKEN_SECRET_KEY,
      );
      if (enable2FA === 0) {
        // checkAccessToken(token);
        // localStorage.setItem(
        //   ENV_KEYS.VITE_APP_USER_DATA_KEY,
        //   JSON.stringify(data),
        // );
        // dispatch({
        //   type: SIGN_IN,
        //   payload: {
        //     user,
        //   },
        // });
        // successMessage("Login Success!!", 3000);
        // navigate("/dashboard");

        /////
        const userDataEncrypt = encryptId(
          JSON.stringify(data),
          ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
        );
        checkAccessToken(checkRole);
        localStorage.setItem(ENV_KEYS.VITE_APP_USER_DATA_KEY, userDataEncrypt);

        dispatch({
          type: SIGN_IN,
          payload: {
            user,
          },
        });
        successMessage("Login Success!!", 3000);
        navigate("/dashboard");
      } else {
        return { authen, user, checkRole, refreshId: tokenData.refreshID };
      }
    }
  };

  const logIn = async (username, password) => {
    try {
      await adminLogin({
        variables: {
          where: {
            username: username ?? "",
            password: password ?? "",
          },
        },
        onCompleted: async (data) => {
          const user = data?.staffLogin?.data[0];
          if (user) {
            fetchPermission(user?.role._id);
          }

          const userDataEncrypted = encryptId(
            JSON.stringify(user),
            ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
          );
          localStorage.setItem(
            ENV_KEYS.VITE_APP_USER_DATA_KEY,
            userDataEncrypted,
          );

          const tokenData = data?.staffLogin?.token;
          checkAccessToken(tokenData);
          dispatch({
            type: LOG_IN,
            payload: {
              user,
            },
          });

          successMessage("Login Success!!", 3000);
          navigate("/dashboard/default");
        },
      });
    } catch (error: any) {
      if (error.message === "PASSWORD_INCORRECT") {
        errorMessage("Username or Password incorrect ", 3000);
      } else if (error.message === "USER_NOT_FOUND") {
        errorMessage("Email or Username not found ", 3000);
      } else {
        errorMessage("Something wrong please try again", 3000);
      }
    }
  };

  const signIn = async (username, password) => {
    setAuthLoading(!authLoading);
    try {
      const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);
      const signInUser = await userLogin({
        variables: {
          where: {
            username: username ?? "",
            password: password ?? "",
            ip: responseIp.data ?? "",
            captcha: window.__reCaptcha!,
          },
        },
      });

      const checkRole = signInUser?.data?.userLogin?.token;
      const user = signInUser?.data?.userLogin?.data[0];
      const enable2FA = user?.twoFactorIsEnabled;
      const authen = true;

      const tokenData = decryptToken(
        checkRole,
        ENV_KEYS.VITE_APP_TOKEN_SECRET_KEY,
      );

      await handleCreateLog(
        user?._id,
        "login",
        tokenData.refreshID,
        formattedResult,
      );

      if (enable2FA === 0) {
        const userDataEncrypt = encryptId(
          JSON.stringify(signInUser?.data?.userLogin?.data[0]),
          ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
        );
        checkAccessToken(checkRole);
        localStorage.setItem(ENV_KEYS.VITE_APP_USER_DATA_KEY, userDataEncrypt);

        successMessage("Login Success!!", 3000);
        dispatch({
          type: SIGN_IN,
          payload: {
            user,
          },
        });
        setAuthLoading(false);
        navigate("/dashboard");
      } else {
        return { authen, user, checkRole, refreshId: tokenData.refreshID };
      }
    } catch (error: any) {
      setAuthLoading(false);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      if (cutErr === "USERNAME_OR_PASSWORD_INCORRECT") {
        errorMessage("Username or password incorrect!!", 3000);
      } else if (cutErr === "YOUR_STATUS_IS_DISABLED") {
        setOpenWarning(true);
      } else if (cutErr === "USER_NOT_FOUND") {
        errorMessage("Username doesn't exist!", 3000);
      } else if (cutErr === "ACCOUNT_LOCKED_UNTIL:ວັນທີເດືອນປີ") {
        warningMessage("You account was locked until tomorrow!", 3000);
      } else {
        warningMessage(error.message);
      }
    }
  };

  const authentication2FA = async (user, token) => {
    // localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem(ENV_KEYS.VITE_APP_USER_DATA_KEY, JSON.stringify(user));
    checkAccessToken(token);
    dispatch({
      type: SIGN_IN,
      payload: {
        user,
      },
    });

    successMessage("Login Success!!", 3000);
    navigate("/dashboard");
  };

  const oAuthLogOut = () => {
    if (window.FB) {
      window.FB.getLoginStatus((res) => {
        if (res.status === "connected") {
          window.FB.logout(() => {
            return "User is now logged out";
          });
        }
      });
    }

    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const logOut = async () => {
    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("userData");
    // localStorage.removeItem("permission");
    localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
    localStorage.removeItem(ENV_KEYS.VITE_APP_USER_DATA_KEY);
    localStorage.removeItem(ENV_KEYS.VITE_APP_PERMISSION_LOCAL_KEY);
    oAuthLogOut();
    dispatch({ type: LOG_OUT });
  };

  const signOut = async () => {
    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("permission");
    // localStorage.removeItem("userData");
    localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
    localStorage.removeItem(ENV_KEYS.VITE_APP_USER_DATA_KEY);
    localStorage.removeItem(ENV_KEYS.VITE_APP_PERMISSION_LOCAL_KEY);
    oAuthLogOut();
    dispatch({ type: SIGN_OUT });
  };

  const signUp = async (firstName, lastName, username, email, password) => {
    setAuthLoading(true);
    const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);
    try {
      const signUpUser = await register({
        variables: {
          input: {
            firstName: firstName,
            lastName: lastName,
            username: username,
            password: password,
            email: email,
            ip: responseIp.data,
          },
        },
      });
      if (signUpUser?.data?.signup?._id) {
        successMessage("Register successful!", 3000);
        setAuthLoading(false);
        navigate("/auth/sign-in");
      }
    } catch (error: any) {
      setAuthLoading(false);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(manageGraphqlError.handleErrorMessage(cutErr) || "", 3000);
    }
  };

  const resetPassword = async (data) => {
    try {
      await userResetPassword({
        variables: {
          token: data?.token,
          password: data?.newPassword,
          confirmPassword: data?.confirmPassword,
        },

        onCompleted: (data) => {
          if (data) {
            successMessage("Reset Password success.", 1000);
            setTimeout(() => {
              navigate("/auth/sign-in");
            }, 2000);
          }
        },
      });
    } catch (error: any) {
      const cutErr = error?.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(manageGraphqlError.handleErrorMessage(cutErr) || "", 3000);
      throw error;
    }
  };

  const resetForgetPassword = () => {
    const data = localStorage.getItem(ENV_KEYS.VITE_APP_DATE_FORGET_LOCAL_KEY);

    if (data) {
      localStorage.removeItem(ENV_KEYS.VITE_APP_DATE_FORGET_LOCAL_KEY);
      dispatch({
        type: RESET_FORGET_PASSWORD,
      });
    }
  };

  const forgetPassowrd = async (email) => {
    try {
      const currentDate = new Date();

      if (state?.dateForgetPassword) {
        const dateCurrentFormat = moment(currentDate).format("HH:mm");
        const dateForgetPasswordFormat = state?.dateForgetPassword;
        if (dateCurrentFormat > dateForgetPasswordFormat) {
          await handleForgetPassword(email);
        } else {
          successMessage(
            "The link was already sent to your email. Please try again later.",
            3000,
          );
        }
      } else {
        await handleForgetPassword(email);
      }
    } catch (error) {
      errorMessage("Wrong your email pease try again!", 2000);
    }
  };

  const handleForgetPassword = async (email) => {
    try {
      await userForgotPasword({
        variables: {
          email: email,
          captcha: window.__reCaptcha,
        },
        onCompleted: (data) => {
          if (data?.forgotPassword?.token) {
            const token = data?.forgotPassword?.token;
            const decodeToken: any = jwtDecode(token);
            const dateFormat = decodeToken?.expiredAt;

            localStorage.setItem(
              ENV_KEYS.VITE_APP_DATE_FORGET_LOCAL_KEY,
              moment(dateFormat).format("HH:mm"),
            );

            dispatch({
              type: FORGET_PASSWORD,
              payload: moment(dateFormat).format("HH:mm"),
            });
            successMessage("Check message on you email account.", 3000);
          } else {
            errorMessage("Email not found check again!", 2000);
          }
        },
      });
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(
          cutErr || "Something went wrong, Please try again!",
        ) || "",
        2000,
      );
    }
  };

  if (isLoading === null || isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        // authLoading,
        method: "jwt",
        generateNewToken,
        logIn,
        oauthLogin,
        signIn,
        logOut,
        signOut,
        signUp,
        resetPassword,
        forgetPassowrd,
        resetForgetPassword,
        authentication2FA,
        permission:
          permissionData?.role_staffs?.data[0]?.permision ?? localPermission,
      }}
    >
      {children}
      {openWarning && (
        <DialogWarning
          title="Your account is inactive now!"
          description="If you want to continue using this account please contact our admin to active it. Thank you!"
          isOpen={openWarning}
          onClose={() => setOpenWarning(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
