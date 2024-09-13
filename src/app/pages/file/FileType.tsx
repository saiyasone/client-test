import { useLazyQuery, useMutation } from "@apollo/client";
import { Box, Typography } from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Base64 } from "js-base64";
import _ from "lodash";
import moment from "moment";
import useAuth from "../../../hooks/useAuth";
// import CardSkeleton from "../components/CardSkeleton";
// import ListSkeleton from "../components/ListSkeleton";
import {
  MUTATION_ACTION_FILE,
  QUERY_FILE_CATEGORY,
} from "api/graphql/file.graphql";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
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
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useFirstRender from "hooks/useFirstRender";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useScroll from "hooks/useScroll";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  cutFileType,
  getFileNameExtension,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import FileDataGrid from "./FileTypeDataGrid";
import * as MUI from "./styles/fileType.style";

const ITEM_PER_PAGE = 20;

function FileType() {
  const { fileType }: any = useParams();
  const { user }: any = useAuth();
  const manageGraphqlError = useManageGraphqlError();
  const fileTypeDecode = Base64.decode(fileType);
  const isFirstRender = useFirstRender();
  const [getFileData] = useLazyQuery(QUERY_FILE_CATEGORY, {
    fetchPolicy: "no-cache",
  });
  const [isDataFound, setDataFound] = useState<any>(null);
  const [toggle, setToggle] = useState<any>("list");
  const [userPackage, setUserPackage] = useState<any>(null);

  const navigate = useNavigate();

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  const [getFolders, { refetch: refetchFiles }] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });
  const manageFile = useManageFile({ user });
  // const [updateFile] = useMutation(MUTATION_FILES);
  const [showPreview, setShowPreview] = useState<any>(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    action: null,
    type: null,
    data: {},
  });

  const manageUserFromShare = useManageUserFromShare({
    inputFileOrFolder: dataForEvent.data,
    inputType: "file",
    user,
  });

  const eventUploadTrigger = useContext(EventUploadTriggerContext);

  /* for filtered data includes pagination... */
  const [_dataFolderFilters, setDataFolderFilters] = useState<any>({});
  const [currentFilePage, setCurrentFilePage] = useState<any>(1);
  const { setIsAutoClose } = useMenuDropdownState();
  const [currentFolderPage, _setCurrentFolderPage] = useState<any>(1);
  const [isPasswordLink, setIsPasswordLink] = useState<any>(false);

  // event click for decrypt password
  const [eventClick, setEventClick] = useState<any>(false);

  // popup
  const [name, setName] = useState<any>("");

  // multiple functions
  const [isMultiplePasswordLink, setIsMultiplePasswordLink] =
    useState<any>(false);
  const [shareMultipleDialog, setShareMultipleDialog] = useState<any>(false);

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  //dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);
  const [fileDetailsDialog, setFileDetailsDialog] = useState<any>(false);
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [shareDialog, setShareDialog] = useState<any>(false);
  const [total, setTotal] = useState<any>(0);
  const [fileData, setFileData] = useState<any>([]);

  const [fileAction] = useMutation(MUTATION_ACTION_FILE);

  /* data for Breadcrumb */
  const breadcrumbDataForFileDetails = useBreadcrumbData(
    dataForEvent.data?.newPath ||
      (dataForEvent.data?.newPath, dataForEvent.data?.filename),
    "",
  );

  const { limitScroll } = useScroll({
    total: total,
    limitData: ITEM_PER_PAGE,
  });

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
  };

  const queryFileGrid = async () => {
    if (toggle === "grid") {
      try {
        await getFileData({
          variables: {
            where: {
              createdBy: parseInt(user?._id),
              fileType: fileTypeDecode,
              status: "active",
            },
            orderBy: "actionDate_DESC",
            limit: limitScroll,
          },
          onCompleted: (data) => {
            if (data) {
              const queryData = data?.getFileCategoryDetails?.data || [];
              const queryTotal = data?.getFileCategoryDetails?.total || 0;
              setTotal(queryTotal);
              if (queryData?.length > 0) {
                setFileData(queryData);
                setDataFound(true);
              } else {
                setDataFound(false);
              }
            }
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleMultipleFiles = (data) => {
    const optionValue = fileData?.find((file) => file?._id === data);
    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: optionValue?._id,
          name: optionValue?.filename,
          newPath: optionValue?.newPath || "",
          newFilename: optionValue?.newFilename || "",
          checkType: "file",
          dataPassword: optionValue?.filePassword || "",
          shortLink: optionValue?.shortUrl,
          favorite: optionValue?.favorite === 1 ? true : false,
          createdBy: {
            _id: optionValue?.createdBy?._id,
            newName: optionValue?.createdBy?.newName,
          },
        },
      }),
    );
  };

  const queryFiles = async () => {
    try {
      if (toggle === "list") {
        await getFileData({
          variables: {
            where: {
              createdBy: parseInt(user?._id),
              fileType: fileTypeDecode,
              status: "active",
            },
            orderBy: "actionDate_DESC",
            limit: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (currentFilePage - 1),
          },
          onCompleted: (data) => {
            if (data) {
              const queryData = data?.getFileCategoryDetails?.data || [];
              const queryTotal = data?.getFileCategoryDetails?.total || 0;
              setTotal(queryTotal);
              if (queryData?.length > 0) {
                setFileData(queryData);
                setDataFound(true);
              } else {
                setDataFound(false);
              }
            }
          },
        });
      }
    } catch (error: any) {
      errorMessage(error, 3000);
    }
  };

  useEffect(() => {
    handleClearSelectionData();
  }, [dispatch, toggle]);

  useEffect(() => {
    queryFiles();
  }, [toggle, currentFilePage]);

  useEffect(() => {
    if (user) {
      const packageSign = user?.packageId;
      setUserPackage(packageSign);
    }
  }, [user]);

  useEffect(() => {
    queryFileGrid();
  }, [limitScroll, toggle]);

  useEffect(() => {
    if (eventUploadTrigger?.triggerData?.isTriggered) {
      if (toggle === "list") {
        queryFiles();
      } else {
        queryFileGrid();
      }
    }
  }, [eventUploadTrigger?.triggerData]);

  useEffect(() => {
    if (!isFirstRender) {
      setDataFolderFilters((prevState) => {
        const result = {
          ...prevState,
          skip: (currentFolderPage - 1) * ITEM_PER_PAGE,
        };
        if (currentFolderPage - 1 === 0) {
          delete result.skip;
        }
        return result;
      });
    }
  }, [currentFolderPage]);

  useEffect(() => {
    const localStorageToggled = localStorage.getItem("toggle");
    if (localStorageToggled) {
      setToggle(localStorageToggled === "list" ? "list" : "grid");
    } else {
      localStorage.setItem("toggle", "list");
      setToggle("list");
    }
  }, []);

  const customGetFiles = () => {
    if (toggle === "list") {
      queryFiles();
    } else {
      queryFileGrid();
    }
  };

  const handleClearSelectionData = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  const resetDataForEvents = () => {
    setDataForEvent((state) => ({
      ...state,
      action: "",
      data: {},
    }));
  };

  useEffect(() => {
    if (dataForEvent.action && dataForEvent.data) {
      menuOnClick(dataForEvent.action);
    }
  }, [dataForEvent.action]);

  // get link url
  const [dataGetUrl, setDataGetURL] = useState<any>(null);

  // get download url
  const [dataDownloadURL, setDataDownloadURL] = useState<any>(null);

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
          await handleDeleteFilesAndFolders();
        }
        break;
      case "rename":
        setEventClick("rename");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
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
        handleOpenPasswordLink();
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

  useEffect(() => {
    if (dataGetUrl) {
      handleGetUrl?.(dataGetUrl);
      setTimeout(() => {
        setDataGetURL(null);
      }, 300);
    }
  }, [dataGetUrl]);

  const handleGetUrl = useGetUrl(dataGetUrl);

  const handleGetLink = async () => {
    await setDataGetURL(dataForEvent.data);
    await setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  // horm
  useEffect(() => {
    if (dataDownloadURL) {
      handleDownloadUrl?.(dataDownloadURL);
      setTimeout(() => {
        setDataDownloadURL(null);
      }, 500);
    }
  }, [dataDownloadURL]);

  const handleDownloadUrl = useGetUrlDownload(dataDownloadURL);

  const handleGetDownloadLink = async () => {
    await setDataDownloadURL(dataForEvent.data);
    await setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

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
    const multipleData = [
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
      { multipleData },
      {
        onFailed: async (error) => {
          errorMessage(error, 3000);
        },
        onSuccess: async () => {
          successMessage("Download successful", 2000);
          setDataForEvent((state) => ({
            ...state,
            action: null,
            data: {
              ...state.data,
              totalDownload: dataForEvent.data.totalDownload + 1,
            },
          }));
          customGetFiles();
        },
        onClosure: async () => {
          setShowPreview(false);
          setFileDetailsDialog(false);
        },
      },
    );
  };

  const handleDeleteFilesAndFolders = async () => {
    try {
      if (dataForEvent.type === "folder") {
        return;
      } else {
        await manageFile.handleDeleteFile(dataForEvent.data._id, {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            successMessage("Delete file successful!!", 2000);
            customGetFiles();
            resetDataForEvents();
          },
        });
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleRename = async () => {
    try {
      if (dataForEvent.type === "folder") {
        return;
      } else {
        await manageFile.handleRenameFile({ id: dataForEvent.data._id }, name, {
          onSuccess: async () => {
            customGetFiles();
            setRenameDialogOpen(false);
            successMessage("Update File successful", 2000);
            await handleActionFile("edit");
            resetDataForEvents();
          },
        });
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(
          cutErr || "Something went wrong, Please try again",
        ) as string,
        2000,
      );
    }
  };

  const handleAddFavourite = async () => {
    await manageFile.handleFavoriteFile(
      dataForEvent.data._id,
      dataForEvent.data.favorite ? 0 : 1,
      {
        onSuccess: async () => {
          setRenameDialogOpen(false);
          setFileDetailsDialog(false);
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
          customGetFiles();
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

  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.filePassword) {
      checkPassword = true;
    }

    return checkPassword;
  };

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

  async function handleSubmitDecryptedPassword() {
    switch (eventClick) {
      case "download":
        handleCloseDecryptedPassword();
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetDownloadLink();
        } else {
          await handleDownloadFile();
        }
        break;
      case "delete":
        handleCloseDecryptedPassword();
        await handleDeleteFilesAndFolders();
        break;
      case "rename":
        setRenameDialogOpen(true);
        handleCloseDecryptedPassword();
        break;
      case "preview":
        setShowPreview(true);
        handleCloseDecryptedPassword();
        break;
      case "get link":
        await handleGetLink();
        handleCloseDecryptedPassword();
        break;
      case "detail":
        setFileDetailsDialog(true);
        handleCloseDecryptedPassword();
        break;
      case "share":
        setShareDialog(true);
        handleCloseDecryptedPassword();
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    if (dataForEvent.action) {
      if (dataForEvent.type === "folder") {
        setName(dataForEvent.data.name);
      } else {
        setName(dataForEvent.data.filename);
      }
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
    <Fragment>
      {shareDialog && dataForEvent.data && (
        <DialogCreateShare
          onDeletedUserFromShareSave={handleDeletedUserFromShareOnSave}
          onChangedUserPermissionFromShareSave={
            handleChangedUserPermissionFromShareSave
          }
          sharedUserList={manageUserFromShare.sharedUserList}
          onClose={() => {
            setShareDialog(false);
            resetDataForEvents();
          }}
          open={shareDialog}
          data={{
            ...dataForEvent?.data,
            filename: dataForEvent.data?.filename,
          }}
          ownerId={{
            _id: dataForEvent.data?.createdBy?._id,
            newName: dataForEvent.data?.createdBy?.newName,
          }}
          refetch={refetchFiles}
          handleClose={() => {
            setShareDialog(false);
            resetDataForEvents();
          }}
        />
      )}

      {!_.isEmpty(dataForEvent.data) && (
        <DialogFileDetail
          path={breadcrumbDataForFileDetails}
          name={dataForEvent.data?.filename || dataForEvent.data?.filename}
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
            "D MMM YYYY, h:mm A",
          )}
          lastModified={moment(dataForEvent.data.updatedAt).format(
            "D MMM YYYY, h:mm A",
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
            resetDataForEvents();
            setShowPreview(false);
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
        />
      )}

      <DialogRenameFile
        open={renameDialogOpen}
        onClose={() => {
          resetDataForEvents();
          setRenameDialogOpen(false);
        }}
        onSave={handleRename}
        title={"Rename file"}
        label={"Rename file"}
        setName={setName}
        defaultValue={
          dataForEvent.type === "folder"
            ? dataForEvent.data.name
            : dataForEvent.data.filename
        }
        extension={getFileNameExtension(name)}
        name={name}
      />

      <DialogAlert
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          resetDataForEvents();
        }}
        onClick={handleDeleteFilesAndFolders}
        title="Delete this item?"
        message={
          "If you click yes " +
          (dataForEvent.data.filename || dataForEvent.data.name) +
          " will be deleted?"
        }
      />

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={dataForEvent.data?.filename}
        newFilename={dataForEvent.data?.newFilename}
        filePassword={dataForEvent.data?.filePassword}
        onConfirm={handleSubmitDecryptedPassword}
        onClose={handleCloseDecryptedPassword}
      />

      <DialogCreateFilePassword
        isOpen={isPasswordLink}
        dataValue={dataForEvent.data}
        filename={dataForEvent.data?.filename}
        isUpdate={dataForEvent.data.filePassword ? true : false}
        checkType="file"
        onConfirm={() => {
          customGetFiles();
        }}
        onClose={handleClosePasswordLink}
      />

      <DialogCreateMultipleShare
        onClose={() => {
          resetDataForEvents();
          setShareMultipleDialog(false);
        }}
        open={shareMultipleDialog}
        dataSelector={dataSelector?.selectionFileAndFolderData}
        data={dataForEvent.data}
      />

      <DialogCreateMultipleFilePassword
        isOpen={isMultiplePasswordLink}
        checkType="file"
        onConfirm={() => {
          handleClearSelectionData();
          customGetFiles();
        }}
        onClose={handleCloseMultiplePassword}
      />

      <MUI.FileTypeContainer>
        <MUI.TitleAndSwitch className="title-n-switch" sx={{ my: 2 }}>
          {dataSelector?.selectionFileAndFolderData?.length ? (
            <MenuMultipleSelectionFolderAndFile
              onPressSuccess={() => {
                handleClearSelectionData();
                customGetFiles();
              }}
              onPressShare={() => {
                setShareMultipleDialog(true);
              }}
              onPressLockData={handleOpenMultiplePassword}
            />
          ) : (
            <Fragment>
              <Typography variant="h3">
                {_.capitalize(fileTypeDecode)}{" "}
              </Typography>
              {isDataFound !== null && isDataFound && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="h5"
                    mr={3}
                    sx={{
                      fontSize: "1rem",
                      color: "initial !important",
                      fontWeight: "normal !important",
                    }}
                  >
                    {total} Items
                  </Typography>

                  <SwitchPages
                    handleToggle={handleToggle}
                    toggle={toggle === "grid" ? "grid" : "list"}
                    setToggle={setToggle}
                  />
                </Box>
              )}
            </Fragment>
          )}
        </MUI.TitleAndSwitch>

        {isDataFound !== null && isDataFound && (
          <MUI.FileTypeList>
            <Fragment>
              <MUI.FileTypeItem>
                <Fragment>
                  {toggle === "grid" && (
                    <FileCardContainer>
                      {fileData?.map((data, index) => {
                        return (
                          <FileCardItem
                            isCheckbox={true}
                            cardProps={{
                              onDoubleClick: () => {
                                setDataForEvent({
                                  action: "preview",
                                  data,
                                });
                              },
                            }}
                            id={data?._id}
                            filePassword={data?.filePassword}
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
                            selectType={"file"}
                            handleSelect={handleMultipleFiles}
                            favouriteIcon={{
                              isShow: false,
                              handleFavouriteOnClick: async () => {
                                setDataForEvent({
                                  data,
                                  action: "favourite",
                                });
                              },
                              isFavourite: data?.favorite === 1 ? true : false,
                            }}
                            fileType={getShortFileTypeFromFileType(
                              data.fileType,
                            )}
                            name={data.filename}
                            key={index}
                            menuItems={menuItems.map((menuItem, index) => {
                              return (
                                <MenuDropdownItem
                                  isFavorite={data.favorite ? true : false}
                                  isPassword={
                                    data?.filePassword ||
                                    data?.password ||
                                    data?.access_password ||
                                    data?.access_passwordFolder
                                      ? true
                                      : false
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
                            })}
                          />
                        );
                      })}
                    </FileCardContainer>
                  )}

                  {toggle !== "grid" && (
                    <FileDataGrid
                      pagination={{
                        total: Math.ceil(total / ITEM_PER_PAGE),
                        currentPage: currentFilePage,
                        setCurrentPage: setCurrentFilePage,
                      }}
                      total={total}
                      data={fileData}
                      dataSelector={dataSelector}
                      handleEvent={(action, data) => {
                        setDataForEvent({
                          data,
                          action,
                        });
                      }}
                      handleSelect={handleMultipleFiles}
                    />
                  )}
                </Fragment>
              </MUI.FileTypeItem>
            </Fragment>
          </MUI.FileTypeList>
        )}
      </MUI.FileTypeContainer>
    </Fragment>
  );
}

export default FileType;
