import { useLazyQuery } from "@apollo/client";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Dialog,
  InputLabel,
  ListItemText,
  styled,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import lockIcon from "assets/images/lock-icon.png";
import DialogCreateFilePassword from "components/dialog/DialogCreateFilePassword";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFileSlide from "components/dialog/DialogPriewFileSlide";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import FileCardItemIcon from "components/file/FileCardItemIcon";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import NormalButton from "components/NormalButton";
import menuItems from "constants/menuItem.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useRefreshState } from "contexts/RefreshProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useAuth from "hooks/useAuth";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import useFetchSubFolderAndFile from "hooks/useFetchSubFolderAndFIle";
import { Base64 } from "js-base64";
import _ from "lodash";
import moment from "moment";
import React from "react";
import { BiSearch } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { IFileTypes } from "types/filesType";
import { IFolderTypes } from "types/mycloudFileType";
import { IUserTypes } from "types/userType";
import { errorMessage, successMessage } from "utils/alert.util";
import { CheckLockFile } from "utils/checkFileLock";
import { isUserPackage } from "utils/checkPackageUser";
import {
  cutFileType,
  getFileType,
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { RenameFavouriteMessage, ReturnMessage } from "utils/message";
import { convertBytetoMBandGB } from "utils/storage.util";
import { cutStringWithEllipsis } from "utils/string.util";
import SearchExtendFolder from "./SearchExtendFolder";
import ShareExtend from "./ShareExtend";
const HeadSearch = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "1rem 0.8rem",
}));

const ContainerSearch = styled("div")(() => ({
  overflow: "auto",
  margin: "0 0.8rem",
  paddingBottom: "1rem",
}));
const ContainerFolderFiles = styled("div")(() => ({
  margin: "0.8rem 0 0",
}));

interface ISearchProps {
  handleClose?: () => void;
  open?: boolean;
  parentFolder: IFolderTypes;
}
interface AuthContextType {
  user: IUserTypes | null;
}

export default function SearchExtend({
  handleClose,
  open,
  parentFolder,
}: ISearchProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth() as AuthContextType;
  const [search, setSearch] = React.useState<string>("");
  const [isSearch, setIsSearch] = React.useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isPasswordLink, setIsPasswordLink] = React.useState<boolean>(false);
  const [showEncryptPassword, setShowEncryptPassword] = React.useState(false);
  const [openEvent, setOpenEvent] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState<boolean>(false);
  const [fileDetailsDialog, setFileDetailsDialog] =
    React.useState<boolean>(false);
  const [activeData, setActiveData] = React.useState<IFileTypes | null>(null);
  const [eventName, setEventName] = React.useState<string>("");
  const { setRefreshAuto, refreshAuto } = useRefreshState();
  const { setIsAutoClose } = useMenuDropdownState();
  const [dataForSearch, setDataForSearch] = React.useState([]);
  const manageFile = useManageFile({ user });
  const [getFolders] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  const breadcrumbData = useBreadcrumbData(
    activeData ? activeData.path : "",
    activeData ? activeData.filename : "",
  );

  const fetchSubFoldersAndFiles = useFetchSubFolderAndFile({
    id: isSearch ? parentFolder?._id : "",
    toggle: isSearch ? "grid" : "",
    name: isSearch ? search : "",
  });

  const dataOfSearch = [
    ...(fetchSubFoldersAndFiles?.files?.data || []),
    ...(fetchSubFoldersAndFiles?.folders?.data || []),
  ];

  const handleGetFolderURL = useGetUrl(activeData);
  const handleDownloadUrl = useGetUrlDownload(activeData);

  React.useEffect(() => {
    if (eventName === "get link") {
      handleGetFolderURL?.(activeData);
      setTimeout(() => {
        setEventName("");
      }, 200);
    }
    if (eventName === "download") {
      handleDownloadUrl?.(activeData);
      setTimeout(() => {
        setEventName("");
      }, 200);
    }
  }, [eventName]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);
  const handleCloseShare = () => {
    setOpenEvent(false);
  };
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearch(true);
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
  };

  setTimeout(() => {
    setIsSearch(false);
  }, 200);
  React.useEffect(() => {
    if (!search && search == "") {
      setIsSearch(true);
    }
  }, [search]);

  React.useEffect(() => {
    if (isSearch) {
      fetchSubFoldersAndFiles.queryGridDataFileAndFolder();
    }
    if (refreshAuto?.isStatus == "extendfolder") {
      fetchSubFoldersAndFiles.queryGridDataFileAndFolder();
    }
  }, [isSearch, refreshAuto?.isAutoClose]);

  const handleOpenFile = () => {
    setFileDetailsDialog(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };
  const handleEvent = (action: string, data: IFileTypes) => {
    setShowEncryptPassword(false);
    setIsAutoClose(true);
    const newAction = action || eventName;

    switch (newAction) {
      case "detail":
        handleOpenFile();
        break;
      case "password":
        setIsPasswordLink(true);
        break;
      case "share":
      case "rename":
        setOpenEvent(true);
        break;
      case "favourite":
        handleFavorite();
        break;
      case "download":
        if (user?.packageId?.category !== "free") {
          handleDownloadFile();
        }
        break;
      case "delete":
        handleDeleteFile();
        break;
      case "preview":
        setShowPreview(true);
        break;
      default:
        return null;
    }
  };

  const handleDeleteFile = async () => {
    if (activeData) {
      await manageFile.handleDeleteFile(activeData._id, {
        onSuccess: () => {
          successMessage(ReturnMessage.DeleteFile, 1000);

          setRefreshAuto({
            isAutoClose: true,
            isStatus: "extendfolder",
          });
        },
        onFailed: (error: string) => {
          errorMessage(error, 3000);
        },
      });
    }
  };

  const handleCheckPasswordBeforeEvent = (action: string, data: IFileTypes) => {
    const isLocked = CheckLockFile(data.filePassword);
    setActiveData(data);
    setEventName(action);
    if (isLocked) {
      setShowEncryptPassword(true);
    } else {
      handleEvent(action, data);
    }
  };

  const handleFileDetailDialogBreadcrumbFolderNavigate = async (
    link: string,
  ) => {
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

  const handleFavorite = async () => {
    try {
      const newFavoriteStatus = activeData?.favorite ? 0 : 1;
      await manageFile.handleFavoriteFile(activeData?._id, newFavoriteStatus, {
        onSuccess: async () => {
          if (activeData) {
            activeData.favorite = newFavoriteStatus;
          }
          setRefreshAuto({
            isAutoClose: true,
            isStatus: "extendfolder",
          });
          if ((activeData?.favorite || activeData?.fileId?.favorite) !== 1) {
            successMessage(RenameFavouriteMessage.RemoveFavorite, 1000);
          } else {
            successMessage(RenameFavouriteMessage.AddFavorite, 1000);
          }
        },
        onFailed: async () => {
          errorMessage(RenameFavouriteMessage.FavoriteFailed, 1000);
        },
      });
    } catch (error: any) {
      errorMessage(error, 1000);
    }
  };

  const handleDownloadFile = async () => {
    const isUserType = await isUserPackage(user);
    if (isUserType !== "free") {
      const newFileData = [
        {
          id: activeData?._id,
          checkType: "file",
          newPath: activeData?.newPath,
          newFilename: activeData?.newFilename || "",
          createdBy: {
            _id: activeData?.createdBy._id || user?._id,
            newName: activeData?.createdBy?.newName || user?.newName,
          },
        },
      ];

      await manageFile.handleDownloadSingleFile(
        { multipleData: newFileData },
        {
          onSuccess: () => {
            successMessage(ReturnMessage.DownloadFile, 1000);
          },
          onFailed: (error: string) => {
            errorMessage(error, 1000);
          },
          onClosure: () => {},
        },
      );
    } else {
      setEventName("download");
    }
  };

  return (
    <>
      <div>
        {open && (
          <Dialog
            onClose={handleClose}
            open={open}
            fullScreen
            sx={{
              "& .MuiDialog-paper": {
                height: "80vh",
                margin: 0,
                borderBottom: "0",
                position: "absolute",
                left: 0,
                bottom: 0,
                right: 0,
                borderRadius: "10px 10px 0 0",
              },
            }}
          >
            <HeadSearch>
              <Typography component="h6" variant="h6">
                Search files
              </Typography>
              <CloseIcon
                sx={{ color: theme.palette.grey[600] }}
                onClick={handleClose}
              />
            </HeadSearch>
            <Box sx={{ margin: "0 0.8rem" }}>
              <InputLabel>Search</InputLabel>
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "45px",
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 14px",
                      height: "20px",
                    },
                  }}
                  value={search}
                  onChange={handleInputChange}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  sx={{
                    height: "45px",
                    padding: "0 10px",
                    minWidth: "auto",
                    color: "gray",
                    borderColor: "gray",
                  }}
                >
                  <CiSearch size={24} />
                </Button>
              </Box>
            </Box>
            <ContainerSearch>
              <ContainerFolderFiles>
                {dataOfSearch?.length > 0 &&
                  dataOfSearch?.map((fileTerm: any, index: number) => {
                    const isContainsFiles =
                      fileTerm?.folder_type === "folder" &&
                      fileTerm?.isContainsFiles
                        ? Number(fileTerm.size) > 0
                          ? true
                          : false
                        : false;

                    if (
                      fileTerm?.folder_type !== null &&
                      fileTerm?.folder_type !== undefined &&
                      fileTerm?.folder_type
                    ) {
                      return (
                        <div>
                          <SearchExtendFolder data={fileTerm} />
                        </div>
                      );
                    } else {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "start",
                              flexShrink: 0,
                              columnGap: 1,
                              gap: 2,
                            }}
                            onClick={() => {
                              setShowPreview(true), setActiveData(fileTerm);
                            }}
                          >
                            <Box sx={{ width: "60px", height: "60px", mt: 2 }}>
                              {fileTerm.filePassword ? (
                                <img
                                  className="lock-icon-preview"
                                  src={lockIcon}
                                  alt={fileTerm.filename}
                                  style={{ width: "60px", height: "60px" }}
                                />
                              ) : (
                                <FileCardItemIcon
                                  name={fileTerm.filename}
                                  password={fileTerm?.password}
                                  fileType={getShortFileTypeFromFileType(
                                    fileTerm.type,
                                  )}
                                  imagePath={
                                    user?.newName +
                                    "-" +
                                    user?._id +
                                    "/" +
                                    (fileTerm.newPath
                                      ? removeFileNameOutOfPath(
                                          fileTerm.newPath,
                                        )
                                      : "") +
                                    fileTerm.newName
                                  }
                                  user={user}
                                />
                              )}
                            </Box>

                            <Box>
                              <Typography
                                variant="h6"
                                component="p"
                                sx={{
                                  fontSize: "0.8rem",
                                }}
                              >
                                {cutStringWithEllipsis(fileTerm.filename, 25)}
                              </Typography>
                              <ListItemText
                                sx={{ fontSize: "0.5rem" }}
                                primary={moment(fileTerm.createdAt).format(
                                  "MM-DD-YYYY",
                                )}
                              />
                            </Box>
                          </Box>
                          <Box>
                            <MenuDropdown
                              customButton={{
                                shadows: "0px 0px 5px rgba(0, 0, 0, 0.2)",
                                element: (
                                  <NormalButton>
                                    <MoreVertIcon
                                      style={{
                                        color: theme.palette.primaryTheme!.main,
                                      }}
                                    />
                                  </NormalButton>
                                ),
                              }}
                            >
                              {fileTerm?.fileType !== null &&
                                fileTerm?.fileType !== undefined && (
                                  <div>
                                    {menuItems.map((menuItem, index) => {
                                      return (
                                        <MenuDropdownItem
                                          key={index}
                                          isFavorite={
                                            fileTerm.favorite ? true : false
                                          }
                                          isPassword={fileTerm?.password}
                                          title={menuItem.title}
                                          icon={menuItem.icon}
                                          onClick={() => {
                                            handleCheckPasswordBeforeEvent(
                                              menuItem.action,
                                              fileTerm,
                                            );
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                            </MenuDropdown>
                          </Box>
                        </Box>
                      );
                    }
                  })}
              </ContainerFolderFiles>
            </ContainerSearch>
          </Dialog>
        )}
        {!_.isEmpty(activeData) && (
          <DialogFileDetail
            iconTitle={<BiSearch />}
            title="Search"
            path={breadcrumbData}
            name={activeData.filename}
            breadcrumb={{
              handleFolderNavigate:
                handleFileDetailDialogBreadcrumbFolderNavigate,
            }}
            type={
              activeData.type
                ? getShortFileTypeFromFileType(activeData.fileType)
                : cutFileType(activeData.filename)
            }
            displayType={activeData.type || getFileType(activeData.filename)}
            size={
              activeData.size
                ? convertBytetoMBandGB(parseInt(activeData.size))
                : 0
            }
            dateAdded={moment(activeData.createdAt).format(
              "D MMM YYYY, h:mm A",
            )}
            lastModified={moment(activeData.updatedAt).format(
              "D MMM YYYY, h:mm A",
            )}
            totalDownload={activeData.totalDownload}
            isOpen={fileDetailsDialog}
            handleOnClose={() => {
              setFileDetailsDialog(false);
              setEventName("");
            }}
            onClose={() => {
              setEventName("");
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
                handleFavouriteOnClick: () => handleFavorite(),
                isFavourite: activeData.favorite ? true : false,
              },
              downloadIcon: {
                isShow: true,
                handleDownloadOnClick: () => handleDownloadFile(),
              },
            }}
          />
        )}
        <DialogValidateFilePassword
          isOpen={showEncryptPassword}
          filename={activeData?.filename}
          newFilename={activeData?.newName}
          filePassword={activeData?.filePassword}
          onConfirm={handleEvent}
          onClose={() => {
            setShowEncryptPassword(false);
            setActiveData(null);
          }}
        />

        <DialogCreateFilePassword
          isOpen={isPasswordLink}
          checkType="file"
          dataValue={activeData}
          filename={activeData?.filename}
          isUpdate={activeData?.filePassword ? true : false}
          onConfirm={async () => {}}
          onClose={() => setIsPasswordLink(false)}
        />
        <ShareExtend
          open={openEvent}
          handleClose={handleCloseShare}
          data={activeData}
          event={eventName}
        />

        {showPreview && activeData && user && (
          <DialogPreviewFileSlide
            open={showPreview}
            handleClose={handleClosePreview}
            data={activeData}
            user={user}
            mainFile={fetchSubFoldersAndFiles.files.data}
            propsStatus="extendFolder"
          />
        )}
      </div>
    </>
  );
}
