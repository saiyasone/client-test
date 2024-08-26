import axios from "axios";
import React, { Fragment, useContext, useEffect, useState } from "react";
import * as MUI from "./styles/accountInfo.styles";

// material ui
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Breadcrumbs,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Link,
  OutlinedInput,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useLazyQuery, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
//commponent
import { MUTATION_UPDATE_USER, QUERY_USER } from "api/graphql/user.graphql";
import noProfile from "assets/images/no-profile.svg";
import DialogGenerateAvatar from "components/dialog/DialogGenerateAvatar";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useManageSetting from "hooks/useManageSetting";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getFileNameExtension,
  getFilenameWithoutExtension,
  saveSvgToFile,
} from "utils/file.util";
import useAuth from "../../../hooks/useAuth";
import ChangeUserPasswordSection from "./components/ChangeUserPasswordSection";
import LoginDevice from "./components/LoginDevice";
import TwoFactor from "./components/TwoFactor";
import InvoiceAddress from "./components/InvoiceAddress";
import { QUERY_CURRENT_PAYMENT } from "api/graphql/payment.graphql";
import CurrentPlan from "./components/currentPlan";
import PaymentHistory from "./components/paymentHistory";
import DeleteAccount from "./components/DeleteAccount";
import { encryptData } from "utils/secure.util";

function AccountInfo() {
  const { state } = useLocation();
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = React.useState<any>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isDialogGenerateAvatarOpen, setIsDialogGenerateAvatarOpen] =
    useState<any>(false);
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");
  const manageGraphqlError = useManageGraphqlError();
  const matchImage = ["image/png", "image/jpeg", "image/jpg"];
  const [queryUser, { refetch: userRefetch }] = useLazyQuery(QUERY_USER, {
    fetchPolicy: "no-cache",
  });
  const [queryCurrentPayment] = useLazyQuery(QUERY_CURRENT_PAYMENT, {
    fetchPolicy: "no-cache",
  });
  const [updateUser] = useMutation(MUTATION_UPDATE_USER);

  const [userAccount, setUserAccount] = useState<any>({});
  const [files, setFiles] = useState<any>(null);
  const [preview, setPreview] = useState<any>("");
  const [_fileName, setFileName] = useState<any>(null);
  const [_fileExtension, setFileExtension] = useState<any>(null);
  const [_fileNewName, setFileNewName] = useState<any>(null);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [showTwoFactor, setShowTwoFactor] = useState<any>(false);
  const [showDeativeAccount, setShowDeativeAccount] = useState<any>(false);
  const [_showRemembeDevice, setShowRemembeDevice] = useState<any>(false);
  const useDataSetting = useManageSetting();
  const [selectedSvgCode, setSelectedSvgCode] = useState<any>("");
  const [selectedImageType, setSelectedImageType] = useState<any>("");
  const [isProfileImageFound, setIsProfileImageFound] = useState<any>(true);
  const LOAD_UPLOAD_URL = ENV_KEYS.VITE_APP_LOAD_UPLOAD_URL;
  const LOAD_DELETE_URL = ENV_KEYS.VITE_APP_LOAD_DELETE_URL;
  const [paymentState, setPaymentState] = React.useState<any>({
    currentPlanInfo: null,
    availableDays: 0,
    overdueDays: 0,
    totalDays: 0,
    usedDays: 0,
  });
  const settingKey = {
    _2Factor: "TFAITCG",
    deactiveUser: "DUAUDTA",
    rememberDevice: "RMBMEEB",
  };

  function findDataSetting(productKey) {
    const dataSetting = useDataSetting.data?.find(
      (data) => data?.productKey === productKey,
    );

    return dataSetting;
  }

  function handleFile(e) {
    const file: any = e.target.files[0];
    if (file) {
      setSelectedImageType("image");
      const matchFileSize: any = 800 * 1024;
      if (matchImage.indexOf(file?.type) === -1) {
        errorMessage(
          "Format file is not valid, file support only jpg, jpeg, png",
          3000,
        );
      } else if (file.size > matchFileSize) {
        errorMessage(
          "File size is large more than 800 kb, Please select file again",
          2000,
        );
      } else {
        setFiles(file);
        preViewImage(file);
      }
    }
  }

  useEffect(() => {
    if (!activeStatus) {
      setActiveStatus(state);
    }
  }, [state, activeStatus]);

  // on-off => 2 Factor Authentication
  useEffect(() => {
    function getDataSettings() {
      const dataFactor: any = findDataSetting(settingKey._2Factor);
      if (dataFactor) {
        if (dataFactor?.status === "on") setShowTwoFactor(true);
      }

      // Deactive account
      const dataDeactive = findDataSetting(settingKey.deactiveUser);
      if (dataDeactive) {
        if (dataDeactive?.status === "on") setShowDeativeAccount(true);
      }

      // Remember device
      const dataDevice = findDataSetting(settingKey.rememberDevice);
      if (dataDevice) {
        if (dataDevice?.status === "on") setShowRemembeDevice(true);
      }
    }

    getDataSettings();
  }, [useDataSetting.data]);

  const handleGetUser = async () => {
    await queryUser({
      variables: {
        where: {
          _id: user?._id,
        },
      },
      onCompleted: (data) => {
        if (data?.getUser?.data.length > 0) {
          setUserAccount(data?.getUser?.data[0]);
          setFileNewName(data?.getUser?.data[0]?.profile);
        }
      },
    });
  };

  const handleGetCurrentPayment = async () => {
    await queryCurrentPayment({
      variables: {
        id: user?._id,
      },
      onCompleted: ({ getPayment }) => {
        if (getPayment) {
          const { data, availableDays, overdueDays, totalDays, usedDays } =
            getPayment;
          setPaymentState({
            currentPlanInfo: data,
            availableDays,
            overdueDays,
            totalDays,
            usedDays,
          });
        }
      },
    });
  };

  React.useEffect(() => {
    handleGetUser();
    handleGetCurrentPayment();
  }, []);

  const preViewImage = (file) => {
    setFileExtension(getFileNameExtension(file?.name));
    setFileName(getFilenameWithoutExtension(file?.name));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreview(reader.result);
    };
  };

  const handleCreateLogs = (name, infor, _id) => {
    const data: any = JSON.stringify({
      name: name,
      description: infor,
      createdBy: _id,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: ENV_KEYS.VITE_APP_CREATE_LOG,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error;
      });
  };

  const handleUploadToExternalServer = async (
    _index,
    _id,
    file,
    newName,
    path,
  ) => {
    let filePath = "";
    if (path === "main") {
      filePath = "";
    } else {
      filePath = "/" + path;
    }

    const pathBunny = user?.newName + "-" + user?._id + filePath;

    try {
      const headers = {
        PATH: pathBunny,
        FILENAME: newName,
        createdBy: user?._id,
      };

      const encryptedData = encryptData(headers);

      const source = axios.CancelToken.source();
      const cancelToken = source.token;

      const blob = new Blob([file], {
        type: file.type,
      });
      const newFile = new File([blob], file.name, { type: file.type });

      const formData = new FormData();
      formData.append("file", newFile);

      await axios.post(LOAD_UPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          encryptedHeaders: encryptedData,
        },
        cancelToken,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const profileName = Math.floor(1111111111 + Math.random() * 999999);
      let newFile;
      if (files) {
        const blob = new Blob([files], {
          type: files.type,
        });

        newFile = new File(
          [blob],
          profileName + `.${files?.name?.split(".")?.pop()}`,
          { type: files.type },
        );
      }

      const selectedFile =
        selectedSvgCode && selectedImageType === "avatar"
          ? saveSvgToFile(selectedSvgCode, profileName)
          : newFile && selectedImageType === "image"
          ? newFile
          : null;
      const selectedFileExtension = `.${selectedFile?.name?.split(".")?.pop()}`;

      //delete a file
      if (selectedFile instanceof File && userAccount?.profile) {
        const headers = {
          PATH: `${userAccount?.newName}-${userAccount?._id}/${ENV_KEYS.VITE_APP_ZONE_PROFILE}`,
          FILENAME: userAccount?.profile,
          createdBy: user?._id,
        };

        const encryptedData = encryptData(headers);
        await axios.delete(LOAD_DELETE_URL, {
          headers: {
            "Content-Type": "multipart/form-data",
            encryptedHeaders: encryptedData,
          },
        });
      }

      const userData = await updateUser({
        variables: {
          id: user?._id,
          body: {
            firstName: userAccount?.firstName,
            lastName: userAccount?.lastName,
            gender: userAccount.gender,
            username: userAccount.username,
            phone: userAccount.phone,
            address: userAccount.address,
            state: userAccount.state,
            zipCode: userAccount.zipCode,
            profile:
              selectedFile instanceof File
                ? profileName + selectedFileExtension
                : userAccount?.profile,
            country: userAccount.country,
          },
        },
      });

      if (userData?.data.updateUser) {
        const description = [
          {
            update_profile: "Update profile information",
            status: "Success",
          },
        ];

        if (selectedFile instanceof File) {
          // upload profile to bunny
          const filesArray = Array.from([selectedFile]);
          if (filesArray.length > 0) {
            try {
              const uploadPromises = filesArray.map(async (file, index) => {
                await handleUploadToExternalServer(
                  index,
                  null,
                  file,
                  profileName + selectedFileExtension,
                  "user_profile",
                );
              });
              await Promise.all(uploadPromises);
            } catch (error) {
              console.error(error);
            }
          }
        }
        handleCreateLogs("Update profile", description, user?._id);
        successMessage("Update profile success", 2000);
        userRefetch();
        handleGetUser();
        eventUploadTrigger.trigger();
      }
    } catch (error: any) {
      console.error(error);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      const description = [
        {
          update_profile: "Update profile information",
          status: "Error",
        },
      ];
      handleCreateLogs("Update profile", description, user?._id);
      errorMessage(
        manageGraphqlError.handleErrorMessage(
          cutErr || "Something wrong please try again !",
        ) as string,
        2000,
      );
    }
  };

  const handleReset = () => {
    setFiles(null);
    setPreview("");
  };

  return (
    <Fragment>
      {activeStatus && (
        <MUI.BoxAccountSetting maxWidth={isTablet && isMobile && "xl"}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              margin: "1.5rem 0",
              padding: isTablet ? "0 1.5rem" : isMobile ? "0 1rem" : "",
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => window.history.back()}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2F998B",
                fontWeight: "500",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Account Settings
            </Link>
            <Link
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2F998B",
                fontWeight: "500",
                fontSize: "16px",
              }}
            >
              Account
            </Link>
          </Breadcrumbs>
          <MUI.BoxShowTabs>
            <MUI.ButtonTab
              startIcon={<PeopleAltOutlinedIcon />}
              onClick={() => setActiveStatus(1)}
              sx={{
                background: activeStatus == 1 ? "#17766B" : "",
                color: activeStatus == 1 ? "#ffffff" : "#A8AAAE",
              }}
            >
              Account
            </MUI.ButtonTab>
            <MUI.ButtonTab
              startIcon={<VerifiedUserOutlinedIcon />}
              onClick={() => setActiveStatus(2)}
              sx={{
                background: activeStatus === 2 ? "#17766B" : "",
                color: activeStatus === 2 ? "#ffffff" : "#A8AAAE",
              }}
            >
              Security
            </MUI.ButtonTab>
            <MUI.ButtonTab
              startIcon={<DescriptionIcon />}
              onClick={() => setActiveStatus(3)}
              sx={{
                background: activeStatus === 3 ? "#17766B" : "",
                color: activeStatus === 3 ? "#ffffff" : "#A8AAAE",
              }}
            >
              Invoice
            </MUI.ButtonTab>
          </MUI.BoxShowTabs>
          <MUI.BoxShowTabDetail>
            {activeStatus == 1 && (
              <>
                <MUI.PaperGlobal elevation={6}>
                  <Typography
                    variant={isMobile ? "h6" : "h4"}
                    sx={{ color: "#5D596C" }}
                  >
                    Profile Details
                  </Typography>
                  <MUI.BoxShowAccountHeader>
                    {preview && selectedImageType === "image" ? (
                      <>
                        <img
                          src={preview}
                          alt="image"
                          style={{
                            objectFit: "fill",
                            borderRadius: "8px",
                            boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        {selectedSvgCode && selectedImageType === "avatar" ? (
                          <>
                            <img
                              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                selectedSvgCode,
                              )}`}
                              alt="user_avatar_image"
                              style={{
                                objectFit: "fill",
                                borderRadius: "8px",
                              }}
                            />
                          </>
                        ) : (
                          <>
                            {userAccount?.profile ? (
                              <>
                                <img
                                  src={isProfileImageFound}
                                  onError={() => setIsProfileImageFound(false)}
                                  alt="profile"
                                  style={{
                                    objectFit: "fill",
                                    borderRadius: "8px",
                                    boxShadow:
                                      "brgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                                  }}
                                />
                              </>
                            ) : (
                              <img
                                src={noProfile}
                                alt="user_no_image"
                                style={{
                                  objectFit: "fill",
                                  borderRadius: "8px",
                                  boxShadow:
                                    "brgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                                }}
                              />
                            )}
                          </>
                        )}
                      </>
                    )}
                    <MUI.BoxShowHeaderDetail>
                      <MUI.BoxShowButtons>
                        <MUI.ButtonUploadProfile
                          component="label"
                          variant="contained"
                          color="primaryTheme"
                          sx={{
                            mr: "16px",
                          }}
                          onClick={() => setIsDialogGenerateAvatarOpen(true)}
                        >
                          Generate avatar
                        </MUI.ButtonUploadProfile>
                        <MUI.ButtonUploadProfile
                          component="label"
                          variant="contained"
                          color="primaryTheme"
                        >
                          Upload new photo
                          <input
                            type="file"
                            name="image"
                            hidden
                            onChange={handleFile}
                          />
                        </MUI.ButtonUploadProfile>
                        <MUI.ButtonReset onClick={handleReset}>
                          Reset
                        </MUI.ButtonReset>
                      </MUI.BoxShowButtons>
                      <Typography variant="h6">
                        Allowed JPG, JPEG and PNG. Max size of 800 k
                      </Typography>
                    </MUI.BoxShowHeaderDetail>
                  </MUI.BoxShowAccountHeader>
                  <Divider sx={{ margin: isMobile ? "1rem 0" : "2rem 0" }} />
                  <MUI.BoxShowUserDetail>
                    <Grid
                      container
                      rowSpacing={1}
                      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    >
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          First name
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.firstName || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Last name
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.lastName || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Email
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            disabled={true}
                            value={userAccount?.email || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                email: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Username
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.username || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                username: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Phone number
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.phone || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                phone: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Address
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.address || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                address: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          State
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.state || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                state: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "600",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Zip code
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.zipCode || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                zipCode: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Country
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.country || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                country: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                    <MUI.BoxShowActionButton>
                      <Button
                        color="primaryTheme"
                        variant="contained"
                        sx={{
                          padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
                          fontSize: isMobile ? "0.8rem" : "",
                        }}
                        fullWidth={isMobile ? true : false}
                        onClick={handleUpdateUser}
                      >
                        Save Change
                      </Button>
                      <Button
                        color="greyTheme"
                        variant="contained"
                        sx={{
                          marginLeft: "1.5rem",
                          padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 4rem",
                          fontSize: isMobile ? "0.8rem" : "",
                        }}
                        fullWidth={isMobile ? true : false}
                        onClick={() => navigate("/dashboard")}
                      >
                        Cancel
                      </Button>
                    </MUI.BoxShowActionButton>
                  </MUI.BoxShowUserDetail>
                </MUI.PaperGlobal>
                {showDeativeAccount && (
                  <MUI.PaperGlobal
                    elevation={6}
                    sx={{
                      marginTop: "2rem",
                    }}
                  >
                    <DeleteAccount />
                  </MUI.PaperGlobal>
                )}
              </>
            )}
            {activeStatus == 2 && (
              <>
                <ChangeUserPasswordSection />
                {showTwoFactor && (
                  <TwoFactor data={userAccount} refetch={handleGetUser} />
                )}
                <LoginDevice />
              </>
            )}
            {activeStatus == 3 && (
              <>
                <MUI.PaperGlobal elevation={5}>
                  <CurrentPlan paymentState={paymentState} />
                </MUI.PaperGlobal>

                <MUI.PaperGlobal sx={{ marginTop: "2rem" }}>
                  <Typography variant="h5" sx={{ color: "#4B465C" }}>
                    Invoice Address
                  </Typography>
                  <InvoiceAddress />
                </MUI.PaperGlobal>

                <MUI.PaperGlobal sx={{ marginTop: "2rem" }}>
                  <PaymentHistory />
                </MUI.PaperGlobal>
              </>
            )}
          </MUI.BoxShowTabDetail>
        </MUI.BoxAccountSetting>
      )}
      <DialogGenerateAvatar
        isOpen={isDialogGenerateAvatarOpen}
        onClose={() => setIsDialogGenerateAvatarOpen(false)}
        onConfirm={(svgCode) => {
          setSelectedSvgCode(svgCode);
          setIsDialogGenerateAvatarOpen(false);
          setSelectedImageType("avatar");
        }}
      />
    </Fragment>
  );
}

export default AccountInfo;
