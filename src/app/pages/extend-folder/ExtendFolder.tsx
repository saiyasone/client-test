import { useLazyQuery, useMutation } from "@apollo/client";
import { Base64 } from "js-base64";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

// material ui icon and component
import { Box, Button, Typography, useMediaQuery } from "@mui/material";

// componento
import useAuth from "../../../hooks/useAuth";
import * as MUI from "./styles/extendFolder.style";

//function
import { ExpandMore } from "@mui/icons-material";
import {
  MUTATION_ACTION_FILE,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import {
  MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  MUTATION_UPDATE_FILE_DROP_URL,
} from "api/graphql/fileDrop.graphql";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import BreadcrumbNavigate from "components/BreadcrumbNavigate";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import FolderGridItem from "components/FolderGridItem";
import InputSearch from "components/InputSearch";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SwitchPages from "components/SwitchPage";
import DialogAlert from "components/dialog/DialogAlert";
import DialogCreateFileDrop from "components/dialog/DialogCreateFileDrop";
import DialogCreateFilePassword from "components/dialog/DialogCreateFilePassword";
import DialogCreateMultipleFilePassword from "components/dialog/DialogCreateMultipleFilePassword";
import DialogCreateMultipleShare from "components/dialog/DialogCreateMultipleShare";
import DialogCreateShare from "components/dialog/DialogCreateShare";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFileSlide from "components/dialog/DialogPriewFileSlide";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import { ENV_KEYS } from "constants/env.constant";
import menuItems, { favouriteMenuItems } from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useRefreshState } from "contexts/RefreshProvider";
import useManageFile from "hooks/file/useManageFile";
import useFetchFolder from "hooks/folder/useFetchFolder";
import useManageFolder from "hooks/folder/useManageFolder";
import useGetUrlExtendFolder from "hooks/url/useGetUrlExtendFolder";
import useGetUrlExtendFolderDownload from "hooks/url/useGetUrlExtendFolderDownload";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useDetectResizeWindow from "hooks/useDetectResizeWindow";
import useExportCSV from "hooks/useExportCSV";
import useFetchSubFolderAndFile from "hooks/useFetchSubFolderAndFIle";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useScroll from "hooks/useScroll";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import _ from "lodash";
import moment from "moment";
import { useMemo } from "react";
import { CSVLink } from "react-csv";
import { CiSearch } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import {
  setMenuToggle,
  toggleFolderSelected,
  toggleSelected,
} from "stores/features/useEventSlice";
import { RootState } from "stores/store";
import { IFolderTypes, IMyCloudTypes } from "types/mycloudFileType";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  combineOldAndNewFileNames,
  cutFileType,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertObjectEmptyStringToNull } from "utils/object.util";
import { encryptId } from "utils/secure.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { replacetDotWithDash } from "utils/string.util";
import useFirstRender from "../../../hooks/useFirstRender";
import ExtendFileDataGrid from "./ExtendFileDataGrid";
import ExtendFolderDataGrid from "./ExtendFolderDataGrid";
import { TitleAndSwitch } from "styles/clientPage.style";
import DialogGetLink from "components/dialog/DialogGetLink";
import DialogOneTimeLink from "components/dialog/DialogOneTimeLink";
import SearchExtend from "./SearchExtend";

const _ITEM_GRID_PER_PAGE = 20;

function ExtendFolder() {
  const detectResizeWindow = useDetectResizeWindow();
  const manageGraphqlError = useManageGraphqlError();
  const params: any = useParams();
  const isFirstRender = useFirstRender();
  const navigate = useNavigate();
  const [toggle, setToggle] = useState<any>(null);
  const [isUpdate, setIsUpdate] = useState<any>(false);
  const [_viewMore, _setViewMore] = useState<any>(20);
  const [openGetLink, setOpenGetLink] = useState(false);
  const [openOneTimeLink, setOpenOneTimeLink] = useState(false);
  const parentFolderUrl = useMemo(() => {
    return Base64?.decode(params?.id);
  }, [params.id]);
  const { triggerFolder, handleTriggerFolder }: any = useContext(FolderContext);
  const { refreshAuto } = useRefreshState();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [multiChecked, setMultiChecked] = useState<any[]>([]);
  const [_checked, setChecked] = useState({});
  const {
    isOpenMenu: isMenu,
    isSelected,
    isFolderSelected,
    isToggleMenu,
  } = useSelector((state: RootState) => state.event);

  // multiple selection state
  const [isMultiplePasswordLink, setIsMultiplePasswordLink] =
    useState<any>(false);
  const [shareMultipleDialog, setShareMultipleDialog] = useState<any>(false);

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  const [inputSearch, setInputSearch] = useState<any>("");
  const [_inputHover, setInputHover] = useState<any>(false);

  // redux sliceo

  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

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

  const handleGetDownloadLink = async () => {
    setDataDownloadURL(dataForEvent.data);
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  const [getFolders] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );
  const [updateFileDrop] = useMutation(MUTATION_UPDATE_FILE_DROP_URL);

  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER, {
    refetchQueries: [QUERY_FOLDER],
  });

  const [currentFilePage, setCurrentFilePage] = useState<any>(1);
  const { setFolderId }: any = useContext(FolderContext);
  const { user: userAuth } = useAuth();
  const user: any = userAuth;
  const { data: parentFolder } = useFetchFolder({
    folderUrl: parentFolderUrl,
    userId: user?._id,
  });
  const [total, setTotal] = useState<any>(0);

  const { limitScroll, addMoreLimit } = useScroll({
    total,
    limitData: _ITEM_GRID_PER_PAGE,
  });

  const fetchSubFoldersAndFiles = useFetchSubFolderAndFile({
    id: parentFolder?._id,
    currentPage: currentFilePage,
    limit: _ITEM_GRID_PER_PAGE,
    toggle,
    limitScroll,
    name: inputSearch,
  });

  useEffect(() => {
    setTotal(fetchSubFoldersAndFiles.apiTotal);
  }, [fetchSubFoldersAndFiles.apiTotal]);

  useEffect(() => {
    if (toggle === "list") {
      fetchSubFoldersAndFiles.queryListDataFileAndFolder();
    } else {
      fetchSubFoldersAndFiles.queryGridDataFileAndFolder();
    }
    if (refreshAuto?.isStatus === "extendfolder") {
      fetchSubFoldersAndFiles.queryGridDataFileAndFolder();
      fetchSubFoldersAndFiles.queryListDataFileAndFolder();
    }
  }, [triggerFolder, refreshAuto?.isAutoClose]);

  const breadCrumbData = useBreadcrumbData(parentFolder?.path, "");

  const [showPreview, setShowPreview] = useState<any>(false);
  const [isPasswordLink, setIsPasswordLink] = useState<any>(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    action: null,
    type: null,
    data: {},
  });

  const manageFolder = useManageFolder({ user });
  const manageFile = useManageFile({ user });

  const manageUserFromShare = useManageUserFromShare({
    parentKey: parentFolder?._id,
    inputFileOrFolder: dataForEvent.data,
    inputType: dataForEvent.type,
    user,
  });

  // confirm encrypted password
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [eventClick, setEventClick] = useState<any>(false);

  // using export csv
  const [csvFolder, setCsvFolder] = useState<any>({
    folderId: "",
    folderName: " ",
  });
  const csvRef: any = useRef();

  const handleClosePreview = () => {
    resetDataForEvent();
    setShowPreview(false);
  };

  const useDataExportCSV = useExportCSV({
    folderId: csvFolder.folderId,
    exportRef: csvRef,
    onSuccess: () => {
      setCsvFolder({
        folderId: "",
        folderName: "",
      });
    },
  });

  const handleViewMore = () => {
    addMoreLimit();
  };

  useEffect(() => {
    if (useDataExportCSV.data?.length > 0) {
      setCsvFolder({
        folderId: "",
        folderName: "",
      });
    }
  }, [useDataExportCSV.data]);

  useEffect(() => {
    if (user) {
      const packages = user?.packageId;
      setUserPackage(packages);
    }
  }, [user]);

  /* for filtered data includes pagination... */
  const [_dataFolderFilters, setDataFolderFilters] = useState<any>({});
  const { setIsAutoClose } = useMenuDropdownState();
  const [currentFolderPage, setCurrentFolderPage] = useState<any>(1);

  // popup
  const [name, setName] = useState<any>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(false);
  const [openFileDrop, setOpenFileDrop] = useState<any>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);
  const [fileDetailsDialog, setFileDetailsDialog] = useState<any>(false);
  const [shareDialog, setShareDialog] = useState<any>(false);
  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  // const handleGetFolderURL = useGetUrlExtendFolder(dataForEvent.data);

  useEffect(() => {
    if (!_.isEmpty(dataForEvent.data) && dataForEvent.action === "get link") {
      const checkPassword = isCheckPassword();
      if (checkPassword) {
        setShowEncryptPassword(true);
      } else {
        setIsAutoClose(true);
        setOpenGetLink(true);
        // handleGetFolderURL?.(dataForEvent.data);
        resetDataForEvent();
      }
    }
  }, [dataForEvent.action]);

  /* data for Breadcrumb */
  const breadcrumbDataForFileDetails = useBreadcrumbData(
    breadCrumbData?.join("/"),
    dataForEvent.data.name,
  );

  useEffect(() => {
    const localStorageToggled = localStorage.getItem("toggle");
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

  useEffect(() => {
    if (params) {
      handleCloseSearch();
    }
  }, [params]);
  /* folders pagination */
  useEffect(() => {
    if (!isFirstRender) {
      setDataFolderFilters((prevState) => {
        const result = {
          ...prevState,
          skip: (currentFolderPage - 1) * _ITEM_GRID_PER_PAGE,
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
    resetDataForEvent();
  };

  const customGetSubFoldersAndFiles = () => {
    if (toggle === "list") {
      fetchSubFoldersAndFiles.queryListDataFileAndFolder();
    } else {
      fetchSubFoldersAndFiles.queryGridDataFileAndFolder();
    }
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
  };
  const handleOnSearchChange = async (value) => {
    setInputSearch(value);
  };
  const handleOpenMultiplePassword = () => {
    setIsMultiplePasswordLink(true);
  };
  const handleCloseMultiplePassword = () => {
    setIsMultiplePasswordLink(false);
  };

  const handleGetLinkMultipe = () => {
    resetDataForEvent();

    if (dataSelector.selectionFileAndFolderData?.length > 0) {
      setDataForEvent((prev) => {
        const validFolders = dataSelector.selectionFileAndFolderData?.filter(
          (item) => {
            return item?.checkType === "folder" && item.totalSize! > 0;
          },
        );

        const validFiles = dataSelector.selectionFileAndFolderData?.filter(
          (item) => {
            return item?.checkType === "file";
          },
        );

        const data = [...validFolders, ...validFiles];

        return {
          ...prev,
          data: data,
        };
      });

      setOpenGetLink(true);
    }
  };

  const handleOneTimeLinkMultiFiles = () => {
    resetDataForEvent();

    if (dataSelector.selectionFileAndFolderData?.length > 0) {
      setEventClick("one-time-link");

      setDataForEvent((prev) => {
        const validFolders = dataSelector.selectionFileAndFolderData?.filter(
          (item) => {
            return item?.checkType === "folder" && item.totalSize! > 0;
          },
        );

        const validFiles = dataSelector.selectionFileAndFolderData?.filter(
          (item) => {
            return item?.checkType === "file";
          },
        );

        const data = [...validFolders, ...validFiles];

        return {
          ...prev,
          data: data,
        };
      });

      setOpenOneTimeLink(true);
    }
  };

  // handle multiple select files
  const handleMultipleFileData = (dataId: string) => {
    const fileData = fetchSubFoldersAndFiles.files.data;
    const optionValue = fileData?.find((item) => item?._id === dataId);

    if (optionValue) {
      dispatch(
        checkboxAction.setFileAndFolderData({
          data: {
            id: optionValue?._id,
            name: optionValue?.name,
            checkType: "file",
            newPath: optionValue?.newPath || "",
            newFilename: optionValue?.newFilename || "",
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
    }
  };

  // handle multiple select folders
  const handleMultipleFolderData = (dataId: string) => {
    const folderData = fetchSubFoldersAndFiles?.folders?.data;
    if (folderData?.length) {
      const optionValue = folderData?.find(
        (item: IFolderTypes) => item?._id === dataId,
      );
      if (optionValue) {
        dispatch(
          checkboxAction.setFileAndFolderData({
            data: {
              id: optionValue?._id,
              name: optionValue?.name || "",
              newPath: optionValue?.newPath || "",
              checkType: "folder",
              dataPassword: optionValue?.access_password || "",
              newFilename: optionValue?.newFolder_name || "",
              totalSize: optionValue?.isContainsFiles ? 1 : 0,
              shortLink: optionValue?.shortUrl || "",
              createdBy: {
                _id: optionValue?.createdBy?._id,
                newName: optionValue?.createdBy?.newName,
              },
              pin: optionValue?.pin === 1 ? true : false,
            },
            toggle,
          }),
        );
      }
    }
  };

  const handleClearMultipleFileAndFolder = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearMultipleFileAndFolder();
  }, [dispatch, toggle, navigate]);

  useEffect(() => {
    if (eventUploadTrigger.triggerData.isTriggered && parentFolder?._id) {
      customGetSubFoldersAndFiles();
    }
  }, [eventUploadTrigger.triggerData]);

  const resetDataForEvent = () => {
    setDataForEvent((state) => ({
      ...state,
      action: "",
      type: null,
    }));
  };

  function handleCloseFileDrop() {
    setOpenFileDrop(false);
    resetDataForEvent();
  }

  const handleOpenFolder = (value: { _id: any; url: any }) => {
    setFolderId(value?._id);
    const url = value?.url;

    const base64URL = Base64.encodeURI(url);
    setDataForEvent((prev) => ({
      ...prev,
      action: "",
    }));
    navigate(`/folder/${base64URL}`);
  };
  useEffect(() => {
    if (dataForEvent.action && dataForEvent.data) {
      menuOnClick(dataForEvent.action);
    }
  }, [dataForEvent.action]);

  const menuOnClick = async (action: string) => {
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
              await handleDownloadFolder();
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
        {
          const row = dataForEvent.data;
          if (row.type === "folder") {
            if (userPackage?.lockFolder === "on") {
              if (row.access_password) {
                setIsUpdate(true);
              } else {
                setIsUpdate(false);
              }
              handleOpenPasswordLink();
            } else {
              resetDataForEvent();
              errorMessage(
                "The package you've selected is not compatible. Please consider choosing a different one.",
                3000,
              );
            }
          } else {
            if (userPackage?.lockFile === "on") {
              if (row.filePassword) {
                setIsUpdate(true);
              } else {
                setIsUpdate(false);
              }
              handleOpenPasswordLink();
            } else {
              resetDataForEvent();
              errorMessage(
                "The package you've selected is not compatible. Please consider choosing a different one.",
                3000,
              );
            }
          }
        }

        break;
      case "filedrop":
        setEventClick("filedrop");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setOpenFileDrop(true);
        }
        break;
      case "favourite":
        handleAddFavourite();
        break;
      case "pin":
        handleAddPin();
        break;
      case "folder double click": {
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          handleOpenFolder(dataForEvent.data);
        }
        break;
      }
      case "preview":
        setEventClick("preview");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setShowPreview(true);
        }
        break;
      // case "get link":
      //   setEventClick("get link");
      //   break;
      case "get link": {
        setEventClick("get-link");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setOpenGetLink(true);
        }
        break;
      }
      case "one-time-link": {
        setEventClick("one-time-link");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setOpenOneTimeLink(true);
        }
        break;
      }
      case "detail":
        setEventClick("detail");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFileDetailsDialog(true);
        }
        break;
      case "export-csv":
        setEventClick("export-csv");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setCsvFolder({
            folderId: dataForEvent.data?._id,
            folderName: replacetDotWithDash(dataForEvent.data?.name),
          });

          resetDataForEvent();
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
          handleDoubleClick();
        }
        break;
      default:
        return;
    }
  };

  // confirm encryption password
  const isCheckPassword = () => {
    let checkPassword = false;
    const row = dataForEvent.data;

    if (row?.type === "folder") {
      if (row.access_password) {
        checkPassword = true;
      }
    } else {
      if (row.filePassword) {
        checkPassword = true;
      }
    }

    return checkPassword;
  };

  // handle encryption submit password
  async function handleSubmitDecryptedPassword() {
    switch (eventClick) {
      case "download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleCloseDecryptedPassword();
          await handleGetDownloadLink();
        } else {
          handleCloseDecryptedPassword();
          if (dataForEvent.data.type === "folder") {
            await handleDownloadFolder();
          } else {
            await handleDownloadFile();
          }
        }
        break;
      case "delete":
        handleCloseDecryptedPassword();
        await handleDeleteFilesAndFolders();
        break;
      case "get link":
        // handleCloseDecryptedPassword();
        // handleGetFolderURL?.(dataForEvent.data);
        setOpenGetLink(true);
        handleCloseDecryptedPassword();
        break;
      case "one-time-link":
        setOpenOneTimeLink(true);
        handleCloseDecryptedPassword();
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
      case "export-csv":
        handleCloseDecryptedPassword();
        setCsvFolder({
          folderId: dataForEvent.data?._id,
          folderName: replacetDotWithDash(dataForEvent.data?.name),
        });
        break;
      case "share":
        handleCloseDecryptedPassword();
        setShareDialog(true);
        break;

      case "double click":
        handleCloseDecryptedPassword();
        handleDoubleClick();

        break;
      default:
        break;
    }
  }

  // handle clear encryption password
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

  /* handle download folders */
  const handleDownloadFolder = async () => {
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
            action: null,
            data: {
              ...state.data,
              totalDownload: dataForEvent.data.totalDownload + 1,
            },
          }));
          customGetSubFoldersAndFiles();
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },

        onClosure: () => {
          setIsAutoClose(false);
          setFileDetailsDialog(false);
        },
      },
    );
    // await manageFolder.handleDownloadFolder(
    //   {
    //     id: dataForEvent.data?._id,
    //     folderName: dataForEvent.data?.name,
    //     newPath: dataForEvent.data.newPath,
    //   },
    //   {
    //     onFailed: async (error) => {
    //       errorMessage(error, 2000);
    //     },
    //     onSuccess: async () => {
    //       successMessage("Download successful", 2000);
    //     },
    //     onClosure: async () => {
    //
    //       resetDataForEvent();
    //     },
    //   },
    // );
  };

  const handleCreateFileDrop = async (
    link: string,
    date: any,
    values: any,
    activePrivateFileDrop: any,
  ) => {
    try {
      if (activePrivateFileDrop) {
        const fileDropLink = await updateFileDrop({
          variables: {
            id: activePrivateFileDrop._id,
            input: convertObjectEmptyStringToNull({
              url: link,
              expiredAt: date,
              title: values?.title,
              description: values?.description || null,
              folderId: dataForEvent.data?._id,
            }),
          },
        });
        if (fileDropLink?.data?.createDrop) {
          successMessage("Updated file-drop link successfully!", 2000);
        }
      } else {
        const fileDropLink = await createFileDropLink({
          variables: {
            input: convertObjectEmptyStringToNull({
              url: link,
              expiredAt: date,
              title: values?.title,
              description: values?.description || null,
              folderId: dataForEvent.data?._id,
            }),
          },
        });
        if (fileDropLink?.data?.createDrop?._id) {
          successMessage("Created file-drop link successfully!", 2000);
        }
      }
      resetDataForEvent();
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
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
          setDataForEvent((state) => ({
            ...state,
            action: null,
            data: {
              ...state.data,
              totalDownload: dataForEvent.data.totalDownload + 1,
            },
          }));
          customGetSubFoldersAndFiles();
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },

        onClosure: () => {
          setIsAutoClose(false);
          setFileDetailsDialog(false);
        },
      },
    );
  };

  const handleGetLinkClose = () => {
    setOpenGetLink(false);
    // setDataGetUrl(dataForEvent.data);
    setDataForEvent((prev: any) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  const handleGenerateGetLink = () => {
    setDataForEvent((prev: any) => {
      return {
        ...prev,
        action: "",
      };
    });

    setOpenGetLink(false);
  };

  const handleOneTimeLinkClose = () => {
    setDataForEvent((prev: any) => {
      return {
        ...prev,
        action: "",
      };
    });
    setOpenOneTimeLink(false);
  };

  const handleOneTimeLinkSubmit = () => {
    setOpenOneTimeLink(false);
    setDataForEvent((prev: any) => {
      return {
        ...prev,
        action: "",
      };
    });
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
            resetDataForEvent();
            customGetSubFoldersAndFiles();
            setIsAutoClose(true);
          },
        });
      } else {
        await updateFile({
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
            successMessage("Delete file successful!!", 2000);
            customGetSubFoldersAndFiles();
            resetDataForEvent();
            setIsAutoClose(true);
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
      if (dataForEvent.data.type == "folder" || dataForEvent.type == "folder") {
        await manageFolder.handleRenameFolder(
          {
            id: dataForEvent.data._id,
            inputNewFolderName: name,
            checkFolder: dataForEvent.data.check,
            parentKey: parentFolder?._id,
          },
          {
            onSuccess: async () => {
              successMessage("Update Folder successful", 2000);
              customGetSubFoldersAndFiles();
            },
            onFailed: async (error: any) => {
              const cutErr = error.message.replace(
                /(ApolloError: )?Error: /,
                "",
              );
              errorMessage(
                manageGraphqlError.handleErrorMessage(cutErr) as string,
                3000,
              );
            },
            onClosure: () => {
              setIsAutoClose(true);
              setRenameDialogOpen(false);
              resetDataForEvent();
            },
          },
        );
      } else {
        await manageFile.handleRenameFile(
          {
            id: dataForEvent.data._id,
          },
          name,
          {
            onSuccess: async () => {
              customGetSubFoldersAndFiles();
              successMessage("Update File successful", 2000);
              await handleActionFile("edit");
            },
            onClosure: () => {
              setIsAutoClose(true);
              setRenameDialogOpen(false);
              resetDataForEvent();
            },
          },
        );
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleAddPin = async () => {
    await manageFolder.handleAddPinFolder(
      dataForEvent.data._id,
      dataForEvent.data.pin ? 0 : 1,
      {
        onSuccess: async () => {
          handleTriggerFolder();
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
          customGetSubFoldersAndFiles();
        },
        onFailed: (error) => {
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            manageGraphqlError.handleErrorMessage(cutErr) as string,
            3000,
          );
        },
        onClosure: () => {
          resetDataForEvent();
          setIsAutoClose(true);
          setRenameDialogOpen(false);
        },
      },
    );
  };

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
          customGetSubFoldersAndFiles();
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

  useEffect(() => {
    if (dataForEvent.action === "rename") {
      setName(dataForEvent.data.name);
    }
  }, [dataForEvent.action]);

  const handleFolderNavigate = async (path) => {
    await getFolders({
      variables: {
        where: {
          path,
          createdBy: user?._id,
          status: "active",
        },
      },
      onCompleted: (data: any) => {
        const [dataById] = data?.folders?.data || [];
        const base64URL = Base64.encodeURI(dataById.url);
        if (base64URL !== params.id) {
          fetchSubFoldersAndFiles.resetFolderData();
          fetchSubFoldersAndFiles.resetFileData();
          resetDataForEvent();
          navigate(`/folder/${base64URL}`);
        }
      },
    });
  };

  const handleDoubleClick = () => {
    fetchSubFoldersAndFiles.resetFolderData();
    fetchSubFoldersAndFiles.resetFileData();
    const base64URL = Base64.encodeURI(dataForEvent.data?.url);
    navigate(`/folder/${base64URL}`);
    resetDataForEvent();
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
  const handleClearMultipleFileData = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  const handleFolderClick = useCallback(
    (data: IFolderTypes) => {
      dispatch(setMenuToggle({ isStatus: "preview" }));
      if (
        isMobile &&
        !isFolderSelected &&
        isToggleMenu.isStatus === "preview"
      ) {
        handleFolderDoubleClick(data);
      } else {
        handleMultipleFolderData(data?._id);
      }
    },
    [
      dispatch,
      isMobile,
      isToggleMenu.isStatus,
      isToggleMenu.isToggle,
      isFolderSelected,
    ],
  );

  const handleFolderDoubleClick = (data: IFolderTypes) => {
    setDataForEvent({
      action: "folder double click",
      data: data,
    });
  };

  const handleClick = useCallback(
    async (data: IMyCloudTypes) => {
      dispatch(setMenuToggle({ isStatus: "preview" }));
      if (isToggleMenu.isStatus !== "preview" || isSelected) {
        return;
      }
      setDataForEvent({
        action: "preview",
        data,
      });
    },
    [dispatch, isToggleMenu.isStatus, isToggleMenu.isToggle, isSelected],
  );

  return (
    <Fragment>
      <DialogAlert
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          resetDataForEvent();
        }}
        onClick={handleDeleteFilesAndFolders}
        title="Delete this item?"
        message={
          "If you click yes " +
          (dataForEvent.data.name || dataForEvent.data.name) +
          " will be deleted?"
        }
      />
      <SearchExtend
        parentFolder={parentFolder}
        open={searchOpen}
        handleClose={handleCloseSearch}
      />
      <TitleAndSwitch className="title-n-switch" sx={{ my: 2 }}>
        {dataSelector?.selectionFileAndFolderData?.length > 0 ? (
          <MenuMultipleSelectionFolderAndFile
            onPressShare={() => {
              setShareMultipleDialog(true);
            }}
            onOneTimeLinks={handleOneTimeLinkMultiFiles}
            onManageLink={handleGetLinkMultipe}
            onPressLockData={handleOpenMultiplePassword}
            onPressSuccess={() => {
              handleClearMultipleFileAndFolder();
              customGetSubFoldersAndFiles();
            }}
          />
        ) : (
          <Fragment>
            <Typography
              sx={{
                display: "flex",
              }}
              component="div"
            >
              <BreadcrumbNavigate
                title="my Cloud"
                titlePath="/my-cloud"
                user={user}
                path={breadCrumbData}
                folderId={parentFolder?._id}
                handleNavigate={handleFolderNavigate}
              />

              {(fetchSubFoldersAndFiles.folders.isDataFound ||
                fetchSubFoldersAndFiles.files.isDataFound ||
                inputSearch) &&
                !isMobile && (
                  <Typography sx={{ ml: 5 }} component="div">
                    <InputSearch
                      inputProps={{
                        placeholder: "Search within this folder...",
                        sx: {
                          paddingTop: (theme: {
                            spacing: (arg0: number) => any;
                          }) => theme.spacing(0.5),
                          paddingBottom: (theme: {
                            spacing: (arg0: number) => any;
                          }) => theme.spacing(0.5),
                          width: "200px",
                        },
                      }}
                      data={{
                        inputSearch: inputSearch,
                        setInputHover: setInputHover,
                        onChange: handleOnSearchChange,
                        onEnter: () => {},
                      }}
                    />
                  </Typography>
                )}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isMobile && (
                <span style={{ marginTop: "8px" }}>
                  <CiSearch size={24} onClick={() => setSearchOpen(true)} />
                </span>
              )}
              {fetchSubFoldersAndFiles.folders.isDataFound !== null &&
                fetchSubFoldersAndFiles.files.isDataFound !== null &&
                (fetchSubFoldersAndFiles.folders.isDataFound ||
                  fetchSubFoldersAndFiles.files.isDataFound) && (
                  <SwitchPages
                    handleToggle={handleToggle}
                    toggle={toggle === "grid" ? "grid" : "list"}
                    setToggle={setToggle}
                  />
                )}
            </Box>
          </Fragment>
        )}
      </TitleAndSwitch>

      <MUI.ExtendContainer>
        {fetchSubFoldersAndFiles.folders.isDataFound !== null &&
          fetchSubFoldersAndFiles.files.isDataFound !== null &&
          (fetchSubFoldersAndFiles.folders.isDataFound ||
            fetchSubFoldersAndFiles.files.isDataFound) && (
            <MUI.ExtendList>
              <Fragment>
                {fetchSubFoldersAndFiles.folders.total > 0 && (
                  <MUI.ExtendItem>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold">
                        Folders
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isMobile && toggle !== "list" && (
                          <Typography
                            sx={{
                              p: 2,
                              fontSize: "1rem",
                            }}
                            onClick={() => {
                              dispatch(toggleFolderSelected(!isFolderSelected));
                              handleClearMultipleFileData();
                            }}
                          >
                            {isFolderSelected ? "Deselect" : "Select"}
                          </Typography>
                        )}

                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: "1rem",
                            color: "initial !important",
                            fontWeight: "normal !important",
                          }}
                          mr={3}
                        >
                          {fetchSubFoldersAndFiles.folderTotal || 0} Items
                        </Typography>
                      </Box>
                    </Box>
                    <Fragment>
                      {toggle === "grid" && (
                        <FileCardContainer>
                          {fetchSubFoldersAndFiles.folders.data.map(
                            (data: any, index: number) => {
                              return (
                                <FolderGridItem
                                  key={index}
                                  open={open}
                                  file_id={
                                    parseInt(data?.total_size) > 0
                                      ? true
                                      : false
                                  }
                                  id={data?._id}
                                  isContainFiles={
                                    parseInt(data?.total_size) > 0
                                      ? true
                                      : false
                                  }
                                  folder_name={data?.folder_name}
                                  selectType={"folder"}
                                  setIsOpenMenu={setIsOpenMenu}
                                  isOpenMenu={isOpenMenu}
                                  isCheckbox={true}
                                  isPinned={data.pin ? true : false}
                                  onOuterClick={() => {
                                    setMultiChecked(multiChecked);
                                    setChecked({});
                                  }}
                                  cardProps={{
                                    onClick: () =>
                                      isMobile
                                        ? handleFolderClick(data)
                                        : handleMultipleFolderData(data._id),
                                    onDoubleClick: () =>
                                      handleFolderDoubleClick(data),

                                    ...(dataSelector?.selectionFileAndFolderData?.find(
                                      (el: any) =>
                                        el?.id === data?._id &&
                                        el?.checkType === "folder",
                                    ) && {
                                      ishas: "true",
                                    }),
                                  }}
                                  menuItem={favouriteMenuItems?.map(
                                    (menuItems, index) => {
                                      return (
                                        <MenuDropdownItem
                                          key={index}
                                          disabled={
                                            data?.total_size > 0
                                              ? false
                                              : menuItems.disabled
                                          }
                                          className="menu-item"
                                          isPinned={data.pin ? true : false}
                                          isPassword={
                                            data.filePassword ||
                                            data.access_password
                                              ? true
                                              : false
                                          }
                                          title={menuItems.title}
                                          icon={menuItems.icon}
                                          onClick={() => {
                                            setDataForEvent({
                                              data: data,
                                              action: menuItems.action,
                                            });
                                          }}
                                        />
                                      );
                                    },
                                  )}
                                />
                              );
                            },
                          )}
                        </FileCardContainer>
                      )}
                      {toggle !== "grid" && (
                        <ExtendFolderDataGrid
                          isFromSharingUrl={false}
                          pagination={{
                            total: Math.ceil(
                              fetchSubFoldersAndFiles.folders.total /
                                _ITEM_GRID_PER_PAGE,
                            ),
                            currentPage: currentFolderPage,
                            setCurrentPage: setCurrentFolderPage,
                          }}
                          data={fetchSubFoldersAndFiles.folders.data}
                          dataSelector={dataSelector}
                          user={user}
                          handleEvent={(action: string, data: any) => {
                            setDataForEvent({
                              action,
                              type: "folder",
                              data: {
                                ...data,
                                type: "folder",
                              },
                            });
                          }}
                          handleSelection={handleMultipleFolderData}
                        />
                      )}
                    </Fragment>
                  </MUI.ExtendItem>
                )}
                <Fragment>
                  <Fragment>
                    {fetchSubFoldersAndFiles.files.total > 0 && (
                      <MUI.ExtendItem>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="h4" fontWeight="bold">
                            Files
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {isMobile && toggle !== "list" && (
                              <Typography
                                sx={{
                                  p: 2,
                                  fontSize: "1rem",
                                }}
                                onClick={() => {
                                  dispatch(
                                    dispatch(toggleSelected(!isSelected)),
                                  );
                                  handleClearMultipleFileData();
                                }}
                              >
                                {isSelected ? "Deselect" : "Select"}
                              </Typography>
                            )}
                            <Typography
                              sx={{
                                p: 2,
                                fontSize: "1rem",
                              }}
                              onClick={() => {
                                dispatch(dispatch(toggleSelected(!isSelected)));
                                handleClearMultipleFileData();
                              }}
                            >
                              {fetchSubFoldersAndFiles.fileTotal || 0} Items
                            </Typography>
                          </Box>
                        </Box>
                        <Fragment>
                          {toggle === "grid" && (
                            <FileCardContainer>
                              {fetchSubFoldersAndFiles.files.data.map(
                                (data: any, index: number) => {
                                  return (
                                    <FileCardItem
                                      cardProps={{
                                        onClick: isMobile
                                          ? async () => await handleClick(data)
                                          : undefined,

                                        onDoubleClick: !isMobile
                                          ? () => {
                                              setDataForEvent({
                                                action: "preview",
                                                data,
                                              });
                                            }
                                          : undefined,
                                      }}
                                      id={data?._id}
                                      isCheckbox={true}
                                      filePassword={data?.filePassword}
                                      imagePath={
                                        user?.newName +
                                        "-" +
                                        user?._id +
                                        "/" +
                                        (data.newPath
                                          ? removeFileNameOutOfPath(
                                              data.newPath,
                                            )
                                          : "") +
                                        data.newName
                                      }
                                      user={user}
                                      selectType={"file"}
                                      handleSelect={handleMultipleFileData}
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
                                      fileType={getShortFileTypeFromFileType(
                                        data.type,
                                      )}
                                      // name={data.name}
                                      name={combineOldAndNewFileNames(
                                        data?.name,
                                        data?.newName,
                                      )}
                                      key={index}
                                      menuItems={menuItems.map(
                                        (menuItem, index) => {
                                          return (
                                            <MenuDropdownItem
                                              isFavorite={
                                                data.favorite ? true : false
                                              }
                                              isPassword={
                                                data.password ||
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
                            </FileCardContainer>
                          )}
                          {toggle === "list" && (
                            <ExtendFileDataGrid
                              isFromSharingUrl={false}
                              pagination={{
                                total: Math.ceil(
                                  fetchSubFoldersAndFiles.apiTotal /
                                    _ITEM_GRID_PER_PAGE,
                                ),
                                currentPage: currentFilePage,
                                setCurrentPage: setCurrentFilePage,
                                totalItems: fetchSubFoldersAndFiles.apiTotal,
                              }}
                              user={user}
                              dataSelector={dataSelector}
                              data={fetchSubFoldersAndFiles.files.data}
                              handleEvent={(action: string, data: any) => {
                                setDataForEvent({
                                  action,
                                  data,
                                });
                              }}
                              handleSelection={handleMultipleFileData}
                            />
                          )}
                        </Fragment>
                      </MUI.ExtendItem>
                    )}
                  </Fragment>
                </Fragment>

                {!detectResizeWindow.canBeScrolled &&
                  limitScroll < total &&
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
                          size="small"
                          variant="outlined"
                          onClick={handleViewMore}
                        >
                          Load more
                        </Button>
                      </Box>
                    </Box>
                  )}
              </Fragment>
            </MUI.ExtendList>
          )}
      </MUI.ExtendContainer>

      {shareDialog && (
        <DialogCreateShare
          onDeletedUserFromShareSave={handleDeletedUserFromShareOnSave}
          onChangedUserPermissionFromShareSave={
            handleChangedUserPermissionFromShareSave
          }
          sharedUserList={manageUserFromShare.sharedUserList}
          onClose={() => {
            setShareDialog(false);
            resetDataForEvent();
          }}
          open={shareDialog}
          data={{
            ...dataForEvent.data,
            folder_type:
              dataForEvent.data?.folder_type === "folder" ? "folder" : "",
            folder_name: dataForEvent.data.name,
            filename: dataForEvent.data.name,
            ownerId: {
              _id: dataForEvent.data?.createdBy?._id,
              email: dataForEvent.data?.createdBy?.email,
              firstName: dataForEvent.data?.createdBy?.firstName,
              lastName: dataForEvent.data?.createdBy?.lastName,
            },
          }}
          ownerId={{
            ...dataForEvent.data,
            _id: dataForEvent.data?.createdBy?._id,
            newName: dataForEvent.data?.createdBy?.newName,
            email: dataForEvent.data?.createdBy?.email,
            firstName: dataForEvent.data?.createdBy?.firstName,
            lastName: dataForEvent.data?.createdBy?.lastName,
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
            resetDataForEvent();
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
            dataForEvent?.data?.newName
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
                setDataForEvent((prev: any) => {
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

      <DialogAlert
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          resetDataForEvent();
        }}
        onClick={handleDeleteFilesAndFolders}
        title="Delete this item?"
        message={
          "If you click yes " +
          (dataForEvent.data.name || dataForEvent.data.name) +
          " will be deleted?"
        }
      />

      <DialogCreateFileDrop
        isOpen={openFileDrop}
        onClose={handleCloseFileDrop}
        handleChange={handleCreateFileDrop}
        folderId={dataForEvent.data?._id}
      />

      <DialogCreateFilePassword
        isOpen={isPasswordLink}
        dataValue={dataForEvent.data}
        isUpdate={isUpdate}
        filename={dataForEvent.data?.name}
        checkType={dataForEvent.data?.folder_type || "file"}
        onConfirm={() => {
          customGetSubFoldersAndFiles();
        }}
        onClose={handleClosePasswordLink}
      />

      <DialogCreateMultipleFilePassword
        isOpen={isMultiplePasswordLink}
        onClose={handleCloseMultiplePassword}
        onConfirm={() => {
          customGetSubFoldersAndFiles();
          handleClearMultipleFileAndFolder();
        }}
      />

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={dataForEvent.data?.name}
        newFilename={dataForEvent.data?.newName}
        filePassword={
          dataForEvent.data?.filePassword || dataForEvent.data?.access_password
        }
        onConfirm={handleSubmitDecryptedPassword}
        onClose={handleCloseDecryptedPassword}
      />

      <CSVLink
        ref={csvRef}
        data={useDataExportCSV.data}
        filename={csvFolder.folderName}
        target="_blank"
      />

      <DialogCreateMultipleShare
        onClose={() => {
          resetDataForEvent();
          handleClearMultipleFileAndFolder();
          setShareMultipleDialog(false);
        }}
        dataSelector={dataSelector?.selectionFileAndFolderData}
        open={shareMultipleDialog}
        data={dataForEvent.data}
      />

      {showPreview && (
        <DialogPreviewFileSlide
          open={showPreview}
          handleClose={handleClosePreview}
          data={dataForEvent.data}
          user={user}
          mainFile={fetchSubFoldersAndFiles.files.data}
          propsStatus="extendFolder"
        />
      )}
      <DialogRenameFile
        open={renameDialogOpen}
        onClose={() => {
          resetDataForEvent();
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
          resetDataForEvent();
        }}
        onClick={handleDeleteFilesAndFolders}
        title="Delete this item?"
        message={
          "If you click yes " +
          (dataForEvent.data.name || dataForEvent.data.name) +
          " will be deleted?"
        }
      />
      {openGetLink && dataForEvent.data && (
        <DialogGetLink
          isOpen={openGetLink}
          onClose={handleGetLinkClose}
          onCreate={handleGenerateGetLink}
          data={dataForEvent.data}
        />
      )}
      {openOneTimeLink && dataForEvent?.data && (
        <DialogOneTimeLink
          isOpen={openOneTimeLink}
          onClose={handleOneTimeLinkClose}
          onCreate={handleOneTimeLinkSubmit}
          data={dataForEvent?.data}
        />
      )}
    </Fragment>
  );
}

export default ExtendFolder;
