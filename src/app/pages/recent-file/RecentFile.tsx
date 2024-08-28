import { useLazyQuery, useMutation } from "@apollo/client";
import { Fragment, useContext, useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { TbDownload, TbUpload } from "react-icons/tb";

// component
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import * as MUI from "styles/clientPage.style";
import * as MUI_RECENT from "./styles/recentFile.style";

// icons
import {
  MUTATION_ACTION_FILE,
  QUERY_RECENT_FILE,
} from "api/graphql/file.graphql";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import RecentEmpty from "assets/images/empty/recent-empty.svg?react";
import Empty from "components/Empty";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SwitchPages from "components/SwitchPage";
import DialogAlert from "components/dialog/DialogAlert";
import DialogCreateFilePassword from "components/dialog/DialogCreateFilePassword";
import DialogCreateMultipleFilePassword from "components/dialog/DialogCreateMultipleFilePassword";
import DialogCreateMultipleShare from "components/dialog/DialogCreateMultipleShare";
import DialogCreateShare from "components/dialog/DialogCreateShare";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFile from "components/dialog/DialogPreviewFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import menuItems from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useAuth from "hooks/useAuth";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useFirstRender from "hooks/useFirstRender";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import { Base64 } from "js-base64";
import _ from "lodash";
import moment from "moment/moment";
import { BiTime } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  cutFileType,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import RecentFileDataGrid from "./RecentFileDataGrid";

function RecentFile() {
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const [actionStatus, setActionStatus] = useState<any>("all");
  const [dataRecentFiles, setDataRecentFiles] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width:768px)");
  const isFirstRender = useFirstRender();
  const [isDataRecentFilesFound, setIsDataRecentFilesFound] =
    useState<any>(null);
  const [isLoaded, setIsLoaded] = useState<any>(null);
  const [getFolders] = useLazyQuery(QUERY_FOLDER, { fetchPolicy: "no-cache" });
  const manageGraphqlError = useManageGraphqlError();

  const [
    getRecentFile,
    { data, loading: fileLoading, refetch: recentFileRefetch },
  ] = useLazyQuery(QUERY_RECENT_FILE, { fetchPolicy: "no-cache" });
  const [getRecentFileWithoutFiltering] = useLazyQuery(QUERY_RECENT_FILE, {
    fetchPolicy: "no-cache",
  });

  const manageFile = useManageFile({ user });
  const { setIsAutoClose, isAutoClose } = useMenuDropdownState();
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [_total, setTotal] = useState<any>(0);
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [toggle, setToggle] = useState<any>("list");
  const [totalItems, setTotalItems] = useState<any>(0);

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  const [userPackage, setUserPackage] = useState<any>(null);
  const [isPasswordLink, setIsPasswordLink] = useState<any>(false);
  const [procesing, setProcesing] = useState<any>(true);
  const [showProgressing, setShowProgressing] = useState<any>(false);
  const [showPreview, setShowPreview] = useState<any>(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    action: null,
    data: {},
  });

  const manageUserFromShare = useManageUserFromShare({
    inputFileOrFolder: dataForEvent.data,
    inputType: "file",
    user,
  });

  /* data for Breadcrumb */
  const breadcrumbData = useBreadcrumbData(
    dataForEvent.data?.path ||
      (dataForEvent.data?.path, dataForEvent.data?.filename),
    "",
  );

  // popup
  const [name, setName] = useState<any>("");

  //dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(false);
  const [fileDetailsDialog, setFileDetailsDialog] = useState<any>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);

  const [shareDialog, setShareDialog] = useState<any>(false);
  const [dataGetUrl, setDataGetUrl] = useState<any>(null);
  const [eventClick, setEventClick] = useState<any>(false);

  // multiple functions
  const [isMultiplePasswordLink, setIsMultiplePasswordLink] =
    useState<any>(false);
  const [shareMultipleDialog, setShareMultipleDialog] = useState<any>(false);

  const [fileAction] = useMutation(MUTATION_ACTION_FILE);

  const handleGetFolderURL = useGetUrl(dataGetUrl);

  const handleOpenPasswordLink = () => {
    setIsPasswordLink(true);
  };

  const handleClosePasswordLink = () => {
    setIsPasswordLink(false);
    resetDataForEvents();
  };

  const handleOpenMultiplePassword = () => {
    setIsMultiplePasswordLink(true);
  };
  const handleCloseMultiplePassword = () => {
    setIsMultiplePasswordLink(false);
    handleClearFileAndFolderData();
  };

  //share
  useEffect(() => {
    if (user) {
      const packages = user?.packageId;
      setUserPackage(packages);
    }
  }, [user]);

  useEffect(() => {
    if (dataGetUrl) {
      handleGetFolderURL?.(dataGetUrl);
      setTimeout(() => {
        setDataGetUrl(null);
      }, 300);
    }
  }, [dataGetUrl]);

  const handleGetLink = async () => {
    setDataGetUrl(dataForEvent.data);
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  const handleTotalItems = (result) => {
    const value = result?.map((data) => {
      const items = data?.data?.length;
      return items;
    });

    const updateValue = value?.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
    return updateValue;
  };

  // get download url
  const [dataDownloadURL, setDataDownloadURL] = useState<any>(null);
  const handleDownloadUrl = useGetUrlDownload(dataDownloadURL);
  useEffect(() => {
    if (dataDownloadURL) {
      handleDownloadUrl?.(dataDownloadURL);
      setTimeout(() => {
        setDataDownloadURL(null);
      }, 500);
    }
  }, [dataDownloadURL]);

  const handleGetDownloadLink = async () => {
    setDataDownloadURL(dataForEvent.data);
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  useEffect(() => {
    if (isAutoClose) {
      resetDataForEvents();
    }
  }, [isAutoClose]);

  const customGetRecentFiles = () => {
    setTotalItems(0);
    getRecentFile({
      variables: {
        where: {
          status: "active",
          createdBy: user?._id,
          ...(actionStatus !== "all" && {
            actionStatus,
          }),
        },
        orderBy: "actionDate_DESC",
        limit: 100,
      },
      onCompleted: async (data) => {
        const queryData = data?.getRecentFile?.data;
        const queryTotal = data?.getRecentFile?.total;
        setTotal(queryTotal);
        setDataRecentFiles(() => {
          const result = manageFile.splitDataByDate(queryData, "actionDate");

          setTotalItems(handleTotalItems(result));
          return result.map((recentFiles) => {
            return {
              ...recentFiles,
              data: recentFiles.data?.map((data) => ({
                id: data._id,
                ...data,
              })),
            };
          });
        });
        if (queryTotal > 0) {
          setIsDataRecentFilesFound(true);
        } else {
          setIsDataRecentFilesFound(false);
        }
      },
    });
  };

  // handle select multiple files
  const handleMultipleFileData = (data, dataFile) => {
    const optionValue = dataFile?.find((file) => file?._id === data);

    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: optionValue?._id,
          checkType: "file",
          name: optionValue.filename,
          newPath: optionValue?.newPath ?? "",
          newFilename: optionValue?.newFilename ?? "",
          totalDownload: optionValue?.totalDownload || 0,
          dataPassword: optionValue?.filePassword ?? "",
          shortLink: optionValue?.shortUrl,
          createdBy: {
            _id: optionValue?.createdBy?._id,
            newName: optionValue?.createdBy?.newName,
          },
          favorite: optionValue?.favorite === 1 ? true : false,
        },
      }),
    );
  };

  const handleClearFileAndFolderData = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearFileAndFolderData();
  }, [dispatch, toggle]);

  useEffect(() => {
    function getDataSetting() {
      const localStorageToggled = localStorage.getItem("toggle");
      if (localStorageToggled) {
        setToggle(localStorageToggled === "list" ? "list" : "grid");
      } else {
        setToggle("list");
        localStorage.setItem("toggle", "list");
      }
    }

    getDataSetting();
  }, []);

  useEffect(() => {
    //  && !queriesExecuted
    if (eventUploadTrigger?.triggerData?.isTriggered) {
      customGetRecentFiles();
    }
  }, [eventUploadTrigger?.triggerData]);

  useEffect(() => {
    customGetRecentFiles();
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      customGetRecentFiles();
    }
  }, [actionStatus]);

  useEffect(() => {
    // setTotalItems(0);
    getRecentFileWithoutFiltering({
      variables: {
        where: {
          status: "active",
          createdBy: user?._id,
        },
        orderBy: "actionDate_DESC",
        limit: 100,
      },
    });
  }, [data?.getRecentFile?.data]);

  useEffect(() => {
    if (isDataRecentFilesFound !== null) {
      setIsLoaded(true);
    }
  }, [isDataRecentFilesFound]);

  const resetDataForEvents = () => {
    setDataForEvent((state) => ({
      ...state,
      action: null,
      type: null,
    }));
  };

  useEffect(() => {
    if (dataForEvent.action && dataForEvent.data) {
      menuOnClick(dataForEvent.action);
    }
  }, [dataForEvent.action]);

  const menuOnClick = async (action) => {
    setIsAutoClose(true);
    const checkPassword = isCheckPassword();
    switch (action) {
      case "download":
        setEventClick("download");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          if (
            userPackage?.downLoadOption === "another" ||
            userPackage?.category === "free"
          ) {
            handleGetDownloadLink();
          } else {
            handleDownloadFile();
          }
        }
        break;
      case "delete":
        setEventClick("delete");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          await handleDeleteRecentFile();
        }
        break;
      case "rename":
        setEventClick("rename");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          // setName(dataForEvent.data?.filename);
          setRenameDialogOpen(true);
        }
        break;
      case "favourite":
        handleAddFavourite();
        break;
      case "preview":
        setEventClick("preview");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setShowPreview(true);
        }
        break;

      case "password":
        if (userPackage?.lockFile === "on") {
          handleOpenPasswordLink();
        } else {
          errorMessage(
            "The package you've selected is not compatible. Please consider choosing a different one.",
            3000,
          );
        }
        break;
      case "get link":
        setEventClick("get link");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          await handleGetLink();
        }
        break;
      case "detail":
        setEventClick("detail");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFileDetailsDialog(true);
        }
        break;
      case "share":
        setEventClick("share");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setShareDialog(true);
        }
        break;
      default:
        return;
    }
  };

  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.filePassword) {
      checkPassword = true;
    }

    return checkPassword;
  };

  async function handleSubmitDecryptedPassword() {
    switch (eventClick) {
      case "detail":
        setFileDetailsDialog(true);
        handleCloseDecryptedPassword();
        break;
      case "share":
        setShareDialog(true);
        handleCloseDecryptedPassword();
        break;
      case "get link":
        await handleGetLink();
        handleCloseDecryptedPassword();
        break;
      case "preview":
        setShowPreview(true);
        handleCloseDecryptedPassword();
        break;
      case "rename":
        setRenameDialogOpen(true);
        handleCloseDecryptedPassword();
        break;
      case "download":
        handleCloseDecryptedPassword();
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetDownloadLink();
        } else {
          handleDownloadFile();
        }

        break;
      case "delete":
        await handleDeleteRecentFile();
        handleCloseDecryptedPassword();
        break;

      default:
        break;
    }
  }

  const handleCloseDecryptedPassword = () => {
    setEventClick("");
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
    setShowEncryptPassword(false);
  };

  // File action for count in recent file
  const handleActionFile = async (val) => {
    try {
      await fileAction({
        variables: {
          fileInput: {
            createdBy: parseInt(user?._id),
            fileId: parseInt(dataForEvent.data._id),
            actionStatus: val,
          },
        },
      });
    } catch (error: any) {
      errorMessage(error, 2000);
    }
  };

  const handleDownloadFile = async () => {
    const newFileData = [
      {
        id: dataForEvent.data?._id,
        checkType: "file",
        newPath: dataForEvent.data?.newPath || "",
        newFilename: dataForEvent.data?.newFilename || "",
        createdBy: {
          _id: dataForEvent.data?.createdBy._id,
          newName: dataForEvent.data?.createdBy?.newName,
        },
      },
    ];

    await manageFile.handleDownloadSingleFile(
      { multipleData: newFileData },
      {
        onSuccess: () => {
          successMessage("Download successful", 3000);
          setDataForEvent((prev) => {
            return {
              ...prev,
              totalDownload: parseInt(dataForEvent.data?.totalDownload + 1),
            };
          });

          recentFileRefetch();
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },

        onClosure: () => {
          setIsAutoClose(false);
          setFileDetailsDialog(false);
          setShowProgressing(false);
          setProcesing(false);
        },
      },
    );
  };

  const handleDeleteRecentFile = async () => {
    await manageFile.handleDeleteFile(dataForEvent.data._id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        successMessage("Delete file successful!!", 2000);
        customGetRecentFiles();
        resetDataForEvents();
        setIsAutoClose(true);
      },
      onFailed: () => {
        errorMessage("Sorry! Something went wrong. Please try again!");
      },
    });
  };

  const handleRename = async () => {
    await manageFile.handleRenameFile({ id: dataForEvent.data._id }, name, {
      onSuccess: async () => {
        setRenameDialogOpen(false);
        successMessage("Update File successful", 2000);
        await handleActionFile("edit");
        recentFileRefetch();
        resetDataForEvents();
        setIsAutoClose(true);
      },
      onFailed: (error) => {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(
            cutErr || "Something went wrong, Please try again",
          ) as any,
          2000,
        );
      },
    });
  };

  const handleAddFavourite = async () => {
    await manageFile.handleFavoriteFile(
      dataForEvent.data._id,
      dataForEvent.data.favorite ? 0 : 1,
      {
        onSuccess: async () => {
          setRenameDialogOpen(false);
          if (dataForEvent.data.favorite) {
            successMessage("One File removed from Favourite", 2000);
          } else {
            successMessage("One File added to Favourite", 2000);
          }
          await handleActionFile("edit");
          setDataForEvent((state) => ({
            action: null,
            data: {
              ...state.data,
              favorite: dataForEvent.data.favorite ? 0 : 1,
            },
          }));
          recentFileRefetch();
          setFileDetailsDialog(false);
        },
        onFailed: () => {
          errorMessage(
            "Sorry!!. Something went wrong. Please try again later!!",
            2000,
          );
        },
      },
    );
  };

  useEffect(() => {
    if (dataForEvent.action === "rename") {
      setName(dataForEvent.data.filename);
    }
  }, [dataForEvent.action]);

  const handleFileDetailDialogBreadcrumbFolderNavigate = async (link) => {
    const result = await getFolders({
      variables: {
        where: {
          path: link,
          createdBy: user?._id,
        },
      },
    });

    if (result) {
      const [dataById] = result.data.folders.data;
      const base64URL = Base64.encodeURI(dataById.url);
      navigate(`/folder/${base64URL}`);
    }
  };

  const handleDeletedUserFromShareOnSave = async (deletedUsers) => {
    manageUserFromShare.handleDeletedUserFromShareOnSave(deletedUsers, {
      onSuccess: () => {
        setDataForEvent((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
          },
        }));
        successMessage("Deleted user out of share successful!!", 2000);
      },
    });
  };

  const handleChangedUserPermissionFromShareSave = async (sharedData) => {
    await manageUserFromShare.handleChangedUserFromShareOnSave(sharedData, {
      onSuccess: () => {
        setDataForEvent((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
          },
        }));
        successMessage("Changed user permission of share successful!!", 2000);
      },
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {shareDialog && (
        <DialogCreateShare
          onDeletedUserFromShareSave={handleDeletedUserFromShareOnSave}
          onChangedUserPermissionFromShareSave={
            handleChangedUserPermissionFromShareSave
          }
          sharedUserList={manageUserFromShare.sharedUserList}
          onClose={() => {
            resetDataForEvents();
            setShareDialog(false);
          }}
          open={shareDialog}
          data={{
            ...dataForEvent.data,
            ownerId: {
              _id: dataForEvent.data?.createdBy?._id,
              email: dataForEvent.data?.createdBy?.email,
              firstName: dataForEvent.data?.createdBy?.firstName,
              lastName: dataForEvent.data?.createdBy?.lastName,
            },
          }}
          refetch={fileLoading || recentFileRefetch}
        />
      )}

      <DialogCreateMultipleShare
        onClose={() => {
          handleClearFileAndFolderData();
          setShareMultipleDialog(false);
        }}
        open={shareMultipleDialog}
        data={dataForEvent.data}
        dataSelector={dataSelector?.selectionFileAndFolderData}
      />

      {!_.isEmpty(dataForEvent.data) && (
        <DialogFileDetail
          iconTitle={<BiTime />}
          title="RecentFile"
          path={breadcrumbData}
          name={dataForEvent.data.filename || dataForEvent.data.folder_name}
          breadcrumb={{
            handleFolderNavigate:
              handleFileDetailDialogBreadcrumbFolderNavigate,
          }}
          type={
            dataForEvent.data.fileType
              ? getShortFileTypeFromFileType(dataForEvent.data.fileType)
              : cutFileType(dataForEvent.data.filename) || "folder"
          }
          displayType={
            dataForEvent.data.fileType ||
            getFileType(dataForEvent.data.filename) ||
            "folder"
          }
          size={
            dataForEvent.data.size
              ? convertBytetoMBandGB(dataForEvent.data.size)
              : 0
          }
          dateAdded={moment(dataForEvent.data.createdAt).format(
            "YYYY-MM-DD h:mm:ss",
          )}
          lastModified={moment(dataForEvent.data.updatedAt).format(
            "YYYY-MM-DD h:mm:ss",
          )}
          totalDownload={dataForEvent.data.totalDownload}
          isOpen={fileDetailsDialog}
          onClose={() => {
            resetDataForEvents();
            setFileDetailsDialog(false);
          }}
          imagePath={
            user?.newName +
            "-" +
            user?._id +
            "/" +
            (dataForEvent?.data?.newPath
              ? removeFileNameOutOfPath(dataForEvent.data?.newPath)
              : "") +
            dataForEvent?.data?.newFilename
          }
          user={user}
          {...{
            favouriteIcon: {
              isShow: true,
              handleFavouriteOnClick: async () => await handleAddFavourite(),
              isFavourite: dataForEvent.data.favorite ? true : false,
            },
            downloadIcon: {
              isShow: true,
              handleDownloadOnClick: async () => {
                if (
                  userPackage?.downLoadOption === "another" ||
                  userPackage?.category === "free"
                ) {
                  handleGetDownloadLink();
                } else {
                  handleDownloadFile();
                }
              },
            },
          }}
        />
      )}

      {showPreview && (
        <DialogPreviewFile
          open={showPreview}
          handleClose={() => {
            setShowPreview(false);
            resetDataForEvents();
          }}
          onClick={() => {
            if (
              userPackage?.downLoadOption === "another" ||
              userPackage?.category === "free"
            ) {
              handleGetDownloadLink();
            } else {
              handleDownloadFile();
            }
          }}
          filename={dataForEvent.data.filename}
          newFilename={dataForEvent.data.newFilename}
          fileType={dataForEvent.data.fileType}
          path={dataForEvent.data.newPath}
          user={user}
          userId={user?._id}
        />
      )}

      <DialogRenameFile
        open={renameDialogOpen}
        onClose={() => {
          setRenameDialogOpen(false);
          resetDataForEvents();
        }}
        onSave={handleRename}
        title={"Rename file"}
        label={"Rename file"}
        defaultValue={dataForEvent.data?.filename}
        setName={setName}
        name={name}
      />

      <DialogCreateFilePassword
        checkType="file"
        isOpen={isPasswordLink}
        dataValue={dataForEvent.data}
        filename={dataForEvent.data?.filename || "Unknown"}
        isUpdate={dataForEvent.data?.filePassword ? true : false}
        onConfirm={() => {
          recentFileRefetch();
        }}
        onClose={handleClosePasswordLink}
      />

      <DialogCreateMultipleFilePassword
        isOpen={isMultiplePasswordLink}
        checkType="file"
        onConfirm={() => {
          handleClearFileAndFolderData();
          recentFileRefetch();
        }}
        onClose={handleCloseMultiplePassword}
      />

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={dataForEvent.data?.filename}
        newFilename={dataForEvent.data?.newFilename}
        filePassword={dataForEvent.data?.filePassword}
        onConfirm={handleSubmitDecryptedPassword}
        onClose={handleCloseDecryptedPassword}
      />

      <DialogAlert
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          resetDataForEvents();
        }}
        onClick={handleDeleteRecentFile}
        title="Delete this item?"
        message={
          "If you click yes " + dataForEvent.data.filename + " will be deleted?"
        }
      />

      <MUI.TitleAndSwitch sx={{ my: 2 }}>
        {dataSelector?.selectionFileAndFolderData?.length ? (
          <MenuMultipleSelectionFolderAndFile
            onPressShare={() => {
              setShareMultipleDialog(true);
            }}
            onPressLockData={handleOpenMultiplePassword}
            onPressSuccess={() => {
              customGetRecentFiles();
              handleClearFileAndFolderData();
            }}
          />
        ) : (
          <Fragment>
            <MUI.SwitchItem>
              <Typography variant="h4">Recent</Typography>
            </MUI.SwitchItem>

            {isDataRecentFilesFound !== null && isDataRecentFilesFound && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MUI.SwitchItem sx={{ mr: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: "1rem",
                      color: "initial !important",
                      fontWeight: "normal !important",
                    }}
                  >
                    {totalItems} Items
                  </Typography>
                </MUI.SwitchItem>

                <SwitchPages
                  handleToggle={handleToggle}
                  toggle={toggle}
                  setToggle={setToggle}
                />
              </Box>
            )}
          </Fragment>
        )}
      </MUI.TitleAndSwitch>

      <MUI_RECENT.RecentFilesContainer>
        {isMobile ? (
          <MUI_RECENT.ListButtonRecent>
            <Button
              variant={actionStatus === "all" ? "contained" : "text"}
              sx={{
                color: `${actionStatus === "all" ? "#fff" : "#4B465C"}`,
              }}
              onClick={() => setActionStatus("all")}
            >
              All
            </Button>
            <IconButton
              onClick={() => setActionStatus("edit")}
              style={{
                ...(actionStatus === "edit" && {
                  backgroundColor: "#17766B",
                  color: "#fff",
                }),
              }}
            >
              <FaRegEdit />
            </IconButton>
            <IconButton
              onClick={() => setActionStatus("upload")}
              style={{
                ...(actionStatus === "upload" && {
                  backgroundColor: "#17766B",
                  color: "#fff",
                }),
              }}
            >
              <TbDownload />
            </IconButton>
            <IconButton
              onClick={() => setActionStatus("download")}
              style={{
                ...(actionStatus === "download" && {
                  backgroundColor: "#17766B",
                  color: "#fff",
                }),
              }}
            >
              <TbUpload />
            </IconButton>
          </MUI_RECENT.ListButtonRecent>
        ) : (
          <MUI_RECENT.ListButtonRecent>
            <Button
              variant={actionStatus === "all" ? "contained" : "text"}
              sx={{
                ml: 3,
                color: `${actionStatus === "all" ? "#fff" : "#4B465C"}`,
              }}
              onClick={() => setActionStatus("all")}
            >
              All
            </Button>
            <Button
              variant={actionStatus === "edit" ? "contained" : "text"}
              sx={{
                color: `${actionStatus === "edit" ? "#fff" : "#4B465C"}`,
              }}
              startIcon={<FaRegEdit size="18px" />}
              onClick={() => setActionStatus("edit")}
            >
              Latest Edit
            </Button>
            <Button
              variant={actionStatus === "upload" ? "contained" : "text"}
              sx={{
                color: `${actionStatus === "upload" ? "#fff" : "#4B465C"}`,
              }}
              startIcon={<TbUpload />}
              onClick={() => setActionStatus("upload")}
            >
              Latest Upload
            </Button>
            <Button
              variant={actionStatus === "download" ? "contained" : "text"}
              sx={{
                color: `${actionStatus === "download" ? "#fff" : "#4B465C"}`,
              }}
              startIcon={<TbDownload />}
              onClick={() => setActionStatus("download")}
            >
              Latest Download
            </Button>
          </MUI_RECENT.ListButtonRecent>
        )}
        <Fragment>
          {isDataRecentFilesFound !== null && isDataRecentFilesFound && (
            <MUI_RECENT.RecentFilesList>
              {isLoaded &&
                dataRecentFiles?.length > 0 &&
                dataRecentFiles.map((dataRecentFile, index) => {
                  return (
                    <Fragment key={index}>
                      {dataRecentFile.data.length > 0 && (
                        <MUI_RECENT.RecentFilesItem>
                          <Typography variant="h4" fontWeight="bold">
                            {dataRecentFile.title}
                          </Typography>
                          {toggle === "grid" && (
                            <FileCardContainer>
                              {dataRecentFile.data.map((data, index) => {
                                return (
                                  <FileCardItem
                                    imagePath={
                                      user?.newName +
                                      "-" +
                                      user?._id +
                                      "/" +
                                      (data.newPath
                                        ? removeFileNameOutOfPath(data.newPath)
                                        : "") +
                                      data.newFilename
                                    }
                                    user={user}
                                    data={data}
                                    filePassword={data?.filePassword}
                                    cardProps={{
                                      onDoubleClick: () => {
                                        setDataForEvent({
                                          action: "preview",
                                          data,
                                        });
                                      },
                                    }}
                                    id={data?._id}
                                    isCheckbox={true}
                                    fileType={getShortFileTypeFromFileType(
                                      data.fileType,
                                    )}
                                    handleSelect={(dataId) =>
                                      handleMultipleFileData(
                                        dataId,
                                        dataRecentFile.data,
                                      )
                                    }
                                    favouriteIcon={{
                                      isShow: false,
                                      handleFavouriteOnClick: async () => {
                                        setDataForEvent({
                                          data,
                                          action: "favourite",
                                        });
                                      },
                                      isFavourite:
                                        data?.favorite === 1 ? true : false,
                                    }}
                                    name={data.filename}
                                    key={index}
                                    menuItems={menuItems.map(
                                      (menuItem, index) => {
                                        return (
                                          <MenuDropdownItem
                                            isFavorite={
                                              data.favorite ? true : false
                                            }
                                            isPassword={
                                              data.filePassword ? true : false
                                            }
                                            onClick={() => {
                                              setDataForEvent({
                                                action: menuItem.action,
                                                data,
                                              });
                                            }}
                                            key={index}
                                            title={menuItem.title}
                                            icon={menuItem.icon}
                                          />
                                        );
                                      },
                                    )}
                                  />
                                );
                              })}
                            </FileCardContainer>
                          )}
                          {toggle !== "grid" && (
                            <Fragment>
                              {dataRecentFile.data.length > 0 && (
                                <RecentFileDataGrid
                                  data={dataRecentFile.data}
                                  handleEvent={(action, data) => {
                                    setDataForEvent({
                                      action,
                                      data,
                                    });
                                  }}
                                  dataSelector={dataSelector}
                                  handleSelection={(dataId) =>
                                    handleMultipleFileData(
                                      dataId,
                                      dataRecentFile.data,
                                    )
                                  }
                                />
                              )}
                            </Fragment>
                          )}
                        </MUI_RECENT.RecentFilesItem>
                      )}
                    </Fragment>
                  );
                })}
            </MUI_RECENT.RecentFilesList>
          )}
        </Fragment>

        {!fileLoading && isDataRecentFilesFound === false && (
          <Empty icon={<RecentEmpty />} title="No Recent files" />
        )}
      </MUI_RECENT.RecentFilesContainer>
    </Box>
  );
}

export default RecentFile;
