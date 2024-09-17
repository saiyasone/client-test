import { useLazyQuery, useMutation } from "@apollo/client";
import React, { Fragment, useContext, useEffect, useState } from "react";

// component
import { Box, Button, Typography } from "@mui/material";

// icons
import _ from "lodash";
import moment from "moment";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { ExpandMore } from "@mui/icons-material";
import { MUTATION_ACTION_FILE, QUERY_FILE } from "api/graphql/file.graphql";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import FavouriteEmpty from "assets/images/empty/favourite-empty.svg?react";
import CardSkeleton from "components/CardSkeleton";
import Empty from "components/Empty";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import ListSkeleton from "components/ListSkeleton";
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
import ProgressingBar from "components/loading/ProgressingBar";
import { ENV_KEYS } from "constants/env.constant";
import menuItems from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useAuth from "hooks/useAuth";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useDetectResizeWindow from "hooks/useDetectResizeWindow";
import useFirstRender from "hooks/useFirstRender";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useManageSetting from "hooks/useManageSetting";
import useScroll from "hooks/useScroll";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import * as MUI from "styles/clientPage.style";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  cutFileType,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import FavouriteFileDataGrid from "./FavouriteFileDataGrid";
import * as MUI_FAVOURITE from "./styles/favourite.style";

const ITEM_PER_PAGE_LIST = 10;
const ITEM_PER_PAGE_GRID = 40;

function FavouriteFile() {
  const { user }: any = useAuth();
  const manageGraphqlError = useManageGraphqlError();
  const navigate = useNavigate();
  const [isCheckAll, setIsCheckAll] = useState<any>(false);
  const [dataFilesAndFolders, setDataFilesAndFolders] = useState<any>([null]);
  const [dataFilesAndFoldersForGrid, setDataFilesAndFoldersForGrid] =
    useState<any>([null]);
  const isFirstRender = useFirstRender();
  const [
    getFiles,
    {
      data: dataFiles,
      refetch: filesRefetch,
      loading: dataFilesLoadingForList,
    },
  ] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });

  const [
    getFilesForGrid,
    {
      data: dataFilesForGrid,
      refetch: filesRefetchForGrid,
      loading: dataFilesLoadingForGrid,
    },
  ] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });

  const [isDataFavoriteFilesFound, setIsDataFavoriteFilesFound] =
    useState<any>(null);
  const [isDataFavoriteFoldersFound, _setIsDataFavoriteFoldersFound] =
    useState<any>(null);
  const [getFolders, { loading: loadingFolders, refetch: foldersRefetch }] =
    useLazyQuery(QUERY_FOLDER, {
      fetchPolicy: "no-cache",
    });
  const manageFile = useManageFile({ user });
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const { folderId }: any = useContext(FolderContext);
  const { setIsAutoClose, isAutoClose } = useMenuDropdownState();
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [eventClick, setEventClick] = useState<any>(false);
  const [isPasswordLink, setIsPasswordLink] = useState<any>(false);
  const [isMultiplePasswordLink, setIsMultiplePasswordLink] =
    useState<any>(false);

  // get download url
  const [userPackage, setUserPackage] = useState<any>(null);
  const [dataDownloadURL, setDataDownloadURL] = useState<any>(null);
  const handleDownloadUrl = useGetUrlDownload(dataDownloadURL);

  const useDataSetting = useManageSetting();
  const settingKeys = {
    viewMode: "DVMLAGH",
  };

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  const [toggle, setToggle] = useState<any>(null);
  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  const detectResizeWindow = useDetectResizeWindow();
  const { limitScroll, addMoreLimit } = useScroll({
    total: dataFilesAndFoldersForGrid?.total || 0,
    limitData: ITEM_PER_PAGE_GRID,
  });

  const [progressing, setProgressing] = useState<any>(0);
  const [procesing, setProcesing] = useState<any>(true);
  const [showProgressing, setShowProgressing] = useState<any>(false);
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

  /* data for Breadcrumb */
  const breadcrumbData = useBreadcrumbData(
    dataForEvent.data?.path ||
      (dataForEvent.data?.path, dataForEvent.data?.filename),
    "",
  );

  /* for filtered data includes pagination... */
  const [dataFileFilters, setDataFileFilters] = useState<any>({});
  const [dataFolderFilters, setDataFolderFilters] = useState<any>({});
  const [currentFilePage, setCurrentFilePage] = useState<any>(1);
  const [currentFolderPage, _setCurrentFolderPage] = useState<any>(1);

  // const [viewMoreloading, setViewMoreLoading] = useState<any>(null);

  // popup
  const [name, setName] = useState<any>("");
  // const [isOpenMenu, setIsOpenMenu] = useState<any>(false);

  //dialog

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(false);

  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);

  const [fileDetailsDialog, setFileDetailsDialog] = useState<any>(false);

  const [shareDialog, setShareDialog] = useState<any>(false);
  const [shareMultipleDialog, setShareMultipleDialog] = useState<any>(false);

  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const handleGetFolderURLCCTv = useGetUrl(dataForEvent.data);

  useEffect(() => {
    if (folderId) {
      localStorage.removeItem(ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY);
    }
  }, [navigate]);

  const handleOpenPasswordLink = () => {
    setIsPasswordLink(true);
  };
  const handleClosePasswordLink = () => {
    setIsPasswordLink(false);
  };

  const handleOpenMultiplePassword = () => {
    setIsMultiplePasswordLink(true);
  };
  const handleCloseMultiplePassword = () => {
    setIsMultiplePasswordLink(false);
    handleClearMultipleFileData();
  };

  useEffect(() => {
    if (user) {
      const packages = user?.packageId;
      setUserPackage(packages);
    }
  }, [user]);

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
    if (!isCheckAll) {
      handleClearMultipleFileData();
    }
  }, [isCheckAll]);

  useEffect(() => {
    if (!dataSelector?.selectionFileAndFolderData?.length) {
      setIsCheckAll(false);
    }
  }, [dataSelector?.selectionFileAndFolderData]);

  const customGetFolders = () => {
    getFolders({
      variables: {
        where: {
          status: "active",
          pin: 1,
          createdBy: user?._id,
        },
        ...(dataFolderFilters.skip && {
          skip: dataFolderFilters.skip,
        }),
        orderBy: "updatedAt_DESC",
        limit: ITEM_PER_PAGE_LIST,
      },
    });
  };

  const customGetFiles = () => {
    getFiles({
      variables: {
        where: {
          status: "active",
          favorite: 1,
          createdBy: user?._id,
        },
        ...(dataFileFilters.skip && {
          skip: dataFileFilters.skip,
        }),
        orderBy: "updatedAt_DESC",
        limit: ITEM_PER_PAGE_LIST,
      },
    });
  };

  const customGetFilesForGrid = () => {
    getFilesForGrid({
      variables: {
        where: {
          status: "active",
          favorite: 1,
          createdBy: user?._id,
        },
        orderBy: "actionDate_DESC",
        limit: limitScroll,
      },
    });
  };

  useEffect(() => {
    const dataViewMode = useDataSetting.data?.find(
      (data) => data?.productKey === settingKeys.viewMode,
    );

    if (dataViewMode) {
      const localStorageToggled = localStorage.getItem("toggle");
      if (localStorageToggled) {
        setToggle(localStorageToggled === "list" ? "list" : "grid");
      } else {
        setToggle(dataViewMode?.action || "list");
        localStorage.setItem("toggle", dataViewMode?.action || "list");
      }
    }
  }, [useDataSetting.data]);

  useEffect(() => {
    customGetFiles();
  }, [toggle]);

  useEffect(() => {
    customGetFilesForGrid();
  }, [limitScroll, toggle]);

  useEffect(() => {
    if (eventUploadTrigger?.triggerData?.isTriggered) {
      if (toggle === "list") {
        customGetFiles();
      } else {
        customGetFilesForGrid();
      }
    }
  }, [eventUploadTrigger?.triggerData]);

  useEffect(() => {
    if (!_.isEmpty(dataForEvent.data) && dataForEvent.action === "get link") {
      setEventClick("get link");

      const checkPassword = isCheckPassword();
      if (checkPassword) {
        setShowEncryptPassword(true);
      } else {
        handleGetFolderURLCCTv?.(dataForEvent.data);
        setDataForEvent((prev) => {
          return {
            ...prev,
            action: "",
          };
        });
      }
    }
  }, [dataForEvent.action]);

  useEffect(() => {
    if (isAutoClose) {
      resetDataForEvents();
    }
  }, [isAutoClose]);

  /* folders pagination */
  useEffect(() => {
    if (!isFirstRender) {
      setDataFolderFilters((prevState) => {
        const result = {
          ...prevState,
          skip: (currentFolderPage - 1) * ITEM_PER_PAGE_LIST,
        };
        if (currentFolderPage - 1 === 0) {
          delete result.skip;
        }
        return result;
      });
    }
  }, [currentFolderPage]);

  useEffect(() => {
    if (!isFirstRender) {
      // customGetFolders();
    }
  }, [dataFolderFilters]);

  /* files pagination */
  useEffect(() => {
    if (!isFirstRender) {
      setDataFileFilters((prevState) => {
        const result = {
          ...prevState,
          skip: (currentFilePage - 1) * ITEM_PER_PAGE_LIST,
        };
        if (currentFilePage - 1 === 0) {
          delete result.skip;
        }
        return result;
      });
    }
  }, [currentFilePage]);

  useEffect(() => {
    if (!isFirstRender) {
      customGetFiles();
    }
  }, [dataFileFilters]);

  useEffect(() => {
    const queryData = dataFiles?.files?.data;
    if (dataFiles) {
      setDataFilesAndFolders(() => {
        const result = {
          data: dataFiles?.files?.data?.map((data) => ({
            ...data,
            id: data._id,
          })),
          total: dataFiles?.files?.total,
        };
        return result;
      });
    }
    if (queryData !== undefined) {
      if (queryData.length > 0) {
        setIsDataFavoriteFilesFound(true);
      } else {
        setIsDataFavoriteFilesFound(false);
      }
    }
  }, [dataFiles?.files?.data]);

  useEffect(() => {
    const queryData = dataFilesForGrid?.files?.data;
    if (dataFilesForGrid) {
      setDataFilesAndFoldersForGrid(() => {
        const result = {
          data: dataFilesForGrid?.files?.data?.map((data) => ({
            ...data,
            id: data._id,
          })),
          total: dataFilesForGrid?.files?.total,
        };
        return result;
      });
    }
    if (queryData !== undefined) {
      if (queryData.length > 0) {
        setIsDataFavoriteFilesFound(true);
      } else {
        setIsDataFavoriteFilesFound(false);
      }
    }
  }, [dataFilesForGrid?.files?.data]);

  const resetDataForEvents = () => {
    setDataForEvent((state) => ({
      ...state,
      action: null,
      type: null,
    }));
  };

  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.filePassword) {
      checkPassword = true;
    }

    return checkPassword;
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
          if (userPackage?.downLoadOption === "another") {
            handleGetDownloadLink();
          } else {
            await handleDownloadFiles();
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
      case "pin":
        handleAddPin();
        break;
      case "preview":
        setEventClick("preview");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setShowPreview(true);
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

  async function handleSubmitDecryptedPassword() {
    switch (eventClick) {
      case "download":
        handleCloseDecryptedPassword();
        if (userPackage?.downLoadOption === "another") {
          handleGetDownloadLink();
        } else {
          await handleDownloadFiles();
        }

        break;
      case "delete":
        await handleDeleteFilesAndFolders();
        handleCloseDecryptedPassword();
        break;
      case "rename":
        setRenameDialogOpen(true);
        handleCloseDecryptedPassword();
        break;
      case "get link":
        handleGetFolderURLCCTv?.(dataForEvent.data);
        handleCloseDecryptedPassword();
        break;
      case "preview":
        setShowPreview(true);
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
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleViewMore = () => {
    addMoreLimit();
  };

  const handleDownloadFiles = async () => {
    const newFileData = [
      {
        id: dataForEvent.data?._id,
        checkType: "file",
        newPath: dataForEvent.data?.newPath ? dataForEvent.data.newPath : "",
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
          successMessage("Download successful", 2000);

          setDataForEvent((state) => ({
            ...state,
            action: null,
            data: {
              ...state.data,
              totalDownload: dataForEvent.data.totalDownload + 1,
            },
          }));

          if (toggle === "grid") {
            filesRefetchForGrid();
          } else {
            filesRefetch();
          }
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

  const handleDeleteFilesAndFolders = async () => {
    try {
      if (dataForEvent.type === "folder") {
        await updateFolder({
          variables: {
            where: {
              _id: dataForEvent.data._id,
            },
            data: {
              status: "deleted",
              createdBy: user?._id,
            },
          },
          onCompleted: async () => {
            setDeleteDialogOpen(false);
            successMessage("Delete folder successful!!", 2000);
            resetDataForEvents();
            setIsAutoClose(true);
            foldersRefetch({
              variables: {
                where: {
                  status: "active",
                  pin: 1,
                  createdBy: user?._id,
                },
                orderBy: "updatedAt_DESC",
                limit: ITEM_PER_PAGE_LIST,
              },
            });
          },
        });
      } else {
        await manageFile.handleDeleteFile(dataForEvent.data._id, {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            successMessage("Delete file successful", 2000);
            resetDataForEvents();
            if (toggle === "grid") {
              filesRefetchForGrid();
            } else {
              filesRefetch();
            }
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
        await updateFolder({
          variables: {
            where: {
              _id: dataForEvent.data._id,
              checkFolder: dataForEvent.data.checkFolder,
            },
            data: {
              folder_name: name,
              updatedBy: user?._id,
            },
          },
          onCompleted: async () => {
            setIsAutoClose(true);
            customGetFolders();
            setRenameDialogOpen(false);
            successMessage("Update Folder successful", 2000);
            resetDataForEvents();
          },
        });
      } else {
        await manageFile.handleRenameFile({ id: dataForEvent.data._id }, name, {
          onSuccess: async () => {
            setIsAutoClose(true);
            if (toggle === "list") {
              filesRefetch();
            } else {
              filesRefetchForGrid();
            }
            setRenameDialogOpen(false);
            successMessage("Update File successful", 2000);
            resetDataForEvents();
            await handleActionFile("edit");
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

  const handleAddPin = async () => {
    try {
      await updateFolder({
        variables: {
          where: {
            _id: dataForEvent.data._id,
          },
          data: {
            pin: dataForEvent.data.pin ? 0 : 1,
            updatedBy: user?._id,
          },
        },
        onCompleted: async () => {
          setIsAutoClose(true);
          setRenameDialogOpen(false);
          if (dataForEvent.data.pin) {
            successMessage("One File removed from Pin", 2000);
          } else {
            successMessage("One File added to Pin", 2000);
          }
          setDataForEvent((state) => ({
            action: null,
            data: {
              ...state.data,
              pin: dataForEvent.data.pin ? 0 : 1,
            },
          }));
          customGetFolders();
        },
      });
    } catch (error) {
      errorMessage(
        "Sorry!!. Something went wrong. Please try again later!!",
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
          setIsAutoClose(true);
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
          setFileDetailsDialog(false);
          if (toggle === "list") {
            filesRefetch();
          } else {
            filesRefetchForGrid();
          }
        },
        onFailed: (error) => {
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            manageGraphqlError.handleErrorMessage(cutErr) as string,
            3000,
          );
        },
      },
    );
  };

  const handleMultipleFileDataList = (dataId) => {
    const optionValue = dataFilesAndFolders?.data?.find(
      (file) => file?._id === dataId,
    );

    if (optionValue) {
      dispatch(
        checkboxAction.setFileAndFolderData({
          data: {
            id: optionValue?._id,
            name: optionValue?.filename,
            newPath: optionValue?.newPath || "",
            newFilename: optionValue?.newFilename || "",
            totalDownload: optionValue?.totalDownload || 0,
            checkType: "file",
            dataPassword: optionValue?.filePassword || "",
            shortLink: optionValue?.shortUrl,
            createdBy: {
              _id: optionValue?.createdBy?._id,
              newName: optionValue?.createdBy?.newName,
            },
            favorite: optionValue?.favorite === 1 ? true : false,
          },
          toggle,
        }),
      );
    }
  };

  const handleMultipleFileDataGrid = (optionValue) => {
    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: optionValue?._id,
          name: optionValue.filename,
          newFilename: optionValue?.newFilename || "",
          newPath: optionValue?.newPath || "",
          checkType: "file",
          dataPassword: optionValue?.filePassword || "",
          totalDownload: optionValue?.totalDownload || 0,
          shortLink: optionValue?.shortUrl,
          createdBy: {
            _id: optionValue?.createdBy?._id,
            newName: optionValue?.createdBy?.newName,
          },
          favorite: optionValue?.favorite === 1 ? true : false,
        },
        toggle,
      }),
    );
  };

  const handleClearMultipleFileData = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearMultipleFileData();
  }, [dispatch, toggle]);

  useEffect(() => {
    if (dataForEvent.action === "rename") {
      if (dataForEvent.type === "folder") {
        setName(dataForEvent.data.folder_name);
      } else {
        setName(dataForEvent.data.filename);
      }
    }
  }, [dataForEvent.action]);

  const handleFileDetailDialogBreadcrumbFolderNavigate = async (link) => {
    await getFolders({
      variables: {
        where: {
          path: link,
          createdBy: user?._id,
        },
      },
    });
  };

  const handleDeletedUserFromShareOnSave = async (sharedData) => {
    await manageUserFromShare.handleDeletedUserFromShareOnSave(sharedData, {
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
          refetch={loadingFolders || filesRefetch}
        />
      )}

      <DialogCreateMultipleShare
        onClose={() => {
          handleClearMultipleFileData();
          setShareMultipleDialog(false);
        }}
        open={shareMultipleDialog}
        data={dataForEvent.data}
        refetch={loadingFolders || filesRefetch}
        dataSelector={dataSelector?.selectionFileAndFolderData}
      />

      {!_.isEmpty(dataForEvent.data) && (
        <DialogFileDetail
          iconTitle={<MdOutlineFavoriteBorder />}
          breadcrumb={{
            handleFolderNavigate:
              handleFileDetailDialogBreadcrumbFolderNavigate,
          }}
          title="Favourite"
          path={breadcrumbData}
          name={dataForEvent.data.filename || dataForEvent.data.folder_name}
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
          // handleOnClose={(e, reason) => {
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
              handleDownloadOnClick: () => {
                if (userPackage?.downLoadOption === "another") {
                  handleGetDownloadLink();
                } else {
                  handleDownloadFiles();
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
            if (userPackage?.downLoadOption === "another") {
              handleGetDownloadLink();
            } else {
              handleDownloadFiles();
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
          resetDataForEvents();
          setRenameDialogOpen(false);
        }}
        onSave={handleRename}
        title={"Rename file"}
        label={"Rename file"}
        setName={setName}
        defaultValue={dataForEvent.data.filename}
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
          (dataForEvent.data.filename || dataForEvent.data.folder_name) +
          " will be deleted?"
        }
      />

      {showProgressing && (
        <ProgressingBar procesing={procesing} progressing={progressing} />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <MUI.TitleAndSwitch sx={{ my: 2 }}>
          {dataSelector?.selectionFileAndFolderData?.length ? (
            <MenuMultipleSelectionFolderAndFile
              onPressShare={() => {
                setShareMultipleDialog(true);
              }}
              onPressLockData={handleOpenMultiplePassword}
              onPressSuccess={() => {
                if (toggle === "list") {
                  customGetFiles();
                } else {
                  customGetFilesForGrid();
                }
              }}
            />
          ) : (
            <Fragment>
              <MUI.SwitchItem>
                <Typography variant="h4">Favourite</Typography>
              </MUI.SwitchItem>

              {((isDataFavoriteFoldersFound !== null &&
                isDataFavoriteFoldersFound) ||
                (isDataFavoriteFilesFound !== null &&
                  isDataFavoriteFilesFound)) && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MUI.SwitchItem sx={{ mr: 3 }}>
                    {toggle === "list" ? (
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: "1rem",
                          color: "initial !important",
                          fontWeight: "normal !important",
                        }}
                      >
                        {dataFilesAndFolders?.total || 0} Items
                      </Typography>
                    ) : (
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: "1rem",
                          color: "initial !important",
                          fontWeight: "normal !important",
                        }}
                      >
                        {dataFilesAndFoldersForGrid?.total || 0} Items
                      </Typography>
                    )}
                  </MUI.SwitchItem>
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

        <MUI_FAVOURITE.FavouriteContainer>
          {isDataFavoriteFilesFound !== null && isDataFavoriteFilesFound && (
            <>
              <MUI_FAVOURITE.FavouriteList>
                <>
                  <React.Fragment>
                    <MUI_FAVOURITE.FavouriteItem>
                      <Typography variant="h4" fontWeight="bold">
                        Files
                      </Typography>

                      {/* <Checkbox
                        checked={isCheckAll}
                        icon={<CheckBoxOutlineBlankSharpIcon />}
                        checkedIcon={
                          dataFilesAndFoldersForGrid?.data?.length ===
                          dataSelector?.selectionFileAndFolderData?.length ? (
                            <CheckBoxSharpIcon sx={{ color: "#17766B" }} />
                          ) : (
                            <CheckboxMinus sx={{ color: "#17766B" }} />
                          )
                        } 
                        onChange={(e) => {
                          const { checked } = e.target;
                          setIsCheckAll(checked);
                          handleCheckAll(checked);
                        }}
                      /> */}

                      <React.Fragment>
                        {toggle === "grid" && (
                          <Box>
                            {dataFilesLoadingForGrid &&
                            dataFilesAndFoldersForGrid?.data?.length ? (
                              <CardSkeleton />
                            ) : (
                              <FileCardContainer>
                                <>
                                  {dataFilesAndFoldersForGrid?.data?.map(
                                    (data, index) => {
                                      return (
                                        <FileCardItem
                                          cardProps={{
                                            onDoubleClick: () => {
                                              setDataForEvent({
                                                action: "preview",
                                                data,
                                              });
                                            },
                                          }}
                                          imagePath={
                                            user?.newName +
                                            "-" +
                                            user?._id +
                                            "/" +
                                            (data?.newPath
                                              ? removeFileNameOutOfPath(
                                                  data?.newPath,
                                                )
                                              : "") +
                                            data?.newFilename
                                          }
                                          user={user}
                                          id={data?._id}
                                          filePassword={data?.filePassword}
                                          isCheckbox={true}
                                          favouriteIcon={{
                                            isShow: false,
                                            handleFavouriteOnClick:
                                              async () => {
                                                setDataForEvent({
                                                  data,
                                                  action: "favourite",
                                                });
                                              },
                                            isFavourite: true,
                                          }}
                                          handleSelect={() =>
                                            handleMultipleFileDataGrid(data)
                                          }
                                          fileType={
                                            data.checkTypeItem === "folder"
                                              ? "folder"
                                              : getShortFileTypeFromFileType(
                                                  data.fileType,
                                                )
                                          }
                                          name={data.filename}
                                          key={index}
                                          menuItems={menuItems?.map(
                                            (menuItem, index) => {
                                              return (
                                                <MenuDropdownItem
                                                  isFavorite={
                                                    data.favorite ? true : false
                                                  }
                                                  isPassword={
                                                    data.filePassword
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
                                            },
                                          )}
                                        />
                                      );
                                    },
                                  )}
                                </>
                              </FileCardContainer>
                            )}
                          </Box>
                        )}
                        {toggle === "list" && (
                          <>
                            {dataFilesLoadingForList &&
                            dataFilesAndFolders.data ? (
                              <ListSkeleton />
                            ) : (
                              <FavouriteFileDataGrid
                                pagination={{
                                  total: Math.ceil(
                                    dataFilesAndFolders.total /
                                      ITEM_PER_PAGE_LIST,
                                  ),
                                  currentPage: currentFilePage,
                                  setCurrentPage: setCurrentFilePage,
                                }}
                                data={dataFilesAndFolders.data}
                                total={dataFilesAndFolders.total}
                                dataSelector={dataSelector}
                                handleEvent={(action, data) => {
                                  setDataForEvent({
                                    action,
                                    data,
                                  });
                                }}
                                handleSelection={handleMultipleFileDataList}
                              />
                            )}
                          </>
                        )}
                      </React.Fragment>
                    </MUI_FAVOURITE.FavouriteItem>
                  </React.Fragment>
                </>
                {!detectResizeWindow.canBeScrolled &&
                  limitScroll < dataFilesForGrid?.files?.total &&
                  toggle === "grid" && (
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          position: "relative",
                        }}
                      >
                        <Button
                          endIcon={<ExpandMore />}
                          sx={{ mt: 2 }}
                          // disabled={loading === "loading"}
                          size="small"
                          variant="outlined"
                          onClick={handleViewMore}
                        >
                          Load more
                        </Button>
                      </Box>
                    </Box>
                  )}
              </MUI_FAVOURITE.FavouriteList>
            </>
          )}
          {
            /* isDataFavoriteFoldersFound !== null &&
          !isDataFavoriteFoldersFound && */
            isDataFavoriteFilesFound !== null && !isDataFavoriteFilesFound && (
              <Empty
                icon={<FavouriteEmpty />}
                title="No Favourite files"
                context="Add favourite to things that you want to easily find later"
              />
            )
          }
        </MUI_FAVOURITE.FavouriteContainer>
      </Box>

      <DialogCreateFilePassword
        isOpen={isPasswordLink}
        dataValue={dataForEvent.data}
        filename={dataForEvent.data?.filename}
        isUpdate={dataForEvent.data?.filePassword ? true : false}
        checkType="file"
        onConfirm={() => {
          if (toggle === "list") {
            filesRefetch();
          } else {
            filesRefetchForGrid();
          }
        }}
        onClose={handleClosePasswordLink}
      />

      <DialogCreateMultipleFilePassword
        isOpen={isMultiplePasswordLink}
        checkType="file"
        onConfirm={() => {
          if (toggle === "list") {
            filesRefetch();
          } else {
            filesRefetchForGrid();
          }
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
    </Fragment>
  );
}

export default FavouriteFile;
