import { withTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Menu as MenuIcon } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  ClickAwayListener,
  Grid,
  AppBar as MuiAppBar,
  IconButton as MuiIconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { Fragment, useContext, useRef, useState } from "react";
import { CSVLink } from "react-csv";

import { useLazyQuery, useMutation } from "@apollo/client";
import { ThemeProvider, useTheme } from "@mui/material";
import {
  MUTATION_ACTION_FILE,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import { MUTATION_CREATE_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import {
  MUTATION_UPDATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import { QUERY_SEARCH_FOLDER_AND_FILE } from "api/graphql/search.graphql";
import InputSearch from "components/InputSearch";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import NormalButton from "components/NormalButton";
import DialogAlert from "components/dialog/DialogAlert";
import DialogCreateFileDrop from "components/dialog/DialogCreateFileDrop";
import DialogCreateFilePassword from "components/dialog/DialogCreateFilePassword";
import DialogCreateShare from "components/dialog/DialogCreateShare";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFile from "components/dialog/DialogPreviewFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import FileCardItemIcon from "components/file/FileCardItemIcon";
import ProgressingBar from "components/loading/ProgressingBar";
import menuItems, { favouriteMenuItems } from "constants/menuItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useManageFolder from "hooks/folder/useManageFolder";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlExtendFolder from "hooks/url/useGetUrlExtendFolder";
import useAuth from "hooks/useAuth";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useExportCSV from "hooks/useExportCSV";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { Base64 } from "js-base64";
import _ from "lodash";
import moment from "moment/moment";
import { BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  cutFileType,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import NavbarUserDropdown from "./NavbarUserDropdown";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      width642: 642,
      width599: 599,
    },
  },
});

const AppSearch = styled("div")({
  borderRadius: "2px",
  padding: "5px 0px",
  position: "relative",
  background: "#FFF",
  width: "100%",

  [theme.breakpoints.down(400)]: {
    width: "80%",
  },
});
const SearchBar = styled("div")({
  borderRadius: "2px",
  border: "1px solid #ececec",
  position: "absolute",
  left: 0,
  right: 0,
  top: "90%",
  background: "#fff",
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "block",
  },
  [theme.breakpoints.between(599, 642)]: {
    display: "none",
  },
});
const SearchBarLayout = styled("div")({
  marginTop: 2.5,
  border: "1px solid #ececec",
  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
  background: "#fff",
  padding: "1rem",
  whiteSpace: "nowrap",
  overflow: "auto",
  maxHeight: "80dvh",
});

const AppBar = styled(MuiAppBar)`
  background: ${(props: any) => props.theme.header.background};
  color: ${(props: any) => props.theme.header.color};
  border-bottom: 1px solid #ececec;
`;

const IconButton = styled(MuiIconButton)`
  svg {
    width: 22px;
    height: 22px;
  }
`;

const Navbar = ({ onDrawerToggle }) => {
  const { user }: any = useAuth();
  const themeSecond = useTheme();
  const navigate = useNavigate();
  const [searchFolderAndFile] = useLazyQuery(QUERY_SEARCH_FOLDER_AND_FILE, {
    fetchPolicy: "no-cache",
  });
  const manageGraphqlError = useManageGraphqlError();
  const [showProgressing, setShowProgressing] = useState(false);
  const [procesing, setProcesing] = useState(true);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [inputSearch, setInputSearch] = useState(null);
  const [inputHover, setInputHover] = useState(false);
  const [dataOfSearch, setDataOfSearch] = useState<any[]>([]);
  const { setFolderId }: any = useContext(FolderContext);
  const [activeData, setActiveData] = useState<any>({});
  const [fileDetailsDialog, setFileDetailsDialog] = useState(false);
  const breadcrumbData = useBreadcrumbData(
    activeData.path || (activeData.path, activeData.name),
    "",
  );

  const manageFolder = useManageFolder({ user });
  const manageFile = useManageFile({ user });

  const { setIsAutoClose } = useMenuDropdownState();

  const [getFolders] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );

  const handleGetURL = useGetUrl({});
  const handleGetFolderURL = useGetUrlExtendFolder({});
  const [shareDialog, setShareDialog] = useState(false);

  const [openFileDrop, setOpenFileDrop] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEncryptPassword, setShowEncryptPassword] = useState(false);
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");

  // using export csv
  const [csvFolder, setCsvFolder] = useState({
    folderId: "",
    folderName: " ",
  });
  const csvRef = useRef<any>();
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

  const [isPasswordLink, setIsPasswordLink] = useState(false);

  const handleEvent = (paramEventName, data) => {
    const currentEventName = paramEventName || eventName;
    const currentActiveData = data || activeData;
    setShowEncryptPassword(false);

    switch (currentEventName) {
      case "detail":
        handleOpenFile();
        break;
      case "share":
        handleShare();
        break;
      case "get link":
        if (currentActiveData.checkTypeItem === "folder") {
          handleGetFolderURL?.({
            ...currentActiveData,
            type: currentActiveData.checkTypeItem,
          });
        } else {
          handleGetURL?.({
            ...currentActiveData,
            type: currentActiveData.checkTypeItem,
          });
        }
        break;
      case "password":
        handleSetPassword();
        break;
      case "rename":
        handleRenameDialog(currentActiveData);
        break;
      case "favourite":
        handleAddFavourite(currentActiveData);
        break;
      case "pin":
        handleAddPin(currentActiveData);
        break;
      case "download":
        if (currentActiveData.checkTypeItem === "folder") {
          handleDownloadFolders(currentActiveData);
        } else {
          handleDownloadFile(currentActiveData);
        }
        break;
      case "export-csv":
        handleExportCsv(currentActiveData);
        break;
      case "preview":
        handlePreviewFile();
        break;
      case "double click":
        handleOpenFolder(currentActiveData);
        break;
      case "filedrop":
        handleFileDrop();
        break;
      case "delete":
        handleDeleteFilesAndFolders(currentActiveData);
        break;
    }
  };

  /* handle download folders */
  const handleDownloadFolders = async (value) => {
    const currentActiveData = value || activeData;
    setShowProgressing(true);

    const multipleData = [
      {
        id: currentActiveData._id,
        checkType: "folder",
        newFilename: currentActiveData?.newName || "",
        createdBy: currentActiveData?.createdBy,
        newPath: currentActiveData?.newPath || "",
      },
    ];

    manageFile.handleMultipleDownloadFileAndFolder(
      {
        multipleData,
        isShare: false,
      },
      {
        onSuccess: () => {
          successMessage("Download successful", 3000);
          setShowProgressing(false);
        },
        onFailed: (error: any) => {
          errorMessage(error, 2000);
        },
      },
    );
  };

  const handleExportCsv = async (val) => {
    setCsvFolder({
      folderId: val?._id,
      folderName: replacetDotWithDash(val?.name),
    });
  };

  const handleFileDrop = async () => {
    setOpenFileDrop(true);
  };

  const handleCheckPasswordBeforeEvent = (eventName, data) => {
    setIsAutoClose(true);
    setActiveData(data);
    setEventName(eventName);
    if (data?.password || data?.access_passwordFolder) {
      if (eventName === "password") {
        setIsPasswordLink(true);
      } else {
        setShowEncryptPassword(true);
      }
    } else {
      handleEvent(eventName, data);
    }
  };

  const handleActionFile = async (val) => {
    try {
      await fileAction({
        variables: {
          fileInput: {
            createdBy: parseInt(user?._id),
            fileId: parseInt(activeData._id),
            actionStatus: val,
          },
        },
      });
    } catch (error: any) {
      errorMessage(error, 2000);
    }
  };

  const handleSearchFolderAndFile = async (value) => {
    await searchFolderAndFile({
      variables: {
        where: {
          name: value,
          createdBy: user?._id,
        },
      },
      onCompleted: (data) => {
        setDataOfSearch(data.searchFolderAndFile?.data);
      },
    });
  };

  const handleOnSearchChange = async (value) => {
    if (value) {
      await handleSearchFolderAndFile(value);
    } else {
      setDataOfSearch([]);
    }
    setInputSearch(value);
  };

  const handleOnSearchEnter = () => {
    if (dataOfSearch.length > 0) {
      navigate(`/search/${inputSearch}`);
    }
  };

  const handleOnClickAwaySearch = () => {
    setInputHover(false);
  };

  const handleOpenFolder = (value) => {
    setFolderId(value?._id);
    setInputHover(false);
    const url = value?.url;
    const base64URL = Base64.encodeURI(url);
    navigate(`/folder/${base64URL}`);
  };

  const handleOpenFile = () => {
    setInputHover(false);
    setFileDetailsDialog(true);
  };

  const handlePreviewFile = () => {
    setInputHover(false);
    setShowPreview(true);
  };

  const handleShare = () => {
    setShareDialog(true);
  };

  const handleRenameDialog = (value) => {
    setName(value.name);
    setRenameDialogOpen(true);
  };

  const handleSetPassword = () => {
    setIsPasswordLink(true);
  };

  const handleRename = async () => {
    if (activeData.checkTypeItem === "folder") {
      await manageFolder.handleRenameFolder(
        {
          id: activeData._id,
          inputNewFolderName: name,
        },
        {
          onSuccess: async () => {
            await handleSearchFolderAndFile(inputSearch);
            successMessage("Update Folder successful", 2000);
            eventUploadTrigger.trigger();
          },
          onFailed: async (error) => {
            const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
            errorMessage(
              manageGraphqlError.handleErrorMessage(cutErr) as string,
              3000,
            );
          },
          onClosure: async () => {
            setRenameDialogOpen(false);
            setActiveData({});
          },
        },
      );
    } else {
      await manageFile.handleRenameFile({ id: activeData._id }, name, {
        onSuccess: async () => {
          await handleSearchFolderAndFile(inputSearch);
          successMessage("Update File successful", 2000);
          eventUploadTrigger.trigger();
          await handleActionFile("edit");
        },
        onFailed: async (error) => {
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            manageGraphqlError.handleErrorMessage(cutErr) as string,
            3000,
          );
        },
        onClosure: async () => {
          setRenameDialogOpen(false);
          setActiveData({});
        },
      });
    }
  };

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

  const handleAddFavourite = async (value?: any) => {
    const currentActiveData = value || activeData;
    try {
      await updateFile({
        variables: {
          where: {
            _id: currentActiveData._id,
          },
          data: {
            favorite: currentActiveData.favorite ? 0 : 1,
            updatedBy: user?._id,
          },
        },
        onCompleted: async () => {
          if (currentActiveData.favorite) {
            successMessage("One File removed from Favourite", 2000);
          } else {
            successMessage("One File added to Favourite", 2000);
          }
          await handleActionFile("edit");
          setActiveData((prevState) => ({
            ...prevState,
            favorite: currentActiveData.favorite ? 0 : 1,
          }));
          await handleSearchFolderAndFile(inputSearch);
          eventUploadTrigger.trigger();
        },
      });
    } catch (error) {
      console.error(error);
      errorMessage(
        "Sorry!!. Something went wrong. Please try again later!!",
        2000,
      );
    }
  };

  const handleAddPin = async (value) => {
    const currentActiveData = value || activeData;
    try {
      await updateFolder({
        variables: {
          where: {
            _id: currentActiveData._id,
          },
          data: {
            pin: currentActiveData.pin ? 0 : 1,
            updatedBy: user?._id,
          },
        },
        onCompleted: async () => {
          setRenameDialogOpen(false);
          if (currentActiveData.pin) {
            successMessage("One File removed from Pin", 2000);
          } else {
            successMessage("One File added to Pin", 2000);
          }
          setActiveData((prevState) => ({
            ...prevState,
            pin: currentActiveData.pin ? 0 : 1,
          }));
          await handleSearchFolderAndFile(inputSearch);
          eventUploadTrigger.trigger();
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

  const handleDownloadFile = async (value?: any) => {
    const currentActiveData = value || activeData;
    setShowProgressing(true);
    setProcesing(true);

    const multipleData = [
      {
        id: currentActiveData._id,
        checkFile: "file",
        newPath: currentActiveData?.newPath || "",
        newFilename: currentActiveData?.newName || "",
        createdBy: {
          _id: currentActiveData?.createdBy?._id,
          newName: currentActiveData?.createdBy?.newName,
        },
      },
    ];

    manageFile.handleMultipleDownloadFile(
      {
        multipleData,
      },
      {
        onSuccess: () => {
          setShowProgressing(false);
          setProcesing(false);

          // setActiveData((prev) => ({
          //   ...prev,
          //   totalDownloadFile: activeData.totalDownloadFile + 1,
          // }));
          eventUploadTrigger.trigger();
        },
        onFailed: (error: any) => {
          setShowProgressing(false);
          setProcesing(false);
          errorMessage(error, 2000);
        },
      },
    );
  };

  const handleDeleteFilesAndFolders = async (value) => {
    const currentActiveData = value || activeData;
    try {
      if (currentActiveData.checkTypeItem === "folder") {
        await updateFolder({
          variables: {
            where: {
              _id: currentActiveData._id,
            },
            data: {
              status: "deleted",
              createdBy: user?._id,
            },
          },
          onCompleted: async () => {
            setDeleteDialogOpen(false);
            successMessage("Delete folder successful!!", 2000);
            await handleSearchFolderAndFile(inputSearch);
            eventUploadTrigger.trigger();
          },
        });
      } else {
        await updateFile({
          variables: {
            where: {
              _id: currentActiveData._id,
            },
            data: {
              status: "deleted",
              createdBy: user?._id,
            },
          },
          onCompleted: async () => {
            setDeleteDialogOpen(false);
            successMessage("Delete file successful!!", 2000);
            await handleSearchFolderAndFile(inputSearch);
            eventUploadTrigger.trigger();
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

  const handleCreateFileDrop = async (link, date) => {
    try {
      const fileDropLink = await createFileDropLink({
        variables: {
          input: {
            url: link,
            expiredAt: date,
            folderId: activeData?._id,
          },
        },
      });
      if (fileDropLink?.data?.createDrop?._id) {
        successMessage("Create file-drop link success!", 2000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  return (
    <Fragment>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Grid container alignItems="center" sx={{ display: "flex" }}>
            <Grid item sx={{ display: { xs: "block", md: "none" } }}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={onDrawerToggle}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <ThemeProvider theme={theme}>
              <Grid
                item
                sx={{
                  width: { lg: "50%", md: "50%" },
                }}
              >
                <ClickAwayListener onClickAway={handleOnClickAwaySearch}>
                  <AppSearch>
                    <InputSearch
                      data={{
                        inputSearch: inputSearch,
                        setInputHover: setInputHover,
                        onChange: handleOnSearchChange,
                        onEnter: handleOnSearchEnter,
                      }}
                    />
                    {inputHover && (
                      <SearchBar>
                        {dataOfSearch?.length > 0 && (
                          <SearchBarLayout>
                            <Typography
                              component="div"
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                rowGap: 1,
                              }}
                            >
                              {dataOfSearch?.map((data, index) => {
                                /* cant get size from API */
                                const isContainsFiles =
                                  data.checkTypeItem === "folder" && data?.size
                                    ? Number(data.size) > 0
                                      ? true
                                      : false
                                    : false;
                                return (
                                  <Fragment key={index}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        flexShrink: 0,
                                        columnGap: 1,
                                        height: "50px",
                                      }}
                                    >
                                      <NormalButton
                                        {...(data.checkTypeItem ===
                                          "folder" && {
                                          onDoubleClick: () =>
                                            handleCheckPasswordBeforeEvent(
                                              "double click",
                                              data,
                                            ),
                                        })}
                                        {...(data.checkTypeItem === "file" && {
                                          onDoubleClick: () =>
                                            handleCheckPasswordBeforeEvent(
                                              "preview",
                                              data,
                                            ),
                                        })}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          borderRadius: 0,
                                          width: "100%",
                                          columnGap: 1,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <Typography
                                          component="div"
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "50px",
                                            minWidth: "50px",
                                            height: "100%",
                                          }}
                                        >
                                          <FileCardItemIcon
                                            isContainFiles={isContainsFiles}
                                            name={data.name}
                                            password={
                                              data?.password ||
                                              data?.access_passwordFolder
                                            }
                                            fileType={getShortFileTypeFromFileType(
                                              data.type,
                                            )}
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
                                          />
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "100%",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              overflow: "hidden",
                                              width: "100%",
                                              textAlign: "left",
                                            }}
                                          >
                                            <Typography
                                              component="div"
                                              sx={{
                                                overflow: "hidden",
                                                width: "100%",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                textAlign: "left",
                                              }}
                                            >
                                              {data.name}
                                            </Typography>
                                            <Typography
                                              component="div"
                                              sx={{
                                                fontSize: "0.8rem",
                                                color:
                                                  themeSecond.palette
                                                    .primaryTheme!.main,
                                              }}
                                            >
                                              {moment(data?.updatedAt).format(
                                                "DD-MM-YYYY",
                                              )}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </NormalButton>
                                      <Box>
                                        <MenuDropdown
                                          customButton={{
                                            element: (
                                              <NormalButton>
                                                <MoreVertIcon
                                                  style={{
                                                    color:
                                                      themeSecond.palette
                                                        .primaryTheme!.main,
                                                  }}
                                                />
                                              </NormalButton>
                                            ),
                                          }}
                                        >
                                          {data.checkTypeItem === "file" && (
                                            <div>
                                              {menuItems.map(
                                                (menuItem, index) => {
                                                  return (
                                                    <MenuDropdownItem
                                                      key={index}
                                                      isFavorite={
                                                        data.favorite
                                                          ? true
                                                          : false
                                                      }
                                                      isPassword={
                                                        data?.password ||
                                                        data?.access_passwordFolder
                                                      }
                                                      title={menuItem.title}
                                                      icon={menuItem.icon}
                                                      onClick={() => {
                                                        handleCheckPasswordBeforeEvent(
                                                          menuItem.action,
                                                          data,
                                                        );
                                                      }}
                                                    />
                                                  );
                                                },
                                              )}
                                            </div>
                                          )}
                                          {data.checkTypeItem === "folder" && (
                                            <div>
                                              {favouriteMenuItems?.map(
                                                (menuItems, index) => {
                                                  return (
                                                    <MenuDropdownItem
                                                      key={index}
                                                      /* disabled={
                                                        item.file_id[0]?._id ||
                                                        item.parentkey[0]?._id
                                                          ? false
                                                          : menuItems.disabled
                                                      } */
                                                      className="menu-item"
                                                      isPinned={
                                                        data.pin ? true : false
                                                      }
                                                      isPassword={
                                                        data?.password ||
                                                        data?.access_passwordFolder
                                                      }
                                                      title={menuItems.title}
                                                      icon={menuItems.icon}
                                                      onClick={() => {
                                                        handleCheckPasswordBeforeEvent(
                                                          menuItems.action,
                                                          data,
                                                        );
                                                      }}
                                                    />
                                                  );
                                                },
                                              )}
                                            </div>
                                          )}
                                        </MenuDropdown>
                                      </Box>
                                    </Box>
                                  </Fragment>
                                );
                              })}
                            </Typography>
                          </SearchBarLayout>
                        )}
                      </SearchBar>
                    )}
                  </AppSearch>
                </ClickAwayListener>
              </Grid>
            </ThemeProvider>
            <Grid item xs />
            <Grid
              item
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* <NavbarNotificationsDropdown />
              <NavbarLanguagesDropdown /> */}
              <NavbarUserDropdown />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      {!_.isEmpty(activeData) && (
        <DialogFileDetail
          iconTitle={<BiSearch />}
          title="Search"
          path={breadcrumbData}
          name={activeData.name}
          breadcrumb={{
            handleFolderNavigate:
              handleFileDetailDialogBreadcrumbFolderNavigate,
          }}
          type={
            activeData.type
              ? getShortFileTypeFromFileType(activeData.type)
              : cutFileType(activeData.name)
          }
          displayType={activeData.type || getFileType(activeData.name)}
          size={activeData.size ? convertBytetoMBandGB(activeData.size) : 0}
          dateAdded={moment(activeData.createdAt).format("D MMM YYYY, h:mm A")}
          lastModified={moment(activeData.updatedAt).format(
            "D MMM YYYY, h:mm A",
          )}
          totalDownload={activeData.totalDownloadFile}
          isOpen={fileDetailsDialog}
          handleOnClose={() => {
            setActiveData({});
            setFileDetailsDialog(false);
          }}
          onClose={() => {
            setActiveData({});
            setFileDetailsDialog(false);
          }}
          imagePath={
            user?.newName +
            "-" +
            user?._id +
            "/" +
            (activeData.newPath
              ? removeFileNameOutOfPath(activeData?.newPath)
              : "") +
            activeData.newName
          }
          user={user}
          {...{
            favouriteIcon: {
              isShow: true,
              handleFavouriteOnClick: () => handleAddFavourite(),
              isFavourite: activeData.favorite ? true : false,
            },
            downloadIcon: {
              isShow: true,
              handleDownloadOnClick: () => handleDownloadFile(),
            },
          }}
        />
      )}

      {!_.isEmpty(activeData) && showPreview && (
        <DialogPreviewFile
          open={showPreview}
          handleClose={() => {
            setActiveData({});
            setShowPreview(false);
          }}
          onClick={() => {
            handleDownloadFile();
          }}
          filename={activeData.name}
          newFilename={activeData.newName}
          fileType={activeData.type}
          path={activeData.newPath}
          user={user}
          userId={user?._id}
        />
      )}

      {shareDialog && (
        <DialogCreateShare
          onClose={() => {
            setShareDialog(false);
            setActiveData({});
          }}
          open={shareDialog}
          data={{
            ...activeData,
            folder_type: activeData?.checkTypeItem === "folder" || "",
            folder_name: activeData.name,
            filename: activeData.name,
          }}
          ownerId={{
            ...activeData,
            _id: activeData.createdBy?._id,
            newName: activeData.createdBy?.newName,
          }}
        />
      )}
      <DialogCreateFilePassword
        isOpen={isPasswordLink}
        checkType={activeData?.checkTypeItem}
        dataValue={activeData}
        filename={activeData?.name || "Unknown"}
        isUpdate={
          activeData?.password || activeData?.access_passwordFolder
            ? true
            : false
        }
        onConfirm={async () => {
          await handleSearchFolderAndFile(inputSearch);
          eventUploadTrigger.trigger();
        }}
        onClose={() => setIsPasswordLink(false)}
      />
      <DialogRenameFile
        open={renameDialogOpen}
        onClose={() => {
          setActiveData({});
          setRenameDialogOpen(false);
        }}
        onSave={handleRename}
        title={activeData.type === "folder" ? "Rename folder" : "Rename file"}
        label={activeData.type === "folder" ? "Rename folder" : "Rename file"}
        isFolder={activeData.type === "folder" ? true : false}
        defaultValue={activeData?.name}
        name={name}
        setName={setName}
      />
      <DialogAlert
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setActiveData({});
        }}
        onClick={handleDeleteFilesAndFolders}
        title="Delete this item?"
        message={
          "If you click yes " +
          (activeData.name || activeData.name) +
          " will be deleted?"
        }
      />
      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={activeData?.name}
        newFilename={activeData?.newName}
        filePassword={activeData?.password || activeData?.access_passwordFolder}
        onConfirm={handleEvent}
        onClose={() => {
          setShowEncryptPassword(false);
          setActiveData({});
        }}
      />
      <DialogCreateFileDrop
        isOpen={openFileDrop}
        onClose={() => setOpenFileDrop(false)}
        handleChange={handleCreateFileDrop}
      />
      <CSVLink
        ref={csvRef}
        data={useDataExportCSV.data}
        filename={csvFolder.folderName}
        target="_blank"
      />
      {/* {showProgressing && (
        <ProgressingBar procesing={procesing} progressing={progressing} />
      )} */}
    </Fragment>
  );
};

export default withTheme(Navbar);
function replacetDotWithDash(_name: any): string {
  throw new Error("Function not implemented.");
}
