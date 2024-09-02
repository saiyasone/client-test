import { useLazyQuery, useMutation } from "@apollo/client";
// import material ui
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { BiTime } from "react-icons/bi";
// components
import ShareWithMeEmpty from "assets/images/empty/share-with-me-empty.svg?react";
import { Base64 } from "js-base64";
import _ from "lodash";
import moment from "moment";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Snackbar from "../../../components/Notification";

import {
  MUTATION_ACTION_FILE,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import { MUTATION_CREATE_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import { MUTATION_DELETE_SHARE, QUERY_SHARE } from "api/graphql/share.graphql";
import Empty from "components/Empty";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import FolderGridItem from "components/FolderGridItem";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SwitchPages from "components/SwitchPage";
import DialogCreateFileDrop from "components/dialog/DialogCreateFileDrop";
import DialogCreateMultipleFilePassword from "components/dialog/DialogCreateMultipleFilePassword";
import DialogCreateMultipleShare from "components/dialog/DialogCreateMultipleShare";
import DialogCreateShare from "components/dialog/DialogCreateShare";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFile from "components/dialog/DialogPreviewFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import {
  shareWithMeFileMenuItems,
  shareWithMeFolderMenuItems,
} from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useScroll from "hooks/useScroll";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import * as MUI from "styles/clientPage.style";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getFolderName,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import useAuth from "../../../hooks/useAuth";
import useBreadcrumbData from "../../../hooks/useBreadcrumbData";
import ShareWithMeDataGrid from "./ShareWithMeDataGrid";
import * as MUI_CLOUD from "./styles/shareWithMe.style";

function ShareWithMe() {
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const [toggle, setToggle] = useState<any>("list");
  const [notification, setNotification] = useState<any>(false);
  const [getShareMe, { refetch: refetchShare }] = useLazyQuery(QUERY_SHARE, {
    fetchPolicy: "no-cache",
  });

  const manageFile = useManageFile({ user });

  const [getFolders] = useLazyQuery(QUERY_FOLDER, { fetchPolicy: "no-cache" });
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [deleteShareFileAndFolder] = useMutation(MUTATION_DELETE_SHARE, {
    fetchPolicy: "no-cache",
  });
  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER, {
    refetchQueries: [QUERY_FOLDER],
  });

  const [listShareMe, setListShareMe] = useState<any>(null);
  const manageGraphqlError = useManageGraphqlError();
  const { setFolderId }: any = useContext(FolderContext);

  const [name, setName] = useState<any>("");
  const [_checked, setChecked] = useState<any>({});
  const [multiSelectId, setMultiSelectId] = useState<any>([]);
  const [multiChecked, setMultiChecked] = useState<any>([]);
  const [isOpenMenu, setIsOpenMenu] = useState<any>(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    action: null,
    data: {},
  });

  const manageUserFromShare = useManageUserFromShare({
    inputFileOrFolder: useMemo(
      () => ({
        ...dataForEvent.data,
        ...(dataForEvent.data?.folderId?._id && {
          _id: dataForEvent.data?.folderId?._id,
        }),
        ...(dataForEvent.data?.fileId?._id && {
          _id: dataForEvent.data?.fileId?._id,
        }),
      }),
      [dataForEvent.data],
    ),
    inputType: dataForEvent.data?.folderId?.folder_type,
    user,
    toAccount: user.email,
  });

  const [folderDrop, setFolderDrop] = useState<any>("");

  //dialog
  const [fileDetailsOpen, setFileDetailsOpen] = useState<any>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);
  const { setIsAutoClose } = useMenuDropdownState();
  const [shareDialog, setShareDialog] = useState<any>(false);
  const [showPreview, setShowPreview] = useState<any>(false);
  const [shareData, setShareData] = useState<any>(null);
  const [total, setTotal] = useState<any>(0);
  const { limitScroll } = useScroll({ total, limitData: 0 });
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [isFiledrop, setIsFiledrop] = useState<any>(false);
  const handleFileAndFolderURL = useGetUrl(dataForEvent.data);
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [eventClick, setEventClick] = useState<any>(false);
  const [filePassword, setFilePassword] = useState<any>("");
  const [userPackage, setUserPackage] = useState<any>(null);

  // multiple functions
  const [isMultiplePasswordLink, setIsMultiplePasswordLink] =
    useState<any>(false);
  const [shareMultipleDialog, setShareMultipleDialog] = useState<any>(false);

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  const closeNotification = () => {
    setNotification(false);
  };

  const handleCloseFileDrop = () => {
    setIsFiledrop(false);
    resetDataForEvents();
  };

  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.fileId?._id) {
      if (dataForEvent.data?.fileId?.filePassword) {
        checkPassword = true;
      }
    } else {
      if (dataForEvent.data?.folderId?.access_password) {
        checkPassword = true;
      }
    }

    return checkPassword;
  };

  async function handleSubmitDecryptedPassword() {
    setFilePassword("");
    switch (eventClick) {
      case "download":
        if (userPackage?.downLoadOption === "another") {
          handleCloseDecryptedPassword();
          handleGetDownloadLink();
        } else {
          handleCloseDecryptedPassword();
          handleDownloadFileAndFolder();
        }
        break;
      case "delete":
        await handleCloseDecryptedPassword();
        await handleDeleteShare();
        break;
      case "rename":
        handleCloseDecryptedPassword();
        setRenameDialogOpen(true);
        break;
      case "double click":
        handleCloseDecryptedPassword();
        handleOpenFolder(dataForEvent.data);
        break;
      case "get link":
        {
          let _id = "";
          if (dataForEvent.data?.fileId?._id) {
            _id = dataForEvent.data.fileId?._id;
          } else {
            _id = dataForEvent.data.folderId?._id;
          }
          handleCloseDecryptedPassword();
          handleFileAndFolderURL?.({ ...dataForEvent.data, _id });
        }
        break;
      case "preview":
        handleCloseDecryptedPassword();
        setShowPreview(true);
        break;
      case "detail":
        handleCloseDecryptedPassword();
        setFileDetailsOpen(true);
        break;
      case "share":
        handleCloseDecryptedPassword();
        setShareDialog(true);
        break;
      case "filedrop":
        handleCloseDecryptedPassword();
        setFolderDrop(dataForEvent.data?._id);
        setIsFiledrop(true);
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

  const handleCreateFileDrop = async (link, date) => {
    try {
      const result = await createFileDropLink({
        variables: {
          input: {
            url: link,
            expiredAt: date,
            folderId: folderDrop,
          },
        },
      });

      if (result.data?.createPrivateFileDropUrl?._id) {
        handleCloseFileDrop();
      }
    } catch (error) {
      errorMessage("Something went wrong, please try again", 3000);
    }
  };

  const resetDataForEvents = () => {
    setDataForEvent((state) => ({
      ...state,
      action: "",
      data: {},
    }));
  };

  const handleCloseMultiplePassword = () => {
    setIsMultiplePasswordLink(false);
  };

  const handleMultipleData = (selected, item) => {
    const valueOption = item?.find((el) => el?._id === selected);

    const dataName =
      valueOption?.fileId?.filename || valueOption?.folderId?.folder_name;
    const newFilename = valueOption?.fileId?._id
      ? valueOption?.fileId?.newFilename
      : valueOption?.folderId?.newFolder_name;
    const newPath =
      valueOption?.fileId?.newPath || valueOption?.folderId?.newPath;

    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: valueOption?._id,
          dataId: valueOption?.fileId?._id || valueOption?.folderId?._id,
          name: dataName,
          checkType: valueOption?.fileId?._id ? "file" : "folder",
          permission: valueOption?.permission,
          newFilename,
          newPath,
          dataPassword:
            valueOption?.fileId?.filePassword ||
            valueOption?.folderId?.access_password,
          createdBy: {
            _id: valueOption?.fromAccount?._id,
            newName: valueOption?.fromAccount?.newName,
          },
          toAccount: valueOption?.toAccount,
          share: {
            _id: valueOption?._id,
            isFromShare: valueOption?.isShare === "yes" ? true : false,
          },
        },
        toggle,
      }),
    );
  };

  const handleClearSelection = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearSelection();
  }, [dispatch, toggle, location]);

  useEffect(() => {
    const toggled = localStorage.getItem("toggle");
    if (toggled) {
      setToggle(toggled === "list" ? "list" : "grid");
    } else {
      setToggle("list");
      localStorage.setItem("toggle", "list");
    }
  }, []);

  useEffect(() => {
    if (!_.isEmpty(dataForEvent.data) && dataForEvent.action === "get link") {
      const checkPassword = isCheckPassword();

      if (checkPassword) {
        setShowEncryptPassword(true);
      } else {
        let _id = "";
        let shortUrl = "";
        if (dataForEvent.data?.fileId?._id) {
          _id = dataForEvent.data.fileId?._id;
          shortUrl = dataForEvent.data.fileId?.shortUrl;
        } else {
          _id = dataForEvent.data.folderId?._id;
          shortUrl = dataForEvent.data.folderId?.shortUrl;
        }
        handleFileAndFolderURL?.({ ...dataForEvent.data, shortUrl, _id });
        setDataForEvent({
          action: "",
          data: {},
        });
      }
    }
  }, [dataForEvent.action]);

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
    let _id = "";
    let shortUrl = "";
    if (dataForEvent.data?.fileId?._id) {
      _id = dataForEvent.data.fileId?._id;
      shortUrl = dataForEvent.data.fileId?.shortUrl;
    } else {
      _id = dataForEvent.data.folderId?._id;
      shortUrl = dataForEvent.data.folderId?.shortUrl;
    }
    setDataDownloadURL({ ...dataForEvent.data, shortUrl, _id });
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  useEffect(() => {
    if (user) {
      const packages = user?.packageId;
      setUserPackage(packages);
    }
  }, [user]);

  useEffect(() => {
    if (dataForEvent.action) {
      if (dataForEvent?.data?.folderId?.folder_type) {
        setName(dataForEvent.data.folderId.folder_name);
      } else {
        setName(dataForEvent.data.fileId.filename);
      }
    }
  }, [dataForEvent.action]);

  useEffect(() => {
    if (dataForEvent.action && dataForEvent.data) {
      if (dataForEvent.data?.folderId?._id) {
        if (dataForEvent.data.folderId?.access_password) {
          setFilePassword(dataForEvent.data.folderId.access_password);
        }
      } else {
        if (dataForEvent.data.fileId?.filePassword) {
          setFilePassword(dataForEvent.data.fileId.filePassword);
        }
      }
      menuOnClick(dataForEvent.action);
    }
  }, [dataForEvent.action]);

  useEffect(() => {
    if (eventUploadTrigger.triggerData.isTriggered) {
      queryGetShare();
    }
  }, [eventUploadTrigger.triggerData]);

  // checked file pagination;
  let countPage = 1;
  const rowPerpage = 20;
  for (let i = 1; i <= Math.ceil(total / rowPerpage); i++) {
    countPage = i;
  }

  const queryGetShare = async () => {
    await getShareMe({
      variables: {
        where: {
          parentKey: 0,
          toAccount: user?.email,
          status: "active",
          isShare: "yes",
        },
        orderBy: "updatedAt_DESC",
        limit: toggle === "grid" ? limitScroll : rowPerpage,
        skip: toggle === "grid" ? null : rowPerpage * (currentPage - 1),
      },
      onCompleted: async (data) => {
        const queryData = data?.getShare?.data;
        const queryTotal = data?.getShare?.total;
        if (queryTotal > 0) {
          setTotal(queryTotal);
          setListShareMe(() => {
            const result = manageFile.splitDataByDate(queryData, "createdAt");
            return result.map((recentFiles) => {
              return {
                ...recentFiles,
                data: recentFiles.data.map((data) => ({
                  id: data._id,
                  ...data,
                })),
              };
            });
          });
        }
        if (queryTotal > 0) {
          setShareData(true);
        } else {
          setShareData(false);
        }
      },
    });
  };

  useEffect(() => {
    queryGetShare();
  }, [limitScroll, currentPage, toggle, countPage]);

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
            handleDownloadFileAndFolder();
          }
        }
        break;
      case "delete":
        setEventClick("delete");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          await handleDeleteShare();
          await setDataForEvent((prev) => {
            return {
              ...prev,
              action: "",
            };
          });
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
      case "get link":
        setEventClick("get link");
        // await handleGetLink();
        break;
      case "detail":
        setEventClick("detail");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFileDetailsOpen(true);
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

      case "double click":
        setEventClick("double click");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          handleOpenFolder(dataForEvent.data);
        }
        break;
      case "filedrop":
        setEventClick("filedrop");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFolderDrop(dataForEvent.data?._id);
          setIsFiledrop(true);
        }
        break;
      case "pin":
        handleAddPin();
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    if (!renameDialogOpen) {
      resetDataForEvents();
    }
  }, [renameDialogOpen]);

  const handleClickFolder = (e, value) => {
    if (e.ctrlKey && !multiChecked.includes(value?._id)) {
      setMultiChecked([...multiChecked, value?._id]);
      setMultiSelectId([...multiSelectId, value]);
    } else {
      setMultiChecked(multiChecked.filter((id) => id !== value?._id));
      setMultiSelectId(multiSelectId.filter((id) => id?._id !== value?._id));
    }

    setChecked(value?._id);
  };

  const handleOpenFolder = (value) => {
    setFolderId(value?._id);
    const base64URL = Base64.encodeURI(value?.folderId?._id);
    navigate(`/folder/share/${base64URL}`);
  };

  /* data for Breadcrumb */
  const breadcrumbData = useBreadcrumbData(
    dataForEvent.data?.fileId?.path !== null ||
      (dataForEvent.data?.fileId.path, dataForEvent.data?.fileId?.filename),
    "",
  );

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
      navigate(`/folder/share/${base64URL}`);
    }
  };

  const handleDownloadFileAndFolder = async () => {
    // setShowProgressing(true);
    // setProcesing(true);

    const dataId =
      dataForEvent.data?.folderId?._id || dataForEvent.data?.fileId?._id;

    const dataNewPath =
      dataForEvent.data?.folderId?.newPath ||
      dataForEvent.data?.fileId?.newPath;

    const dataNewFilename =
      dataForEvent.data?.folderId?.newFolder_name ||
      dataForEvent.data?.fileId?.newFilename;

    const checkType = dataForEvent.data?.folderId?._id ? "folder" : "file";
    const createdBy = dataForEvent.data?.ownerId;
    const newFileData = [
      {
        id: dataId,
        newPath: dataNewPath || "",
        newFilename: dataNewFilename,
        createdBy,
        checkType,
      },
    ];

    await manageFile.handleMultipleDownloadFileAndFolder(
      {
        isShare: true,
        multipleData: newFileData,
      },
      {
        onSuccess: () => {
          resetDataForEvents();
          setFileDetailsOpen(false);
          setIsAutoClose(false);
          setShowPreview(false);
          successMessage("Download successful", 3000);
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },
      },
    );
  };

  const handleRename = async () => {
    setIsAutoClose(true);
    try {
      if (dataForEvent?.data?.folderId?.folder_type) {
        const update = await updateFolder({
          variables: {
            where: {
              _id: parseInt(dataForEvent.data.folderId?._id),
              checkFolder: dataForEvent.data.folderId?.checkFolder,
            },
            data: {
              folder_name: name,
            },
          },
        });

        if (update?.data?.updateFolders?._id) {
          resetDataForEvents();
          queryGetShare();
          setRenameDialogOpen(false);
          successMessage("Update success", 3000);
        }
      } else {
        await manageFile.handleRenameFile(
          { id: dataForEvent.data?.fileId._id },
          name,
          {
            onSuccess: async () => {
              setRenameDialogOpen(false);
              successMessage("Update File successful", 2000);
              await handleActionFile("edit");
              resetDataForEvents();
              queryGetShare();
              setIsAutoClose(true);
            },
          },
        );
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

  // pin foloder
  const handleAddPin = async () => {
    try {
      const folderPin = await updateFolder({
        variables: {
          where: {
            _id: dataForEvent.data.folderId._id,
          },
          data: {
            pin: dataForEvent.data.folderId.pin ? 0 : 1,
            updatedBy: user?._id,
          },
        },
        onCompleted: async (data) => {
          if (data.updateFolders?._id) {
            resetDataForEvents();
            queryGetShare();
          }
          if (dataForEvent.data?.folderId?.pin) {
            setTimeout(() => {
              successMessage("One folder removed from Pin", 2000);
            }, 100);
          } else {
            successMessage("One folder added to Pin", 2000);
          }
        },
      });

      if (folderPin?.data?.updateFolders?._id) {
        refetchShare();
        setIsAutoClose(true);
      }

      setIsAutoClose(true);
    } catch (error) {
      errorMessage(
        "Sorry!!. Something went wrong. Please try again later!!",
        2000,
      );
    }
  };

  const handleMultipleDeleteShare = async () => {
    try {
      await dataSelector?.selectionFileAndFolderData?.map(async (item) => {
        await deleteShareFileAndFolder({
          variables: {
            id: item?.id,
            email: item?.toAccount?.email,
          },

          onCompleted: () => {
            queryGetShare();
          },
        });
      });

      await handleClearSelection();
      await successMessage("Multiple share deleted successfully", 3000);
    } catch (error: any) {
      errorMessage(error, 3000);
      errorMessage("Sorry! Something went wrong. Please try again!", 3000);
    }
  };

  const handleDeleteShare = async () => {
    try {
      await deleteShareFileAndFolder({
        variables: {
          id: dataForEvent.data?._id,
          email: dataForEvent.data?.toAccount?.email,
        },

        onCompleted: async () => {
          if (dataForEvent.data?.folderId?._id) {
            successMessage("Delete folder successful !", 2000);
          } else {
            successMessage("Delete file successful !", 2000);
          }
          queryGetShare();
        },
      });
    } catch (error: any) {
      errorMessage(error, 3000);
      errorMessage("Sorry! Something went wrong. Please try again!", 3000);
    }
  };

  // favourite function
  const handleAddFavourite = async () => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: parseInt(dataForEvent.data.fileId._id),
          },
          data: {
            favorite: dataForEvent.data.fileId?.favorite ? 0 : 1,
          },
        },
        onCompleted: async () => {
          setRenameDialogOpen(false);
          if (dataForEvent.data.fileId.favorite) {
            successMessage("One File removed from Favourite", 2000);
          } else {
            successMessage("One File added to Favourite", 2000);
          }
          setDataForEvent((state) => ({
            action: null,
            data: {
              ...state.data,
              fileId: {
                ...state.data.fileId,
                favorite: dataForEvent.data.fileId?.favorite ? 0 : 1,
              },
            },
          }));
          queryGetShare();
          setIsAutoClose(true);
        },
      });
    } catch (error) {
      errorMessage(
        "Sorry!!. Something went wrong. Please try again later!!",
        2000,
      );
    }
  };

  // File action for count in recent file
  const handleActionFile = async (val) => {
    try {
      const action = await fileAction({
        variables: {
          fileInput: {
            createdBy: parseInt(dataForEvent.data.fromAccount._id),
            fileId: parseInt(dataForEvent.data.fileId?._id),
            actionStatus: val,
          },
        },
      });

      if (action?.data?.actionFiles) {
        refetchShare();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletedUserFromShareOnSave = async (deletedUsers) => {
    await manageUserFromShare.handleDeletedUserFromShareOnSave(deletedUsers, {
      onSuccess: () => {
        setDataForEvent((prevState) => ({ ...prevState }));
        queryGetShare();
        successMessage("Deleted user out of share successful!!", 2000);
        handleShareClose();
      },
    });
  };

  const handleShareClose = () => {
    resetDataForEvents();
    setShareDialog(false);
  };

  return (
    <Fragment>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <MUI.TitleAndSwitch sx={{ my: 2 }}>
          {dataSelector?.selectionFileAndFolderData?.length > 0 ? (
            <MenuMultipleSelectionFolderAndFile
              isShare={true}
              onPressSuccess={() => {
                handleClearSelection();
                queryGetShare();
              }}
              onPressDeleteShare={handleMultipleDeleteShare}
              onPressShare={() => {
                setShareMultipleDialog(true);
              }}
            />
          ) : (
            <Fragment>
              <MUI.SwitchItem>
                <Typography variant="h4">Shared with me</Typography>
              </MUI.SwitchItem>
              {shareData !== null && shareData && (
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
                    toggle={toggle}
                    setToggle={setToggle}
                  />
                </Box>
              )}
            </Fragment>
          )}
        </MUI.TitleAndSwitch>

        {shareData && (
          <MUI_CLOUD.DivCloud>
            {listShareMe?.length && (
              <Fragment>
                {listShareMe?.map((listItem, index) => {
                  return (
                    <Fragment key={index}>
                      {listItem?.data?.length > 0 && (
                        <Fragment>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ mb: 2, mt: "25px" }}
                          >
                            {listItem.data ? listItem.title : ""}
                          </Typography>
                          {toggle === "list" && (
                            <Fragment>
                              <ShareWithMeDataGrid
                                pagination={{
                                  countTotal: total,
                                  countPage: countPage,
                                  currentPage: currentPage,
                                  setCurrentPage: setCurrentPage,
                                }}
                                data={listItem.data}
                                dataSelector={dataSelector}
                                handleEvent={(action, data) => {
                                  if (action === "get link") {
                                    setDataForEvent({
                                      action,
                                      data: {
                                        ...data,
                                        _id:
                                          data?.fileId?._id ||
                                          data?.folderId?._id,
                                      },
                                    });
                                  } else {
                                    setDataForEvent({
                                      action,
                                      data,
                                    });
                                  }
                                }}
                                onDoubleClick={(data) => {
                                  setDataForEvent({
                                    data,
                                    action: "double click",
                                  });
                                }}
                                handleSelection={(data) => {
                                  handleMultipleData(data, listItem.data);
                                }}
                              />
                            </Fragment>
                          )}
                          {toggle === "grid" && (
                            <FileCardContainer>
                              {listItem?.data?.map((data, index) => {
                                if (data?.folderId?.folder_type) {
                                  return (
                                    <Fragment key={index}>
                                      <FolderGridItem
                                        file_id={
                                          data?.folderId._id ? true : false
                                        }
                                        folderId={
                                          data?.folderId._id ? true : false
                                        }
                                        id={data?._id}
                                        folder_name={data?.folderId.folder_name}
                                        setIsOpenMenu={setIsOpenMenu}
                                        isOpenMenu={isOpenMenu}
                                        isPinned={
                                          data?.folderId.pin ? true : false
                                        }
                                        key={index}
                                        onOuterClick={() => {
                                          setMultiChecked(multiChecked);
                                          setChecked({});
                                        }}
                                        handleSelectionFolder={(dataId) => {
                                          handleMultipleData(
                                            dataId,
                                            listItem?.data,
                                          );
                                        }}
                                        cardProps={{
                                          onClick: (e) => {
                                            handleMultipleData(
                                              data?._id,
                                              listItem?.data,
                                            );
                                            handleClickFolder(e, data);
                                          },
                                          onDoubleClick: () => {
                                            setDataForEvent({
                                              data,
                                              action: "double click",
                                            });
                                          },
                                          ...(multiChecked.find(
                                            (id) => id === data?.folderId?._id,
                                          ) && {
                                            ischecked: true,
                                          }),
                                          ...(dataSelector?.selectionFileAndFolder?.find(
                                            (el) =>
                                              el?.id === data?.folderId?._id,
                                          ) && {
                                            ishas: "true",
                                          }),
                                        }}
                                        menuItem={shareWithMeFolderMenuItems.map(
                                          (menuItem, index) => {
                                            const isShareAction =
                                              menuItem.action === "share" ||
                                              menuItem.action === "get link" ||
                                              menuItem.action === "download";
                                            const isCanEdit =
                                              data?.permission === "edit";
                                            return (
                                              <MenuDropdownItem
                                                {...{
                                                  ...(isShareAction &&
                                                    !isCanEdit && {
                                                      disabled: true,
                                                      sx: {
                                                        cursor:
                                                          "default !important",
                                                      },
                                                    }),
                                                }}
                                                className="menu-item"
                                                isPinned={
                                                  data?.folderId?.pin
                                                    ? true
                                                    : false
                                                }
                                                key={index}
                                                title={menuItem.title}
                                                icon={menuItem.icon}
                                                {...{
                                                  ...(isShareAction
                                                    ? {
                                                        ...(isCanEdit && {
                                                          onClick: () => {
                                                            if (
                                                              menuItem.action ===
                                                              "get link"
                                                            ) {
                                                              setDataForEvent({
                                                                action:
                                                                  menuItem.action,
                                                                data: {
                                                                  ...data,
                                                                  _id:
                                                                    data?.fileId
                                                                      ?._id ||
                                                                    data
                                                                      ?.folderId
                                                                      ?._id,
                                                                },
                                                              });
                                                            } else {
                                                              setDataForEvent({
                                                                action:
                                                                  menuItem.action,
                                                                data,
                                                              });
                                                            }
                                                          },
                                                        }),
                                                      }
                                                    : {
                                                        onClick: () => {
                                                          if (
                                                            menuItem.action ===
                                                            "get link"
                                                          ) {
                                                            setDataForEvent({
                                                              action:
                                                                menuItem.action,
                                                              data: {
                                                                ...data,
                                                                _id:
                                                                  data?.fileId
                                                                    ?._id ||
                                                                  data?.folderId
                                                                    ?._id,
                                                              },
                                                            });
                                                          } else {
                                                            setDataForEvent({
                                                              action:
                                                                menuItem.action,
                                                              data,
                                                            });
                                                          }
                                                        },
                                                      }),
                                                }}
                                              />
                                            );
                                          },
                                        )}
                                      />
                                    </Fragment>
                                  );
                                }

                                // Files
                                else {
                                  if (data?.fileId?.filename) {
                                    return (
                                      <FileCardItem
                                        key={index}
                                        id={data?._id}
                                        path={data?.fileId?.path}
                                        name={data?.fileId?.filename}
                                        filePassword={
                                          data?.fileId?.filePassword
                                        }
                                        isCheckbox={true}
                                        cardProps={{
                                          onDoubleClick: () => {
                                            setDataForEvent({
                                              action: "preview",
                                              data: {
                                                ...data,
                                                _id: data?.fileId?._id,
                                              },
                                            });
                                          },
                                        }}
                                        handleSelect={(dataId) => {
                                          handleMultipleData(
                                            dataId,
                                            listItem?.data,
                                          );
                                        }}
                                        imagePath={
                                          data.ownerId?.newName +
                                          "-" +
                                          data.ownerId?._id +
                                          "/" +
                                          (data?.fileId?.newPath
                                            ? removeFileNameOutOfPath(
                                                data?.fileId?.newPath,
                                              )
                                            : "") +
                                          data?.fileId?.newFilename
                                        }
                                        user={user}
                                        fileType={getFolderName(
                                          data?.fileId.fileType,
                                        )}
                                        menuItems={shareWithMeFileMenuItems.map(
                                          (menuItem, index) => {
                                            const isShareAction =
                                              menuItem.action === "share" ||
                                              menuItem.action === "get link" ||
                                              menuItem.action === "download";
                                            const isCanEdit =
                                              data?.permission === "edit";
                                            return (
                                              <MenuDropdownItem
                                                {...{
                                                  ...(isShareAction &&
                                                    !isCanEdit && {
                                                      disabled: true,
                                                      sx: {
                                                        cursor:
                                                          "default !important",
                                                      },
                                                    }),
                                                }}
                                                isFavorite={
                                                  data?.fileId?.favorite
                                                    ? true
                                                    : false
                                                }
                                                {...{
                                                  ...(isShareAction
                                                    ? {
                                                        ...(isCanEdit && {
                                                          onClick: () => {
                                                            if (
                                                              menuItem.action ===
                                                                "get link" ||
                                                              menuItem.action ===
                                                                "share"
                                                            ) {
                                                              const dataItem = {
                                                                ...data,
                                                                _id: data
                                                                  ?.fileId?._id,
                                                              };

                                                              setDataForEvent({
                                                                action:
                                                                  menuItem.action,
                                                                data: dataItem,
                                                              });
                                                            } else {
                                                              setDataForEvent({
                                                                action:
                                                                  menuItem.action,
                                                                data,
                                                              });
                                                            }
                                                          },
                                                        }),
                                                      }
                                                    : {
                                                        onClick: () => {
                                                          setDataForEvent({
                                                            action:
                                                              menuItem.action,
                                                            data,
                                                          });
                                                        },
                                                      }),
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
                                  }
                                }
                              })}
                            </FileCardContainer>
                          )}

                          {/* {limitScroll < total && toggle !== "list" && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 3,
                              }}
                            >
                              <LinearProgress />
                            </Box>
                          )} */}
                        </Fragment>
                      )}
                    </Fragment>
                  );
                })}
              </Fragment>
            )}

            {shareDialog && (
              <DialogCreateShare
                onDeletedUserFromShareSave={handleDeletedUserFromShareOnSave}
                sharedUserList={manageUserFromShare.sharedUserList}
                onClose={handleShareClose}
                open={shareDialog}
                data={{
                  ...dataForEvent.data,
                  _id:
                    dataForEvent.data?.folderId?._id ||
                    dataForEvent.data?.fileId?._id,
                  folder_name: dataForEvent.data?.folderId?.folder_name,
                  folder_type: dataForEvent.data?.folderId?.folder_type,
                  name:
                    dataForEvent.data?.fileId?.filename ||
                    dataForEvent.data?.folderId?.folder_name,
                  ownerId: dataForEvent.data?.ownerId,
                  shortUrl:
                    dataForEvent?.data?.folderId?.folder_type === "folder"
                      ? dataForEvent.data?.folderId?.shortUrl
                      : dataForEvent.data?.fileId?.shortUrl,
                }}
                share={{
                  isFromShare:
                    dataForEvent.data.isShare === "yes" ? true : false,
                  _id: dataForEvent.data.id,
                }}
                ownerId={dataForEvent.data?.ownerId}
                refetch={refetchShare}
                handleClose={() => {
                  resetDataForEvents();
                  setShareDialog(false);
                }}
              />
            )}
            <DialogRenameFile
              open={renameDialogOpen}
              onClose={() => {
                setRenameDialogOpen(false);
              }}
              onSave={handleRename}
              {...{
                ...(dataForEvent?.data?.folderId?.folder_type && {
                  title: "Rename Folder",
                  label: "Rename Folder",
                }),
                ...(!dataForEvent?.data?.folderId?.folder_type && {
                  title: "Rename File",
                  label: "Rename File",
                }),
              }}
              isFolder={
                dataForEvent?.data?.folderId?.folder_type === "folder"
                  ? true
                  : false
              }
              defaultValue={
                dataForEvent?.data?.folderId?.folder_type === "folder"
                  ? dataForEvent.data.folderId?.folder_name
                  : dataForEvent.data.fileId?.filename
              }
              name={name}
              setName={setName}
            />
            {showPreview && (
              <DialogPreviewFile
                open={showPreview}
                handleClose={() => {
                  setShowPreview(false);
                  resetDataForEvents();
                }}
                onClick={() => {
                  if (userPackage?.downLoadOption === "another") {
                    handleGetDownloadLink();
                  } else {
                    handleDownloadFileAndFolder();
                  }
                }}
                filename={dataForEvent.data.fileId?.filename}
                newFilename={dataForEvent.data.fileId?.newFilename}
                fileType={dataForEvent.data.fileId?.fileType}
                path={dataForEvent.data.fileId?.newPath}
                user={dataForEvent.data?.ownerId}
                permission={dataForEvent?.data?.permission}
              />
            )}

            {!_.isEmpty(dataForEvent.data.fileId?._id) && fileDetailsOpen && (
              <DialogFileDetail
                iconTitle={<BiTime />}
                title="Share with me"
                path={breadcrumbData}
                name={dataForEvent?.data?.fileId?.filename}
                breadcrumb={{
                  handleFolderNavigate:
                    handleFileDetailDialogBreadcrumbFolderNavigate,
                }}
                type={getShortFileTypeFromFileType(
                  dataForEvent.data?.fileId?.fileType,
                )}
                displayType={dataForEvent.data?.fileId?.fileType}
                size={convertBytetoMBandGB(dataForEvent.data.fileId?.size)}
                dateAdded={moment(dataForEvent.data.fileId?.createdAt).format(
                  "D MMM YYYY, h:mm A",
                )}
                lastModified={moment(
                  dataForEvent.data.fileId?.updatedAt,
                ).format("D MMM YYYY, h:mm A")}
                totalDownload={dataForEvent.data.fileId?.totalDownload}
                isOpen={fileDetailsOpen}
                onClose={() => {
                  resetDataForEvents();
                  setFileDetailsOpen(false);
                }}
                imagePath={
                  dataForEvent.data.ownerId?.newName +
                  "-" +
                  dataForEvent.data.ownerId?._id +
                  "/" +
                  (dataForEvent?.data?.fileId?.newPath
                    ? removeFileNameOutOfPath(
                        dataForEvent.data?.fileId?.newPath,
                      )
                    : "") +
                  dataForEvent?.data?.fileId?.newFilename
                }
                user={dataForEvent.data.ownerId}
                {...{
                  favouriteIcon: {
                    isShow: true,
                    handleFavouriteOnClick: async () =>
                      await handleAddFavourite(),
                    isFavourite: dataForEvent.data.fileId?.favorite
                      ? true
                      : false,
                  },
                  downloadIcon: {
                    isShow:
                      dataForEvent?.data.permission === "edit" ? true : false,
                    handleDownloadOnClick: async () => {
                      if (userPackage?.downLoadOption === "another") {
                        handleGetDownloadLink();
                      } else {
                        handleDownloadFileAndFolder();
                      }
                    },
                  },
                }}
              />
            )}
          </MUI_CLOUD.DivCloud>
        )}
        {shareData !== null && !shareData && (
          <Box style={{ height: "100%" }}>
            <Empty
              icon={<ShareWithMeEmpty />}
              title="Files and folders others have shared with you"
              context="Lore  is a body of knowledge or tradition that is passed down among members of a"
            />
          </Box>
        )}
      </Box>
      <Snackbar
        open={notification}
        timeout={1500}
        handleClose={closeNotification}
        message="Success message!!"
      />

      <DialogCreateMultipleFilePassword
        isOpen={isMultiplePasswordLink}
        checkType="file"
        onConfirm={() => {
          handleClearSelection();
        }}
        onClose={handleCloseMultiplePassword}
      />

      <DialogCreateMultipleShare
        onClose={() => {
          handleClearSelection();
          resetDataForEvents();
          setShareMultipleDialog(false);
        }}
        open={shareMultipleDialog}
        data={dataForEvent.data}
        dataSelector={dataSelector?.selectionFileAndFolderData}
      />

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={
          dataForEvent.data?.fileId?._id
            ? dataForEvent.data?.fileId?.filename
            : dataForEvent.data?.folderId?.folder_name
        }
        filePassword={filePassword}
        onConfirm={handleSubmitDecryptedPassword}
        onClose={handleCloseDecryptedPassword}
      />

      <DialogCreateFileDrop
        isOpen={isFiledrop}
        onClose={handleCloseFileDrop}
        handleChange={handleCreateFileDrop}
      />
    </Fragment>
  );
}

export default ShareWithMe;
