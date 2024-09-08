import { useLazyQuery, useMutation } from "@apollo/client";
import { ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import { green } from "@mui/material/colors";
import {
  MUTATION_ACTION_FILE,
  QUERY_FILE,
  QUERY_FILE_CATEGORY,
} from "api/graphql/file.graphql";
import { MUTATION_CREATE_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import MyCloundEmpty from "assets/images/empty/my-clound-empty.svg?react";
import Empty from "components/Empty";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import MediaCard from "components/MediaCard";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SwitchPages from "components/SwitchPage";
import DialogCreateFileDrop from "components/dialog/DialogCreateFileDrop";
import DialogCreateFilePassword from "components/dialog/DialogCreateFilePassword";
import DialogCreateMultipleFilePassword from "components/dialog/DialogCreateMultipleFilePassword";
import DialogCreateMultipleShare from "components/dialog/DialogCreateMultipleShare";
import DialogCreateShare from "components/dialog/DialogCreateShare";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFile from "components/dialog/DialogPreviewFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import ProgressingBar from "components/loading/ProgressingBar";
import FileCardSlider from "components/slider/FileCardSlider";
import menuItems, { favouriteMenuItems } from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useManageFolder from "hooks/folder/useManageFolder";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useAuth from "hooks/useAuth";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useDetectResizeWindow from "hooks/useDetectResizeWindow";
import useExportCSV from "hooks/useExportCSV";
import useManageGraphqlError from "hooks/useManageGraphqlError";
// import useScroll from "hooks/useScroll";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import { Base64 } from "js-base64";
import moment from "moment";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { BiTime } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import * as MUIFOLDER from "styles/clientPage.style";
import * as MUI from "styles/my-cloud/myCloud.style";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getFileType,
  getFolderName,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertObjectEmptyStringToNull } from "utils/object.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { replacetDotWithDash } from "utils/string.util";
import FolderGridItem from "../../../components/FolderGridItem";
import LinearProgress from "../../../components/LinearProgress";
import CloudFileDataGrid from "./CloudFileDataGrid";
import CloudFolderDataGrid from "./CloudFolderDataGrid";
import useScroll from "hooks/useScroll";

const ITEM_PER_PAGE_GRID = 20;

export function MyCloud() {
  const { user }: any = useAuth();
  const manageGraphqlError = useManageGraphqlError();

  const [getFolder] = useLazyQuery(QUERY_FOLDER, { fetchPolicy: "no-cache" });

  const [getFile, { loading: fileLoading }] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });
  const manageFolder = useManageFolder({ user });
  const manageFile = useManageFile({ user });
  const [getCategoryAll, { loading: countLoading }] = useLazyQuery(
    QUERY_FILE_CATEGORY,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );

  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const [deleteFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [folder, setFolder] = useState<any>(null);
  const [getCategory, setGetCategory] = useState(null);
  const [mainFile, setMainFile] = useState<any>(null);
  const [progressing, setProgressing] = useState(0);
  const [procesing, setProcesing] = useState(true);
  const [showProgressing, setShowProgressing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordLink, setIsPasswordLink] = useState(false);
  const [isMultiplePasswordLink, setIsMultiplePasswordLink] = useState(false);
  const [shareMultipleDialog, setShareMultipleDialog] = useState(false);
  const [_checked, setChecked] = useState({});
  const [eventClick, setEventClick] = useState("");
  const [multiSelectId, setMultiSelectId] = useState<any[]>([]);
  const [multiChecked, setMultiChecked] = useState<any[]>([]);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [userPackage, setUserPackage] = useState<any>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  // slice in redux
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  // get download url
  const [dataDownloadURL, setDataDownloadURL] = useState(null);
  const handleDownloadUrl = useGetUrlDownload(dataDownloadURL);

  useEffect(() => {
    if (dataDownloadURL) {
      handleDownloadUrl?.(dataDownloadURL);
      setDataDownloadURL(null);
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

  const handleCloseRenameDialog = () => {
    resetDataForEvent();
    setRenameDialogOpen(false);
  };

  useEffect(() => {
    if (!renameDialogOpen) {
      setName("");
    }
  }, [renameDialogOpen]);

  useEffect(() => {
    const packages = user?.packageId;
    setUserPackage(packages);
  }, [user]);

  const open = Boolean(null);
  const [fileDetailsDialog, setFileDetailsDialog] = useState(false);
  const [fileType, setFileType] = useState("");
  const [path, setPath] = useState("");
  const [openShare, setOpenShare] = useState(Boolean(false));
  const [toggle, setToggle] = useState<any>(null);
  const [_optionsValue, setOptionsValue] = useState(false);
  const [getValue, setGetValue] = useState<any>(null);
  const [viewMore, setViewMore] = useState(20);
  // const [fileViewMore, setFileViewMore] = useState(20);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const { setIsAutoClose, isAutoClose } = useMenuDropdownState();
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();
  const [currentFilePage, setCurrentFilePage] = useState(1);
  const detectResizeWindow = useDetectResizeWindow();
  const { limitScroll, addMoreLimit } = useScroll({
    total,
    limitData: ITEM_PER_PAGE_GRID,
  });
  const { setFolderId, handleTriggerFolder }: any = useContext(FolderContext);
  const [dataGetUrl, setDataGetUrl] = useState(null);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  // const totalDownloadHandle = useDownloadFile(afterDowload);
  const handleGetFolderURL = useGetUrl(dataGetUrl || getValue);
  const [openFileDrop, setOpenFileDrop] = useState(false);
  const [showEncryptPassword, setShowEncryptPassword] = useState(false);
  const [folderDropId, setFolderDropId] = useState(0);
  const [currentFolderId, setCurrentFolderId] = useState(0);
  const [dataForEvent, setDataForEvent] = useState<any>({
    data: {},
    action: "",
  });

  const manageUserFromShare = useManageUserFromShare({
    inputFileOrFolder: dataForEvent.data,
    inputType: dataForEvent.data?.folder_type,
    user,
  });

  const [csvFolder, setCsvFolder] = useState({
    folderId: "",
    folderName: " ",
  });
  const csvRef = useRef<any>();
  const useDataExportCSV = useExportCSV({
    folderId: csvFolder.folderId,
    exportRef: csvRef,
    onSuccess: () =>
      setCsvFolder({
        folderId: "",
        folderName: "",
      }),
  });

  useEffect(() => {
    if (useDataExportCSV.data?.length > 0) {
      setCsvFolder({
        folderId: "",
        folderName: "",
      });
    }
  }, [useDataExportCSV.data]);

  useEffect(() => {
    if (dataGetUrl) {
      handleGetFolderURL?.(dataGetUrl);
    }
  }, [dataGetUrl]);

  useEffect(() => {
    if (isAutoClose) {
      setDataGetUrl(null);
    }
  }, [isAutoClose]);

  useEffect(() => {
    const toggled = localStorage.getItem("toggle");
    if (toggled) {
      setToggle(toggled === "grid" ? "grid" : "list");
    } else {
      setToggle("list");
      localStorage.setItem("toggle", "list");
    }
  }, []);

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  const handleOpenPassword = () => {
    setIsPasswordLink(true);
  };
  const handleClosePassword = () => {
    setIsPasswordLink(false);
    setDataForEvent({
      action: "",
      data: {},
    });
  };

  const handleCloseMultiplePassword = () => {
    setIsMultiplePasswordLink(false);
    handleClearMultipleFileAndFolder();
  };

  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.folder_type === "folder") {
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

  const handleSubmitDecryptedPassword = async () => {
    if (eventClick === "get-link") {
      setDataGetUrl(dataForEvent.data);
      handleCloseDecryptedPassword();
    }

    if (eventClick === "share") {
      setDataForEvent((prev) => {
        return {
          ...prev,
          action: "",
        };
      });
      setShowEncryptPassword(false);
      setOpenShare(true);
    }

    if (eventClick === "export-csv") {
      setCsvFolder({
        folderId: dataForEvent.data?._id,
        folderName: replacetDotWithDash(dataForEvent.data?.folder_name),
      });
      handleCloseDecryptedPassword();
    }

    if (eventClick === "rename") {
      setShowEncryptPassword(false);
      setTimeout(() => {
        setRenameDialogOpen(true);
      }, 300);
    }

    if (eventClick === "detail") {
      setShowEncryptPassword(false);
      setTimeout(() => {
        setFileDetailsDialog(true);
      }, 300);
    }

    if (eventClick === "filedrop") {
      setShowEncryptPassword(false);
      setFolderDropId(dataForEvent.data?._id);
      handleOpenFileDropDialog(dataForEvent.data?._id);
    }

    if (eventClick === "double-click-folder") {
      handleOpenFolder(dataForEvent.data);
    }

    if (eventClick === "download") {
      handleCloseDecryptedPassword();
      if (dataForEvent.data?.folder_type === "folder") {
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          await handleGetDownloadLink();
        } else {
          await handleDownloadFolder(dataForEvent.data);
        }
      } else {
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetDownloadLink();
        } else {
          await handleDownloadFile(dataForEvent.data);
        }
      }
    }

    if (eventClick === "delete") {
      if (dataForEvent.data?.folder_type === "folder") {
        handleDeleteFolder(dataForEvent.data);
      } else {
        handleDeleteFile(dataForEvent.data);
      }

      setEventClick("");
      setShowEncryptPassword(false);
    }

    if (eventClick === "preview") {
      handleDataPreview();
      handleCloseDecryptedPassword();
    }
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

  // checked folder pagination
  const rowFolderpage = 20;
  let countPage = 0;
  for (let i = 1; i <= Math.ceil(totalPages / rowFolderpage); i++) {
    countPage = i;
  }

  // checked file pagination
  const rowFilePage = 20;
  let countFilePage = 0;
  for (let k = 1; k <= Math.ceil(total / rowFilePage); k++) {
    countFilePage = k;
  }

  const handleClickFolder = (_e, value) => {
    if (value.folder_type === "folder") {
      setName(value?.folder_name);
    } else {
      setName(value?.filename);
    }

    setChecked(value?._id);
    setPath(value.path);
    setOptionsValue(true);
    setGetValue(value);
  };

  const handleClose = () => {
    setOptionsValue(false);
    setGetValue(null);
    setMultiChecked([]);
    setMultiSelectId([]);
    resetDataForEvent();
  };

  const handleOpenMultiplePassword = () => {
    setIsMultiplePasswordLink(true);
  };

  const handleShareClose = () => {
    handleClose();
    setOpenShare(false);
  };

  // open folder
  const handleOpenFolder = (value) => {
    setFolderId(value?._id);
    handleClose();
    const url = value?.url;

    const base64URL = Base64.encodeURI(url);
    navigate(`/folder/${base64URL}`);
  };

  const handleClosePreview = () => {
    resetDataForEvent();
    setShowPreview(false);
  };

  // query file grid
  const queryFileGrid = async () => {
    try {
      if (toggle === "grid") {
        await getFile({
          variables: {
            where: {
              createdBy: user?._id,
              checkFile: "main",
              status: "active",
              source: "default",
            },
            orderBy: "updatedAt_DESC",
            limit: limitScroll,
            // limit: fileViewMore,
          },
          onCompleted: (data) => {
            if (data) {
              setMainFile(data?.files?.data);
              setTotal(data?.files?.total);
            }
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // query files
  const queryFile = async () => {
    try {
      setLoading(true);
      if (toggle === "list") {
        await getFile({
          variables: {
            where: {
              createdBy: user?._id,
              checkFile: "main",
              status: "active",
              source: "default",
            },
            orderBy: "updatedAt_DESC",
            limit: rowFilePage,
            skip: rowFilePage * (currentFilePage - 1),
          },
          onCompleted: (data) => {
            if (data) {
              setMainFile(data?.files?.data);
              setTotal(data?.files?.total);
            }
          },
        });
      }
      setLoading(false);
    } catch (error: any) {
      errorMessage(error, 3000);
    }
  };

  useEffect(() => {
    queryFile();
  }, [currentFilePage, countFilePage, toggle]);

  useEffect(() => {
    queryFileGrid();
  }, [
    limitScroll,
    // fileViewMore,
    toggle,
  ]);

  //query all files count and separate base on file type
  const queryCategory = async () => {
    await getCategoryAll({
      variables: {
        where: {
          createdBy: parseInt(user?._id),
        },
      },
      onError: (err: any) => {
        console.log({ err });
      },
      onCompleted: (data) => {
        if (data) {
          setGetCategory(data);
        }
      },
    });
  };

  useEffect(() => {
    queryCategory();
  }, []);

  //query all folder
  const queryFolder = async () => {
    setLoading(true);
    if (toggle === "list") {
      try {
        await getFolder({
          variables: {
            where: {
              checkFolder: "main",
              restore: "show",
              createdBy: user?._id,
            },
            orderBy: "pin_DESC",
            limit: rowFolderpage,
            skip: rowFolderpage * (currentPage - 1),
          },
          onCompleted: (data) => {
            if (data) {
              setFolder(data);
              setTotalPages(data?.folders?.total);
            }
          },
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await getFolder({
          variables: {
            where: {
              checkFolder: "main",
              restore: "show",
              createdBy: user?._id,
            },
            orderBy: "pin_DESC",
            limit: viewMore,
          },
          onCompleted: (data) => {
            if (data) {
              setFolder(data);
              setTotalPages(data?.folders?.total);
            }
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    queryFolder();
  }, [viewMore, currentPage, countPage, toggle]);

  useEffect(() => {
    if (eventUploadTrigger?.triggerData?.isTriggered) {
      queryFolder();
      if (toggle === "list") {
        queryFile();
      } else {
        queryFileGrid();
      }
      queryCategory();
    }
  }, [eventUploadTrigger?.triggerData]);

  const checkUploadSuccessAll = localStorage.getItem("uploadSuccess");
  useEffect(() => {
    queryFolder();
  }, [checkUploadSuccessAll]);

  const handleViewMoreFolder = () => {
    setViewMore((prevState) => prevState + 20);
  };

  const handleViewMoreFile = () => {
    addMoreLimit();
    // setFileViewMore((prev) => prev + 20);
  };

  const handleDownloadFile = async (inputData) => {
    const data = inputData || getValue;

    const newFileData = [
      {
        id: data?._id,
        checkType: "file",
        newPath: data?.newPath ? data.newPath : "",
        newFilename: data?.newFilename || "",
        createdBy: {
          _id: data?.createdBy._id,
          newName: data?.createdBy?.newName,
        },
      },
    ];

    await manageFile.handleDownloadSingleFile(
      { multipleData: newFileData },
      {
        onSuccess: () => {
          successMessage("Download successful", 3000);
          setGetValue((prev) => {
            return {
              ...prev,
              totalDownload: parseInt(getValue?.totalDownload + 1),
            };
          });
          if (toggle === "list") {
            queryFile();
          } else {
            queryFileGrid();
          }
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },

        onClosure: () => {
          setIsAutoClose(true);
          setFileDetailsDialog(false);
          setGetValue(null);
          resetDataForEvent();
          setShowProgressing(false);
          setProcesing(false);
          setProgressing(0);
        },
      },
    );
  };

  // download more folder
  const handleDownloadFolders = async () => {
    for (let i = 0; i < multiSelectId.length; i++) {
      handleDownloadFolder(multiSelectId[i]);
    }
  };

  const handleDownloadFolder = async (data) => {
    const multipleData = [
      {
        id: data?._id,
        checkType: "folder",
        newPath: data?.newPath ? data.newPath : "",
        newFilename: data?.newFolder_name || "",
        createdBy: {
          _id: data?.createdBy._id,
          newName: data?.createdBy?.newName,
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
          successMessage("Download successful", 3000);
        },
        onClosure: async () => {
          setShowProgressing(false);
          setShowProgressing(false);
          resetDataForEvent();
          setFileDetailsDialog(false);
          setIsOpenMenu(false);
        },
      },
    );
  };

  const handleDeleteFile = async (data) => {
    await manageFile.handleDeleteFile(data._id, {
      onSuccess: () => {
        setIsAutoClose(true);
        resetDataForEvent();
        successMessage("Delete file successful!!", 3000);
        if (toggle === "list") {
          queryFile();
        } else {
          queryFileGrid();
        }
      },
      onFailed: (error) => {
        errorMessage(error, 3000);
      },
    });
  };

  const handleDeleteFolder = async (folderData) => {
    try {
      if (multiSelectId.length > 0) {
        for (let i = 0; i < multiSelectId.length; i++) {
          const data = await deleteFolder({
            variables: {
              where: {
                _id: multiSelectId[i]?._id,
              },
              data: {
                checkFolder: multiSelectId[i]?.checkFolder,
                status: "deleted",
              },
            },
          });
          if (data?.data?.updateFolders?._id) {
            queryFolder();
            setIsOpenMenu(false);
          }
        }
        setMultiSelectId([]);
        handleClose();
      } else {
        const data = await deleteFolder({
          variables: {
            where: {
              _id: folderData?._id,
            },
            data: {
              checkFolder: folderData?.checkFolder,
              status: "deleted",
            },
          },
        });
        if (data?.data?.updateFolders?._id) {
          queryFolder();
          setIsOpenMenu(false);
        }
        handleClose();
      }
      successMessage("Delete folder successful!", 3000);
    } catch (err) {
      errorMessage("Something wrong. Please try again!");
    }
  };

  // File action for count in recent file
  const handleActionFile = async (val, data?) => {
    try {
      await fileAction({
        variables: {
          fileInput: {
            createdBy: parseInt(user?._id),
            fileId: parseInt(data?._id ? data?._id : getValue?._id),
            actionStatus: val,
          },
        },
      });
    } catch (error: any) {
      errorMessage(error, 3000);
    }
  };

  const handleMultipleFolderData = (selectData) => {
    const optionValue = folder?.folders?.data?.find(
      (folder) => folder._id === selectData,
    );

    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: optionValue?._id,
          name: optionValue?.folder_name,
          checkType: "folder",
          newPath: optionValue?.newPath || "",
          totalSize: parseInt(optionValue?.total_size),
          newFilename: optionValue?.newFolder_name || "",
          dataPassword: optionValue?.access_password || "",
          shortLink: optionValue?.shortUrl,
          createdBy: {
            _id: optionValue?.createdBy?._id,
            newName: optionValue?.createdBy?.newName,
          },
          pin: optionValue?.pin === 1 ? true : false,
        },
      }),
    );
  };

  const handleMultipleFileData = (selectData) => {
    const optionValue = mainFile?.find((file) => file._id === selectData);

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
      }),
    );
  };

  /* data for Breadcrumb */
  const breadcrumbData = useBreadcrumbData(
    getValue?.path || (getValue?.path, getValue?.filename),
    "",
  );

  const handleFileDetailDialogBreadcrumbFolderNavigate = async (link) => {
    const result = await getFolder({
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

  // open file drop
  const handleOpenFileDropDialog = (id) => {
    setCurrentFolderId(id);
    setOpenFileDrop(true);
    resetDataForEvent();
  };

  // close file drop
  const handleCloseFileDropDialog = () => {
    setOpenFileDrop(false);
  };

  const handleCreateFileDrop = async (
    link,
    date,
    values,
    activePrivateFileDrop,
  ) => {
    try {
      if (activePrivateFileDrop) {
        const fileDropLink = await createFileDropLink({
          variables: {
            input: convertObjectEmptyStringToNull({
              url: link,
              expiredAt: date,
              title: values?.title,
              description: values?.description || null,
              folderId: folderDropId,
              allowDownload: values.allowDownload,
              allowMultiples: values.allowMultiples,
              allowUpload: values.allowUpload,
            }),
          },
        });
        if (fileDropLink?.data?.createDrop) {
          successMessage("Updated file-drop link successfully!", 3000);
        }
      } else {
        const fileDropLink = await createFileDropLink({
          variables: {
            input: convertObjectEmptyStringToNull({
              url: link,
              expiredAt: date,
              title: values?.title,
              description: values?.description || null,
              folderId: folderDropId,
              allowDownload: values.allowDownload,
              allowMultiples: values.allowMultiples,
              allowUpload: values.allowUpload,
            }),
          },
        });
        if (fileDropLink?.data?.createDrop?._id) {
          successMessage("Created file-drop link successfully!", 3000);
        }
      }
    } catch (error) {
      console.log(error);
      errorMessage("Something went wrong!", 3000);
    }
  };

  const resetDataForEvent = () => {
    setDataForEvent({
      data: {},
      action: "",
    });
  };

  const handleDataPreview = () => {
    setShowPreview(true);
    setOpenPreview(true);
    setName(dataForEvent.data?.filename);
    setNewName(dataForEvent.data?.newFilename);
    setFileType(dataForEvent.data?.fileType);
    setPath(dataForEvent.data?.newPath);
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
        successMessage("Deleted user out of share successful!!", 3000);
      },
      onFailed: (error) => {
        errorMessage(error, 3000);
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
        successMessage("Changed user permission of share successful!!", 3000);
      },
      onFailed: (error) => {
        errorMessage(error, 3000);
      },
    });
  };

  useEffect(() => {
    if (dataForEvent.data && dataForEvent.action) {
      menuOnClick(dataForEvent.action);
    }
  }, [dataForEvent.action]);

  const menuOnClick = async (action) => {
    setIsAutoClose(true);
    setGetValue(dataForEvent.data);

    setName(dataForEvent.data?.filename || dataForEvent.data?.folder_name);
    setTimeout(() => {
      setOptionsValue(false);
    }, 500);

    const checkPassword = isCheckPassword();

    switch (action) {
      case "rename": {
        setEventClick("rename");
        const checkPassword = isCheckPassword();

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setRenameDialogOpen(true);
        }
        break;
      }
      case "download": {
        setEventClick("download");
        if (dataForEvent.data?.folder_type === "folder") {
          setEventClick("download");
          if (multiSelectId.length > 0) {
            await handleDownloadFolders();
          } else {
            if (checkPassword) {
              setShowEncryptPassword(true);
            } else {
              if (
                userPackage?.downLoadOption === "another" ||
                userPackage?.category === "free"
              ) {
                handleGetDownloadLink();
              } else {
                await handleDownloadFolder(dataForEvent.data);
              }
            }
          }
        } else {
          if (checkPassword) {
            setShowEncryptPassword(true);
          } else {
            if (
              userPackage?.downLoadOption === "another" ||
              userPackage?.category === "free"
            ) {
              handleGetDownloadLink();
            } else {
              await handleDownloadFile(dataForEvent.data);
            }
          }
        }
        break;
      }
      case "delete": {
        setEventClick("delete");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          if (
            getValue?.folder_type === "folder" ||
            dataForEvent.data?.folder_type === "folder"
          ) {
            handleDeleteFolder(dataForEvent.data);
          } else {
            handleDeleteFile(dataForEvent.data);
          }
        }
        break;
      }
      case "get link": {
        setEventClick("get-link");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setDataGetUrl(dataForEvent.data);
          setDataForEvent((prev) => {
            return {
              ...prev,
              action: "",
            };
          });
        }
        break;
      }
      case "pin": {
        handleAddPin(dataForEvent.data);
        break;
      }
      case "favourite": {
        handleFavourite(dataForEvent.data);
        resetDataForEvent();
        break;
      }
      case "share": {
        setEventClick("share");
        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setOpenShare(true);
        }
        break;
      }
      case "filedrop": {
        setEventClick("filedrop");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFolderDropId(dataForEvent.data?._id);
          handleOpenFileDropDialog(dataForEvent.data?._id);
        }
        break;
      }
      case "detail": {
        setEventClick("detail");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFileDetailsDialog(true);
        }
        break;
      }
      case "password": {
        if (dataForEvent.data?.folder_type) {
          if (userPackage?.lockFolder === "on") {
            handleOpenPassword();
          } else {
            resetDataForEvent();
            errorMessage(
              "The package you've selected is not compatible. Please consider choosing a different one.",
              3000,
            );
          }
        } else {
          if (userPackage?.lockFile === "on") {
            handleOpenPassword();
          } else {
            resetDataForEvent();
            errorMessage(
              "The package you've selected is not compatible. Please consider choosing a different one.",
              3000,
            );
          }
        }
        break;
      }
      case "folder double click": {
        setEventClick("double-click-folder");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          handleOpenFolder(dataForEvent.data);
        }
        break;
      }
      case "preview": {
        setEventClick("preview");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          handleDataPreview();
        }
        break;
      }
      case "export-csv": {
        setEventClick("export-csv");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setCsvFolder({
            folderId: dataForEvent.data?._id,
            folderName: replacetDotWithDash(dataForEvent.data?.folder_name),
          });
          resetDataForEvent();
        }
        break;
      }
    }
  };

  // favourite function
  const handleFavourite = async (data) => {
    await manageFile.handleFavoriteFile(data._id, data.favorite ? 0 : 1, {
      onSuccess: async () => {
        setIsAutoClose(true);
        if (data.favorite) {
          if (toggle === "list") {
            queryFile();
          } else {
            queryFileGrid();
          }
          successMessage("One File removed from Favourite", 3000);
        } else {
          if (toggle === "list") {
            queryFile();
          } else {
            queryFileGrid();
          }
          resetDataForEvent();
          successMessage("One File added to Favourite", 3000);
        }
        setGetValue((state) => ({
          ...state,
          favorite: getValue?.favorite ? 0 : 1,
        }));
      },
      onFailed: (error: any) => {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(
            cutErr || "Something went wrong, Please try again",
          ) as string,
          3000,
        );
      },
    });
  };

  // pin folder
  const handleAddPin = async (data) => {
    await manageFolder.handleAddPinFolder(data._id, data.pin ? 0 : 1, {
      onSuccess: async () => {
        if (data.pin) {
          successMessage("One File removed from Pin", 3000);
        } else {
          successMessage("One File added to Pin", 3000);
        }
        setGetValue((state) => ({
          data: {
            ...state.data,
            pin: data.pin ? 0 : 1,
          },
        }));
        handleTriggerFolder();
        queryFolder();
      },
      onFailed: (error: any) => {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(
            cutErr || "Sorry!!. Something went wrong. Please try again later!!",
          ) as string,
          3000,
        );
      },
      onClosure: () => {
        resetDataForEvent();
        setIsAutoClose(true);
        setOptionsValue(false);
      },
    });
  };

  const handleRenameFolderOrFile = async (newRename) => {
    if (getValue?.folder_type === "folder") {
      await manageFolder.handleRenameFolder(
        {
          id: getValue?._id,
          inputNewFolderName: newRename,
          checkFolder: getValue.checkFolder,
        },
        {
          onSuccess: async () => {
            handleCloseRenameDialog();
            successMessage("Update successful", 3000);
            queryFolder();
          },
          onFailed: async (error: any) => {
            const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
            errorMessage(
              manageGraphqlError.handleErrorMessage(
                cutErr || "Something went wrong, Please try again",
              ) as string,
              3000,
            );
          },
          onClosure: () => {
            setIsOpenMenu(false);
          },
        },
      );
    } else {
      const actionStatus = "edit";
      await manageFile.handleRenameFile({ id: getValue?._id }, newRename, {
        onSuccess: () => {
          handleCloseRenameDialog();
          handleActionFile(actionStatus);
          successMessage("Update File successful", 3000);
          if (toggle === "list") {
            queryFile();
          } else {
            queryFileGrid();
          }
        },
        onFailed: (error: any) => {
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            manageGraphqlError.handleErrorMessage(cutErr) as string,
            3000,
          );
        },
        onClosure: () => {
          setIsOpenMenu(false);
        },
      });
    }
  };

  const handleClearMultipleFileAndFolder = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearMultipleFileAndFolder();
  }, [dispatch, location]);

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
        <MUIFOLDER.TitleAndSwitch sx={{ my: 2 }}>
          {dataSelector?.selectionFileAndFolderData?.length ? (
            <MenuMultipleSelectionFolderAndFile
              onPressShare={() => {
                setShareMultipleDialog(true);
              }}
              onPressLockData={handleOpenMultiplePassword}
              onPressSuccess={() => {
                queryFolder();
                if (toggle === "list") {
                  queryFile();
                } else {
                  queryFileGrid();
                }
              }}
            />
          ) : (
            <Fragment>
              <MUIFOLDER.SwitchItem>
                <Typography variant="h5">My Cloud</Typography>
              </MUIFOLDER.SwitchItem>
              {(folder?.folders?.data?.length > 0 ||
                (mainFile !== null && mainFile?.length > 0)) && (
                <SwitchPages
                  handleToggle={handleToggle}
                  toggle={toggle}
                  setToggle={setToggle}
                />
              )}
            </Fragment>
          )}
        </MUIFOLDER.TitleAndSwitch>

        <MUI.DivCloud>
          {(folder?.folders?.data?.length > 0 ||
            (mainFile !== null && mainFile?.length > 0)) && (
            <Box>
              <Box sx={{ mb: 2 }}>
                {isMobile ? (
                  <FileCardSlider
                    getCount={getCategory}
                    countLoading={countLoading}
                  />
                ) : (
                  <MediaCard
                    getCount={getCategory}
                    countLoading={countLoading}
                  />
                )}

                <MUI.DivFolders>
                  {folder?.folders?.data?.length > 0 && (
                    <MUIFOLDER.TitleAndIcon>
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Typography
                          display={
                            folder?.folders?.data?.length > 0 ? "" : "none"
                          }
                          variant="h4"
                        >
                          Folders
                        </Typography>
                        <Typography
                          display={
                            folder?.folders?.data?.length > 0 ? "" : "none"
                          }
                          variant="h5"
                          sx={{
                            fontSize: "1rem",
                            color: "initial !important",
                            fontWeight: "normal !important",
                          }}
                        >
                          {totalPages} Items
                        </Typography>
                      </Box>
                    </MUIFOLDER.TitleAndIcon>
                  )}
                  {toggle === "list" ? (
                    <Box>
                      {folder?.folders?.data?.length > 0 && (
                        <CloudFolderDataGrid
                          pagination={{
                            total: Math.ceil(
                              folder?.folders.total / rowFolderpage,
                            ),
                            currentPage,
                            setCurrentPage,
                          }}
                          data={folder?.folders?.data}
                          total={folder?.folders.total}
                          dataSelector={dataSelector}
                          handleEvent={async (action, data) => {
                            setGetValue(data);
                            setDataForEvent({
                              action,
                              data,
                            });
                          }}
                          handleSelection={handleMultipleFolderData}
                        />
                      )}
                    </Box>
                  ) : (
                    <Fragment>
                      <MUIFOLDER.FolderGrid>
                        {folder?.folders?.data?.map((item, index) => {
                          return (
                            <Fragment key={index}>
                              <FolderGridItem
                                open={open}
                                file_id={
                                  parseInt(item?.total_size) > 0 ? true : false
                                }
                                id={item?._id}
                                folder_name={item?.folder_name}
                                selectType={"folder"}
                                setIsOpenMenu={setIsOpenMenu}
                                isOpenMenu={isOpenMenu}
                                isPinned={item.pin ? true : false}
                                onOuterClick={() => {
                                  setMultiChecked(multiChecked);
                                  setChecked({});
                                }}
                                handleSelectionFolder={handleMultipleFolderData}
                                cardProps={{
                                  onClick: (e) => {
                                    handleMultipleFolderData(item?._id);
                                    handleClickFolder(e, item);
                                  },
                                  onDoubleClick: () => {
                                    setDataForEvent({
                                      action: "folder double click",
                                      data: item,
                                    });
                                  },

                                  ...(multiChecked.find(
                                    (id) => id === item?._id,
                                  ) && {
                                    ischecked: true,
                                  }),
                                  ...(dataSelector?.selectionFileAndFolderData?.find(
                                    (el) =>
                                      el?.id === item?._id &&
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
                                          item.file_id[0]?._id ||
                                          item.parentkey[0]?._id
                                            ? false
                                            : menuItems.disabled
                                        }
                                        className="menu-item"
                                        isPinned={item.pin ? true : false}
                                        isPassword={
                                          item.filePassword ||
                                          item.access_password
                                            ? true
                                            : false
                                        }
                                        title={menuItems.title}
                                        icon={menuItems.icon}
                                        onClick={() => {
                                          setDataForEvent({
                                            data: item,
                                            action: menuItems.action,
                                          });
                                          setGetValue(item);
                                        }}
                                      />
                                    );
                                  },
                                )}
                              />
                            </Fragment>
                          );
                        })}
                      </MUIFOLDER.FolderGrid>

                      <Box
                        sx={{
                          mt: 4,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {totalPages > folder?.folders?.data?.length && (
                          <Box
                            sx={{
                              display: "flex",
                              position: "relative",
                            }}
                          >
                            <Button
                              endIcon={<ExpandMoreIcon />}
                              sx={{ mt: 2 }}
                              disabled={loading === true}
                              size="small"
                              variant="outlined"
                              onClick={handleViewMoreFolder}
                            >
                              Load more
                            </Button>
                            {loading && (
                              <CircularProgress
                                size={24}
                                sx={{
                                  color: green[500],
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  marginTop: "-12px",
                                  marginLeft: "-12px",
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Fragment>
                  )}
                </MUI.DivFolders>
              </Box>
              <MUI.DivRecentFile>
                <>
                  <MUI.DivRecentFileHeader>
                    <Typography
                      variant="h4"
                      sx={{
                        display: mainFile?.length > 0 ? "" : "none",
                      }}
                    >
                      Files
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        display: mainFile?.length > 0 ? "" : "none",
                        fontSize: "1rem",
                        color: "initial !important",
                        fontWeight: "normal !important",
                      }}
                    >
                      {total} Items
                    </Typography>
                  </MUI.DivRecentFileHeader>
                  {toggle === "list" ? (
                    <Box>
                      {mainFile?.length > 0 && (
                        <CloudFileDataGrid
                          pagination={{
                            total: Math.ceil(total / rowFilePage),
                            currentPage: currentFilePage,
                            setCurrentPage: setCurrentFilePage,
                          }}
                          data={mainFile}
                          total={total}
                          handleEvent={(action, data) => {
                            setDataForEvent({
                              data,
                              action,
                            });
                            setGetValue(data);
                          }}
                          handleSelection={handleMultipleFileData}
                          dataSelector={dataSelector}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ mt: 4 }}>
                      {mainFile?.length > 0 && (
                        <FileCardContainer>
                          {mainFile?.map((item, index) => {
                            return (
                              <Fragment key={index}>
                                <FileCardItem
                                  imagePath={
                                    user?.newName +
                                    "-" +
                                    user?._id +
                                    (item?.path
                                      ? removeFileNameOutOfPath(item?.path)
                                      : "") +
                                    "/" +
                                    item?.newFilename
                                  }
                                  user={user}
                                  selectType={"file"}
                                  path={item?.path}
                                  isCheckbox={true}
                                  filePassword={item?.filePassword}
                                  id={item?._id}
                                  favouriteIcon={{
                                    isShow: false,
                                    handleFavouriteOnClick: async () =>
                                      await handleFavourite(item),
                                    isFavourite:
                                      item?.favorite === 1 ? true : false,
                                  }}
                                  fileType={getFolderName(item?.fileType)}
                                  handleSelect={handleMultipleFileData}
                                  name={item?.filename}
                                  newName={item?.newFilename}
                                  cardProps={{
                                    onDoubleClick: () => {
                                      setGetValue(item);
                                      setDataForEvent({
                                        data: item,
                                        action: "preview",
                                      });
                                    },
                                  }}
                                  menuItems={menuItems.map(
                                    (menuItem, index) => {
                                      return (
                                        <MenuDropdownItem
                                          key={index}
                                          isFavorite={
                                            item.favorite ? true : false
                                          }
                                          isPassword={
                                            item.filePassword ||
                                            item.access_password
                                              ? true
                                              : false
                                          }
                                          title={menuItem.title}
                                          icon={menuItem.icon}
                                          onClick={() => {
                                            setDataForEvent({
                                              data: item,
                                              action: menuItem.action,
                                            });
                                            setGetValue(item);
                                          }}
                                        />
                                      );
                                    },
                                  )}
                                />
                              </Fragment>
                            );
                          })}
                        </FileCardContainer>
                      )}
                      {fileLoading && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                            position: "absolute",
                            bottom: "-50px",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <LinearProgress />
                        </Box>
                      )}
                    </Box>
                  )}
                  {!detectResizeWindow.canBeScrolled &&
                    // fileViewMore < total &&
                    limitScroll < total &&
                    toggle === "grid" && (
                      <Box
                        sx={{
                          my: 3,
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
                            onClick={handleViewMoreFile}
                          >
                            Load more
                          </Button>
                        </Box>
                      </Box>
                    )}
                </>
              </MUI.DivRecentFile>
              {showPreview && (
                <DialogPreviewFile
                  open={openPreview}
                  handleClose={handleClosePreview}
                  onClick={() => {
                    if (
                      userPackage?.downLoadOption === "another" ||
                      userPackage?.category === "free"
                    ) {
                      handleGetDownloadLink();
                    } else {
                      handleDownloadFile(dataForEvent.data);
                    }
                  }}
                  filename={name}
                  newFilename={newName}
                  fileType={fileType}
                  path={path}
                  user={user}
                />
              )}

              {/* create share popup */}
              {openShare && (
                <DialogCreateShare
                  onDeletedUserFromShareSave={handleDeletedUserFromShareOnSave}
                  onChangedUserPermissionFromShareSave={
                    handleChangedUserPermissionFromShareSave
                  }
                  sharedUserList={manageUserFromShare.sharedUserList}
                  onClose={handleShareClose}
                  open={openShare}
                  data={{
                    ...(getValue || multiSelectId[0]),
                    ownerId: {
                      _id: dataForEvent.data?.createdBy?._id,
                      email: dataForEvent.data?.createdBy?.email,
                      firstName: dataForEvent.data?.createdBy?.firstName,
                      lastName: dataForEvent.data?.createdBy?.lastName,
                    },
                  }}
                />
              )}

              <DialogCreateMultipleShare
                onClose={() => {
                  resetDataForEvent();
                  handleClearMultipleFileAndFolder();
                  setShareMultipleDialog(false);
                }}
                open={shareMultipleDialog}
                data={dataForEvent.data}
                refetch={fileLoading}
                dataSelector={dataSelector?.selectionFileAndFolderData}
              />

              {fileDetailsDialog && (
                <DialogFileDetail
                  iconTitle={<BiTime />}
                  title="My Cloud"
                  path={breadcrumbData}
                  name={getValue?.filename}
                  breadcrumb={{
                    handleFolderNavigate:
                      handleFileDetailDialogBreadcrumbFolderNavigate,
                  }}
                  type={
                    getValue?.fileType &&
                    getShortFileTypeFromFileType(getValue?.fileType)
                  }
                  displayType={
                    getValue?.fileType ||
                    getFileType(getValue?.filename) ||
                    "folder"
                  }
                  size={
                    getValue?.size ? convertBytetoMBandGB(getValue?.size) : 0
                  }
                  dateAdded={moment(getValue?.createdAt).format(
                    "YYYY-MM-DD h:mm:ss",
                  )}
                  lastModified={moment(getValue?.updatedAt).format(
                    "YYYY-MM-DD h:mm:ss",
                  )}
                  totalDownload={getValue?.totalDownload}
                  // totalDownload={dataForEvent.data?.totalDownload}
                  isOpen={fileDetailsDialog}
                  onClose={() => {
                    setFileDetailsDialog(false);
                    resetDataForEvent();
                  }}
                  imagePath={
                    user?.newName +
                    "-" +
                    user?._id +
                    "/" +
                    (getValue?.newPath
                      ? removeFileNameOutOfPath(getValue?.newPath)
                      : "") +
                    getValue?.newFilename
                  }
                  user={user}
                  {...{
                    favouriteIcon: {
                      isShow: true,
                      handleFavouriteOnClick: async () =>
                        await handleFavourite(getValue),
                      isFavourite: getValue?.favorite ? true : false,
                    },
                    downloadIcon: {
                      isShow: true,
                      handleDownloadOnClick: () => {
                        if (
                          userPackage?.downLoadOption === "another" ||
                          userPackage?.category === "free"
                        ) {
                          handleGetDownloadLink();
                        } else {
                          handleDownloadFile(dataForEvent.data);
                        }
                      },
                    },
                  }}
                />
              )}

              <DialogRenameFile
                open={renameDialogOpen}
                onClose={handleCloseRenameDialog}
                onSave={handleRenameFolderOrFile}
                title={
                  getValue?.folder_type === "folder"
                    ? "Rename folder"
                    : "Rename file"
                }
                label={
                  getValue?.folder_type === "folder"
                    ? "Rename folder"
                    : "Rename file"
                }
                isFolder={getValue?.folder_type === "folder" ? true : false}
                defaultValue={
                  getValue?.folder_type === "folder"
                    ? getValue?.folder_name
                    : getValue?.filename
                }
                name={name}
                setName={setName}
              />
            </Box>
          )}

          {folder?.folders?.data?.length === 0 &&
            mainFile !== null &&
            mainFile?.length === 0 && (
              <Box style={{ height: "100%" }}>
                <Empty
                  icon={<MyCloundEmpty />}
                  title="A place for all of your files"
                  context="You can drag or folders right into VShare"
                />
              </Box>
            )}

          {showProgressing && (
            <ProgressingBar procesing={procesing} progressing={progressing} />
          )}
        </MUI.DivCloud>
      </Box>

      <DialogCreateFileDrop
        isOpen={openFileDrop}
        onClose={handleCloseFileDropDialog}
        handleChange={handleCreateFileDrop}
        folderId={currentFolderId}
      />

      <DialogCreateMultipleFilePassword
        isOpen={isMultiplePasswordLink}
        onClose={handleCloseMultiplePassword}
        onConfirm={() => {
          queryFolder();
          if (toggle === "list") {
            queryFile();
          } else {
            queryFileGrid();
          }
        }}
      />

      <DialogCreateFilePassword
        isOpen={isPasswordLink}
        dataValue={dataForEvent.data}
        filePassword={
          dataForEvent.data?.filePassword || dataForEvent.data?.access_password
        }
        isUpdate={
          dataForEvent.data?.filePassword || dataForEvent.data?.access_password
            ? true
            : false
        }
        filename={dataForEvent.data?.filename || dataForEvent.data?.folder_name}
        checkType={dataForEvent.data?.folder_type ? "folder" : "file"}
        onConfirm={() => {
          queryFolder();
          if (toggle === "list") {
            queryFile();
          } else {
            queryFileGrid();
          }
        }}
        onClose={handleClosePassword}
      />

      <CSVLink
        ref={csvRef}
        data={useDataExportCSV.data}
        filename={csvFolder.folderName}
        target="_blank"
      />

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={dataForEvent.data?.filename || dataForEvent.data?.folder_name}
        newFilename={dataForEvent.data?.newFilename}
        filePassword={
          dataForEvent.data?.folder_type === "folder"
            ? dataForEvent.data?.access_password
            : dataForEvent.data?.filePassword
        }
        onConfirm={handleSubmitDecryptedPassword}
        onClose={handleCloseDecryptedPassword}
      />
    </Fragment>
  );
}
