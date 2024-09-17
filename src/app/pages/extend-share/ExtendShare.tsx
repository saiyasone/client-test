import { useLazyQuery, useMutation } from "@apollo/client";
import { Base64 } from "js-base64";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// material ui icon and component
import { Typography } from "@mui/material";

// componento
import useAuth from "../../../hooks/useAuth";
import * as MUI from "./styles/extendShare.style";

// graphql

//function
import {
  MUTATION_ACTION_FILE,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import { MUTATION_CREATE_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import { MUTATION_DELETE_SHARE } from "api/graphql/share.graphql";
import BreadcrumbNavigate from "components/BreadcrumbNavigate";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SwitchPages from "components/SwitchPage";
import DialogAlert from "components/dialog/DialogAlert";
import DialogCreateFileDrop from "components/dialog/DialogCreateFileDrop";
import DialogCreateFilePassword from "components/dialog/DialogCreateFilePassword";
import DialogCreateMultipleShare from "components/dialog/DialogCreateMultipleShare";
import DialogCreateShare from "components/dialog/DialogCreateShare";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFile from "components/dialog/DialogPreviewFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import ProgressingBar from "components/loading/ProgressingBar";
import { ENV_KEYS } from "constants/env.constant";
import {
  shareWithMeFileMenuItems,
  shareWithMeFolderMenuItems,
  shortFileShareMenu,
} from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrlExtendFolder from "hooks/url/useGetUrlExtendFolder";
import useGetUrlExtendFolderDownload from "hooks/url/useGetUrlExtendFolderDownload";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useFetchSharedSubFolderAndFile from "hooks/useFetchSharedSubFolderAndFile";
import useFirstRender from "hooks/useFirstRender";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import _ from "lodash";
import moment from "moment";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  cutFileType,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { encryptId } from "utils/secure.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import ExtendFileDataGrid from "../extend-folder/ExtendFileDataGrid";
import ExtendFolderDataGrid from "../extend-folder/ExtendFolderDataGrid";
import useFetchShareFolder from "hooks/folder/useFetchShareFolder";

const ITEM_PER_PAGE = 10;

function ExtendShare() {
  const manageGraphqlError = useManageGraphqlError();
  const params: any = useParams();
  const isFirstRender = useFirstRender();
  // const [dataFilesAndFolders, setDataFilesAndFolders] = useState<any>([null, null]);
  const navigate = useNavigate();
  const [toggle, setToggle] = useState<any>(null);
  const parentFolderUrl: any = Base64.decode(params.id);

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  const [getFolders] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });
  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER, {
    refetchQueries: [QUERY_FOLDER],
  });
  const [deleteShareFileAndFolder] = useMutation(MUTATION_DELETE_SHARE, {
    fetchPolicy: "no-cache",
  });
  const { setFolderId, trackingFolderData }: any = useContext(FolderContext);
  const { user: userAuth }: any = useAuth();
  const user = trackingFolderData?.createdBy || {};
  const { data: parentFolder } = useFetchShareFolder({
    folderUrl: parentFolderUrl,
  });

  const fetchSubFoldersAndFiles = useFetchSharedSubFolderAndFile(
    parentFolder?._id,
    userAuth,
  );

  useEffect(() => {
    // if (fetchSubFoldersAndFiles.data) {
    //   console.log(fetchSubFoldersAndFiles.data);
    // }
  }, [fetchSubFoldersAndFiles.data]);

  // for detect file password
  const [filePassword, setFilePassword] = useState<any>("");
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [eventClick, setEventClick] = useState<any>(false);

  const manageFile = useManageFile({ user });
  const breadCrumbData = useBreadcrumbData(parentFolder?.path, "");
  const [procesing, setProcesing] = useState<any>(true);
  const [showProgressing, setShowProgressing] = useState<any>(false);
  const [showPreview, setShowPreview] = useState<any>(false);
  const [isPasswordLink, setIsPasswordLink] = useState<any>(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    action: null,
    type: null,
    data: {},
  });

  /* for filtered data includes pagination... */
  const [_dataFolderFilters, setDataFolderFilters] = useState<any>({});
  const [currentFilePage, setCurrentFilePage] = useState<any>(1);
  const { setIsAutoClose } = useMenuDropdownState();
  const [currentFolderPage, setCurrentFolderPage] = useState<any>(1);

  // const [viewMoreloading, setViewMoreLoading] = useState<any>(null);

  // popup
  const [name, setName] = useState<any>("");
  // const [isOpenMenu, setIsOpenMenu] = useState<any>(false);

  //dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(false);
  const [openFileDrop, setOpenFileDrop] = useState<any>(false);

  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);

  const [shareMultipleDialog, setShareMultipleDialog] = useState<any>(false);

  const [fileDetailsDialog, setFileDetailsDialog] = useState<any>(false);

  const [shareDialog, setShareDialog] = useState<any>(false);
  const [fileAction] = useMutation(MUTATION_ACTION_FILE);

  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const handleGetFolderURL = useGetUrlExtendFolder(dataForEvent.data);

  useEffect(() => {
    if (!_.isEmpty(dataForEvent.data) && dataForEvent.action === "get link") {
      setIsAutoClose(true);
      handleGetFolderURL?.(dataForEvent.data);
      resetDataForEvents();
    }
  }, [dataForEvent.action]);

  /* data for Breadcrumb */
  const breadcrumbDataForFileDetails = useBreadcrumbData(
    breadCrumbData?.join("/"),
    dataForEvent.data.name,
  );

  // redux store
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );
  const dispatch = useDispatch();

  // get download url
  const [userPackage, setUserPackage] = useState<any>(null);
  const [dataDownloadURL, setDataDownloadURL] = useState<any>(null);
  const handleDownloadUrl = useGetUrlExtendFolderDownload(dataDownloadURL);
  useEffect(() => {
    if (dataDownloadURL) {
      handleDownloadUrl?.(dataDownloadURL);
      setTimeout(() => {
        setDataDownloadURL(null);
      }, 500);
    }
  }, [dataDownloadURL]);

  useEffect(() => {
    if (userAuth) {
      const packages = userAuth?.packageId;
      setUserPackage(packages);
    }
  }, [userAuth]);

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
    const localStorageToggled: any = localStorage.getItem("toggle");
    if (localStorageToggled) {
      setToggle(localStorageToggled === "list" ? "list" : "grid");
    }
  }, []);

  useEffect(() => {
    if (parentFolder?._id) {
      setFolderId(parentFolder?._id);
    }
    return () => {
      setFolderId(0);
    };
  }, [parentFolder]);

  /* folders pagination */
  useEffect(() => {
    if (!isFirstRender) {
      setDataFolderFilters((prevState) => {
        const result: any = {
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
    if (parentFolder?._id) {
      const folderEncrypted = encryptId(
        JSON.stringify(parentFolder?._id),
        ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
      );
      localStorage.setItem(
        ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY,
        folderEncrypted,
      );
    }
  }, [parentFolder]);

  const handleOpenPasswordLink = () => {
    setIsPasswordLink(true);
  };
  const handleClosePasswordLink = () => {
    setIsPasswordLink(false);
    resetDataForEvents();
  };

  useEffect(() => {
    if (eventUploadTrigger.triggerData.isTriggered && parentFolder?._id) {
      fetchSubFoldersAndFiles.refetch();
    }
  }, [eventUploadTrigger.triggerData]);

  useEffect(() => {
    const shareData =
      fetchSubFoldersAndFiles.data?.folders?.data?.[0] ||
      fetchSubFoldersAndFiles.data?.files?.data?.[0];
    if (shareData) {
      if (shareData?.permission === "edit") {
        eventUploadTrigger.handleSharePermission("edit");
      } else {
        eventUploadTrigger.handleSharePermission("view");
      }
    }
  }, [
    eventUploadTrigger?.sharePermission,
    fetchSubFoldersAndFiles.data?.folders?.data,
  ]);

  const resetDataForEvents = () => {
    setDataForEvent((state) => ({
      ...state,
      action: "",
      type: null,
    }));
  };

  function handleCloseFileDrop() {
    setOpenFileDrop(false);
  }

  // file password
  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.checkTypeItem === "folder") {
      if (dataForEvent.data?.access_password) {
        checkPassword = true;
      }
    } else {
      if (dataForEvent.data?.filePassword) {
        checkPassword = true;
      }
    }

    return checkPassword;
  };

  async function handleSubmitDecryptedPassword() {
    switch (eventClick) {
      case "download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleCloseDecryptedPassword();
          handleGetDownloadLink();
        } else {
          handleCloseDecryptedPassword();
          if (dataForEvent.type === "folder") {
            await handleDownloadFolders();
          } else {
            await handleDownloadFile();
          }
        }

        break;
      case "double click":
        handleCloseDecryptedPassword();
        handleDoubleClick(dataForEvent.data);
        break;
      case "delete":
        handleCloseDecryptedPassword();
        await handleDeleteFilesAndFolders();
        break;
      case "rename":
        handleCloseDecryptedPassword();
        setRenameDialogOpen(true);
        break;
      case "filedrop":
        handleCloseDecryptedPassword();
        setOpenFileDrop(true);
        break;
      case "preview":
        handleCloseDecryptedPassword();
        setShowPreview(true);
        break;
      case "detail":
        handleCloseDecryptedPassword();
        setFileDetailsDialog(true);
        break;
      case "share":
        handleCloseDecryptedPassword();
        setShareDialog(true);
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

  useEffect(() => {
    if (dataForEvent.action && dataForEvent.data) {
      if (dataForEvent.data?.checkTypeItem === "folder") {
        if (dataForEvent.data?.access_password) {
          setFilePassword(dataForEvent.data?.access_password);
        }
      } else {
        if (dataForEvent.data?.filePassword) {
          setFilePassword(dataForEvent.data?.filePassword);
        }
      }

      menuOnClick(dataForEvent.action);
    }
    return () => {
      setDataForEvent((prev) => {
        return {
          ...prev,
          action: "",
        };
      });
    };
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
            if (dataForEvent.type === "folder") {
              await handleDownloadFolders();
            } else {
              await handleDownloadFile();
            }
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

      case "password":
        handleOpenPasswordLink();
        break;

      case "filedrop":
        setEventClick("filedrop");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setOpenFileDrop(true);
          setDataForEvent((state) => {
            return {
              ...state,
              action: "",
            };
          });
        }
        break;
      case "favourite":
        handleAddFavourite();
        break;

      case "double click":
        setEventClick("double click");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          handleDoubleClick(dataForEvent.data);
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
      case "get link":
        setEventClick("get link");
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
        setEventClick("detail");
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

  /* handle download folders */
  const handleDownloadFolders = async () => {
    const newFileData = [
      {
        id: dataForEvent.data?._id,
        checkType: "folder",
        newPath: dataForEvent.data?.newPath || "",
        newFilename: dataForEvent.data?.newFolder_name || "",
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
          setDataForEvent((state) => ({
            ...state,
            action: "",
          }));
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },

        onClosure: () => {
          setShowProgressing(false);
          setIsAutoClose(false);
          resetDataForEvents();
        },
      },
    );
  };

  const handleCreateFileDrop = async (link, date) => {
    try {
      const fileDropLink = await createFileDropLink({
        variables: {
          input: {
            url: link,
            expiredAt: date,
            folderId: dataForEvent.data?._id,
          },
        },
      });
      if (fileDropLink?.data?.createDrop?._id) {
        successMessage("Create file-drop link success!", 2000);
      }
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
          successMessage("Download successful", 2000);
          setDataForEvent((state) => ({
            ...state,
            action: null,
            data: {
              ...state.data,
              totalDownload: dataForEvent.data.totalDownload + 1,
            },
          }));
          fetchSubFoldersAndFiles.refetch();
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
      await deleteShareFileAndFolder({
        variables: {
          id: dataForEvent.data?.sharedId,
          email: userAuth?.email,
        },
        onCompleted: async () => {
          if (dataForEvent.type === "folder") {
            successMessage("Delete folder successful !", 2000);
          } else {
            successMessage("Delete file successful !", 2000);
          }
          fetchSubFoldersAndFiles.refetch();
        },
      });
    } catch (err: any) {
      errorMessage(err, 3000);
      errorMessage("Sorry! Something went wrong. Please try again!", 3000);
    }
    setDeleteDialogOpen(false);
    resetDataForEvents();
    setIsAutoClose(true);
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
              parentkey: parseInt(parentFolder?._id),
              folder_name: name,
              updatedBy: user?._id,
            },
          },
          onCompleted: async () => {
            setIsAutoClose(true);
            fetchSubFoldersAndFiles.refetch();
            setRenameDialogOpen(false);
            successMessage("Update Folder successful", 2000);
            resetDataForEvents();
          },
        });
      } else {
        await updateFile({
          variables: {
            where: {
              _id: dataForEvent.data._id,
            },
            data: {
              filename: name,
              updatedBy: user?._id,
            },
          },
          onCompleted: async () => {
            setIsAutoClose(true);
            fetchSubFoldersAndFiles.refetch();
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
          fetchSubFoldersAndFiles.refetch();
        },
      });
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
            id: item?.share?._id,
            email: item?.toAccount?.email,
          },

          onCompleted: () => {
            fetchSubFoldersAndFiles.refetch();
          },
        });
      });

      await handleClearMultipleSelection();
      await successMessage("Multiple share deleted successfully", 3000);
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  // multiple files selected
  const handleMultipleSelectionFile = (data) => {
    const selectOptions = fetchSubFoldersAndFiles.data?.files?.data?.find(
      (el) => el?._id === data,
    );

    if (selectOptions) {
      dispatch(
        checkboxAction.setFileAndFolderData({
          data: {
            id: selectOptions?._id,
            dataId: selectOptions?._id,
            shareId: selectOptions?.sharedId,
            name: selectOptions?.name,
            newPath: selectOptions.newPath || "",
            newFilename: selectOptions?.newFilename,
            permission: selectOptions?.permission,
            checkType: selectOptions?.checkTypeItem,
            dataPassword:
              selectOptions?.filePassword ||
              selectOptions?.folderId?.access_password,
            createdBy: {
              _id: selectOptions?.createdBy?._id,
              newName: selectOptions?.createdBy?.newName,
            },
            toAccount: {
              _id: userAuth?._id,
              newName: userAuth?.newName,
              email: userAuth?.email,
            },
            share: {
              _id: selectOptions?.sharedId,
              isFromShare: selectOptions?.isShare === "yes" ? true : false,
            },
          },
        }),
      );
    }
  };

  // multiple files selected
  const handleMultipleSelectionFolder = (data) => {
    const selectOptions = fetchSubFoldersAndFiles.data?.folders?.data?.find(
      (el) => el?._id === data,
    );

    if (selectOptions) {
      dispatch(
        checkboxAction.setFileAndFolderData({
          data: {
            id: selectOptions?._id,
            dataId: selectOptions?.sharedId,
            name: selectOptions?.name,
            newPath: selectOptions.newPath || "",
            checkType: selectOptions?.checkTypeItem,
            permission: selectOptions?.permission || "view",
            newFilename: selectOptions?.newFolder_name,
            totalSize: selectOptions?.isContainsFiles ? 1 : 0,
            dataPassword:
              selectOptions?.filePassword ||
              selectOptions?.folderId?.access_password,
            createdBy: {
              _id: selectOptions?.createdBy?._id,
              newName: selectOptions?.createdBy?.newName,
            },
            toAccount: userAuth,
            share: {
              _id: selectOptions?.sharedId,
              isFromShare: selectOptions?.isShare === "yes" ? true : false,
            },
          },
          toggle,
        }),
      );
    }
  };

  const handleClearMultipleSelection = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearMultipleSelection();
  }, [dispatch, navigate]);

  const handleAddFavourite = async () => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: dataForEvent.data._id,
          },
          data: {
            favorite: dataForEvent.data.favorite ? 0 : 1,
            updatedBy: user?._id,
          },
        },
        onCompleted: async () => {
          setIsAutoClose(true);
          setRenameDialogOpen(false);
          /* setFileDetailsDialog(false); */
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
          fetchSubFoldersAndFiles.refetch();
        },
      });
    } catch (error) {
      errorMessage(
        "Sorry!!. Something went wrong. Please try again later!!",
        2000,
      );
    }
  };

  useEffect(() => {
    if (dataForEvent.action) {
      if (dataForEvent.type === "folder") {
        setName(dataForEvent.data.name);
      } else {
        setName(dataForEvent.data.name);
      }
    }
  }, [dataForEvent.action]);

  const handleFolderNavigate = async (path) => {
    const result = await getFolders({
      variables: {
        where: {
          path,
          createdBy: user?._id,
          status: "active",
        },
      },
    });

    if (result) {
      const [dataById] = result.data?.folders?.data || [];
      const base64URL = Base64.encodeURI(dataById._id);
      navigate(`/folder/share/${base64URL}`);
    }
  };

  const handleDoubleClick = (data) => {
    const base64URL = Base64.encodeURI(data._id);
    navigate(`/folder/share/${base64URL}`);
  };

  return (
    <Fragment>
      {shareDialog && (
        <DialogCreateShare
          onClose={() => {
            setShareDialog(false);
            resetDataForEvents();
          }}
          open={shareDialog}
          data={{
            ...dataForEvent.data,
            folder_type:
              dataForEvent.data?.checkTypeItem === "folder" ? "folder" : "",
            folder_name: dataForEvent.data.name,
            filename: dataForEvent.data.name,
          }}
          ownerId={{
            ...dataForEvent.data,
            _id: dataForEvent.data?.createdBy?._id,
            newName: dataForEvent.data?.createdBy?.newName,
          }}
          share={{
            _id: dataForEvent.data.sharedId,
            isFromShare: true,
          }}
        />
      )}

      {!_.isEmpty(dataForEvent.data) && (
        <DialogFileDetail
          path={breadcrumbDataForFileDetails}
          name={dataForEvent.data.name || dataForEvent.data.name}
          breadcrumb={{
            handleFolderNavigate: handleFolderNavigate,
          }}
          type={
            dataForEvent.data.type
              ? getShortFileTypeFromFileType(dataForEvent.data.type)
              : cutFileType(dataForEvent.data.name) || "folder"
          }
          displayType={
            dataForEvent.data.type ||
            getFileType(dataForEvent.data.name) ||
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
            dataForEvent.data?.createdBy?.newName +
            "-" +
            dataForEvent.data?.createdBy?._id +
            "/" +
            (dataForEvent?.data?.newPath
              ? removeFileNameOutOfPath(dataForEvent.data?.newPath)
              : "") +
            dataForEvent?.data?.newName
          }
          user={dataForEvent.data?.createdBy}
          {...{
            favouriteIcon: {
              isShow: true,
              handleFavouriteOnClick: async () => await handleAddFavourite(),
              isFavourite: dataForEvent.data.favorite ? true : false,
            },
            downloadIcon: {
              isShow: dataForEvent.data.permission === "edit" ? true : false,
              handleDownloadOnClick: async () => {
                setDataForEvent((prev) => {
                  return {
                    ...prev,
                    action: "download",
                  };
                });
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
            setDataForEvent((prev) => {
              return {
                ...prev,
                action: "download",
              };
            });
          }}
          filename={dataForEvent.data.name}
          permission={dataForEvent.data.permission}
          newFilename={dataForEvent.data.newName}
          fileType={dataForEvent.data.type}
          path={dataForEvent.data.newPath}
          user={dataForEvent.data?.createdBy}
        />
      )}

      <DialogRenameFile
        open={renameDialogOpen}
        onClose={() => {
          resetDataForEvents();
          setRenameDialogOpen(false);
        }}
        onSave={handleRename}
        title={dataForEvent.type === "folder" ? "Rename folder" : "Rename file"}
        label={dataForEvent.type === "folder" ? "Rename folder" : "Rename file"}
        isFolder={dataForEvent.type === "folder" ? true : false}
        defaultValue={dataForEvent?.data?.name}
        name={name}
        setName={setName}
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
          (dataForEvent.data.name || dataForEvent.data.name) +
          " will be deleted?"
        }
      />

      <MUI.ExtendContainer>
        <MUI.TitleAndSwitch className="title-n-switch" sx={{ my: 2 }}>
          {dataSelector?.selectionFileAndFolderData?.length > 0 ? (
            <MenuMultipleSelectionFolderAndFile
              isShare={true}
              onPressShare={() => {
                setShareMultipleDialog(true);
              }}
              onPressDeleteShare={handleMultipleDeleteShare}
            />
          ) : (
            <Fragment>
              <BreadcrumbNavigate
                title="share-with-me"
                titlePath="/share-with-me"
                user={user}
                path={breadCrumbData}
                folderId={parentFolder?._id}
                handleNavigate={handleFolderNavigate}
                isShare={true}
              />
              {fetchSubFoldersAndFiles.isDataFound !== null &&
                fetchSubFoldersAndFiles.isDataFound && (
                  <SwitchPages
                    handleToggle={handleToggle}
                    toggle={toggle === "grid" ? "grid" : "list"}
                    setToggle={setToggle}
                  />
                )}
            </Fragment>
          )}
        </MUI.TitleAndSwitch>

        {fetchSubFoldersAndFiles.isDataFound !== null &&
          fetchSubFoldersAndFiles.isDataFound && (
            <>
              <MUI.ExtendList>
                <Fragment>
                  {fetchSubFoldersAndFiles.data.folders.data.length > 0 && (
                    <MUI.ExtendItem>
                      <MUI.ExtendTotalItemContainer>
                        <Typography variant="h4" fontWeight="bold">
                          Folders
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: "1rem",
                            color: "initial !important",
                            fontWeight: "normal !important",
                          }}
                        >
                          {fetchSubFoldersAndFiles.data.folders.data.length}{" "}
                          Items
                        </Typography>
                      </MUI.ExtendTotalItemContainer>
                      <Fragment>
                        {toggle === "grid" && (
                          <Fragment>
                            <FileCardContainer>
                              {fetchSubFoldersAndFiles.data.folders.data.map(
                                (data, index) => {
                                  return (
                                    <FileCardItem
                                      cardProps={{
                                        onDoubleClick: () => {
                                          setDataForEvent({
                                            data,
                                            action: "double click",
                                          });
                                        },
                                        ...(dataSelector?.selectionFileAndFolderData?.find(
                                          (el) => el?.id === data?._id,
                                        ) && {
                                          ishas: "true",
                                        }),
                                      }}
                                      id={data?._id}
                                      handleSelect={
                                        handleMultipleSelectionFolder
                                      }
                                      isContainFiles={data.isContainsFiles}
                                      isCheckbox={true}
                                      fileType="folder"
                                      isPinned={data.pin ? true : false}
                                      name={data.name}
                                      key={index}
                                      menuItems={shareWithMeFolderMenuItems.map(
                                        (menuItem, index) => {
                                          return (
                                            <MenuDropdownItem
                                              {...((menuItem.action ===
                                                "get link" ||
                                                menuItem.action === "share" ||
                                                menuItem.action ===
                                                  "download") &&
                                              data.permission !== "edit"
                                                ? {
                                                    disabled: true,
                                                  }
                                                : {
                                                    ...(!data.isContainsFiles
                                                      ? menuItem.action ===
                                                          "get link" ||
                                                        menuItem.action ===
                                                          "share" ||
                                                        menuItem.action ===
                                                          "download"
                                                        ? {
                                                            disabled: true,
                                                          }
                                                        : {
                                                            onClick: () => {
                                                              setDataForEvent({
                                                                action:
                                                                  menuItem.action,
                                                                type: "folder",
                                                                data,
                                                              });
                                                            },
                                                          }
                                                      : {
                                                          onClick: () => {
                                                            setDataForEvent({
                                                              action:
                                                                menuItem.action,
                                                              type: "folder",
                                                              data,
                                                            });
                                                          },
                                                        }),
                                                  })}
                                              isPinned={data.pin ? true : false}
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
                            </FileCardContainer>
                          </Fragment>
                        )}
                        {toggle !== "grid" && (
                          <ExtendFolderDataGrid
                            isFromSharingUrl={true}
                            isShare={true}
                            shortMenuItems={shortFileShareMenu}
                            pagination={{
                              total: Math.ceil(
                                fetchSubFoldersAndFiles.data.folders.total /
                                  ITEM_PER_PAGE,
                              ),
                              currentPage: currentFolderPage,
                              setCurrentPage: setCurrentFolderPage,
                            }}
                            data={fetchSubFoldersAndFiles.data.folders.data}
                            dataSelector={dataSelector}
                            user={user}
                            handleEvent={(action, data) => {
                              setDataForEvent({
                                action,
                                type: "folder",
                                data,
                              });
                            }}
                            handleSelection={handleMultipleSelectionFolder}
                          />
                        )}
                      </Fragment>
                    </MUI.ExtendItem>
                  )}
                  {fetchSubFoldersAndFiles.data.files.data.length > 0 && (
                    <MUI.ExtendItem>
                      <MUI.ExtendTotalItemContainer>
                        <Typography variant="h4" fontWeight="bold">
                          Files{" "}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: "1rem",
                            color: "initial !important",
                            fontWeight: "normal !important",
                          }}
                        >
                          {fetchSubFoldersAndFiles.data.files.data?.length}{" "}
                          Items
                        </Typography>
                      </MUI.ExtendTotalItemContainer>
                      <Fragment>
                        {toggle === "grid" && (
                          <FileCardContainer>
                            {fetchSubFoldersAndFiles.data.files.data.map(
                              (data, index) => {
                                return (
                                  <Fragment key={index}>
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
                                        data?.createdBy?.newName +
                                        "-" +
                                        data?.createdBy?._id +
                                        "/" +
                                        (data?.newPath
                                          ? removeFileNameOutOfPath(
                                              data?.newPath,
                                            )
                                          : "") +
                                        data?.newFilename
                                      }
                                      user={data?.createdBy}
                                      id={data?._id}
                                      handleSelect={handleMultipleSelectionFile}
                                      isCheckbox={true}
                                      fileType={getShortFileTypeFromFileType(
                                        data?.type,
                                      )}
                                      filePassword={data?.filePassword}
                                      name={data?.name}
                                      // key={index}
                                      menuItems={shareWithMeFileMenuItems.map(
                                        (menuItem, index) => {
                                          if (data?.permission) {
                                            return (
                                              <MenuDropdownItem
                                                {...((menuItem.action ===
                                                  "get link" ||
                                                  menuItem.action === "share" ||
                                                  menuItem.action ===
                                                    "download") &&
                                                data.permission !== "edit"
                                                  ? {
                                                      disabled: true,
                                                    }
                                                  : {
                                                      onClick: () => {
                                                        setDataForEvent({
                                                          action:
                                                            menuItem.action,
                                                          data,
                                                        });
                                                      },
                                                    })}
                                                isFavorite={
                                                  data.favorite ? true : false
                                                }
                                                key={index}
                                                title={menuItem.title}
                                                icon={menuItem.icon}
                                              />
                                            );
                                          } else {
                                            return (
                                              <MenuDropdownItem
                                                isFavorite={
                                                  data.favorite ? true : false
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
                                          }
                                        },
                                      )}
                                    />
                                  </Fragment>
                                );
                              },
                            )}
                          </FileCardContainer>
                        )}
                        {toggle === "list" && (
                          <Fragment>
                            <ExtendFileDataGrid
                              isFromSharingUrl={true}
                              shortMenuItems={shortFileShareMenu}
                              pagination={{
                                total: Math.ceil(
                                  fetchSubFoldersAndFiles.data.files.total /
                                    ITEM_PER_PAGE,
                                ),
                                currentPage: currentFilePage,
                                setCurrentPage: setCurrentFilePage,
                              }}
                              user={user}
                              dataSelector={dataSelector}
                              data={fetchSubFoldersAndFiles.data.files.data}
                              handleEvent={(action, data) => {
                                setDataForEvent({
                                  action,
                                  data,
                                });
                              }}
                              handleSelection={handleMultipleSelectionFile}
                            />
                          </Fragment>
                        )}
                      </Fragment>
                    </MUI.ExtendItem>
                  )}
                </Fragment>
              </MUI.ExtendList>
            </>
          )}
      </MUI.ExtendContainer>

      <DialogCreateFileDrop
        isOpen={openFileDrop}
        onClose={handleCloseFileDrop}
        handleChange={handleCreateFileDrop}
      />

      <DialogCreateFilePassword
        isOpen={isPasswordLink}
        dataValue={dataForEvent.data}
        filename={dataForEvent.data?.name}
        checkType={dataForEvent.data?.checkTypeItem}
        onConfirm={() => {
          fetchSubFoldersAndFiles.refetch();
        }}
        onClose={handleClosePasswordLink}
      />

      <DialogCreateMultipleShare
        onClose={() => {
          handleClearMultipleSelection();
          setShareMultipleDialog(false);
        }}
        open={shareMultipleDialog}
        data={dataForEvent.data}
        dataSelector={dataSelector?.selectionFileAndFolderData}
      />

      {/* Decrypt password */}
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
    </Fragment>
  );
}

export default ExtendShare;
