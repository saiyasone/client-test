import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, ListItemText, styled, Typography, useTheme } from "@mui/material";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import NormalButton from "components/NormalButton";
import { favouriteMenuItems } from "constants/menuItem.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useRefreshState } from "contexts/RefreshProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlExtendFolderDownload from "hooks/url/useGetUrlExtendFolderDownload";
import useAuth from "hooks/useAuth";
import { Base64 } from "js-base64";
import moment from "moment";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ISearchFolderTypes } from "types/searchExtendTypes";
import { errorMessage, successMessage } from "utils/alert.util";
import { CheckLockFile } from "utils/checkFileLock";
import { isUserPackage } from "utils/checkPackageUser";
import { cutStringWithEllipsis } from "utils/string.util";
import ShareExtend from "./ShareExtend";
import { useDeleteFolder } from "hooks/folder/useDeleteFolder";
import useManageFolder from "hooks/folder/useManageFolder";

const IconFolderContainer = styled("div")({
  minWidth: "60px",
  minHeight: "60px",
  marginTop: "2px",
});

interface IFolderOfSearchProps {
  data?: ISearchFolderTypes;
  open?: boolean;
}
export default function SearchExtendFolder({
  data,
  open,
}: IFolderOfSearchProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeData, setActiveData] = React.useState<ISearchFolderTypes | null>(
    null,
  );
  const [openEvent, setOpenEvent] = React.useState(false);
  const [eventName, setEventName] = React.useState<string>("");
  const [showEncryptPassword, setShowEncryptPassword] = React.useState(false);
  const [isOpenMenu, setIsOpenMenu] = React.useState<boolean>(false);
  const { setRefreshAuto, refreshAuto } = useRefreshState();
  const { setIsAutoClose } = useMenuDropdownState();
  const handleGetFolderURL = useGetUrl(activeData);
  const manageFile = useManageFile({ user });
  const manageFolder = useManageFolder({ user });
  const [deleteId, setDeleteId] = React.useState<any[]>([]);

  const handleDownloadUrl = useGetUrlExtendFolderDownload(activeData);
  const { deleteSubFolderAndFile, loading, error, success } = useDeleteFolder();

  React.useEffect(() => {
    if (!open) {
      setDeleteId([]);
    }
  }, [open]);

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

  const handleCloseShare = () => {
    setOpenEvent(false);
  };

  const handleOpenFolder = (value: ISearchFolderTypes) => {
    const base64URL = Base64.encodeURI(value?.url);
    navigate(`/folder/${base64URL}`);
  };
  const handleEvent = async (action: string, data: ISearchFolderTypes) => {
    setShowEncryptPassword(false);
    setIsAutoClose(true);
    const newAction = action || eventName;

    switch (newAction) {
      case "share":
      case "rename":
      case "filedrop":
        setOpenEvent(true);
        break;
      case "preview":
        handleOpenFolder(data);
        break;
      case "download":
        const isUserType = await isUserPackage(user);
        if (isUserType !== "free") {
          handleDownloadFolder();
        }
        break;
      case "delete":
        handleDelete(data);
        break;
      case "pin":
        handleAddPin(data);
        break;
      default:
        return null;
    }
  };
  const handleCheckPasswordBeforeEvent = (
    action: string,
    data: ISearchFolderTypes,
  ) => {
    const isLocked = CheckLockFile(data?.access_password);
    setActiveData(data);
    setEventName(action);
    if (isLocked) {
      setShowEncryptPassword(true);
    } else {
      handleEvent(action, data);
    }
  };

  const handleAddPin = async (values: ISearchFolderTypes) => {
    await manageFolder.handleAddPinFolder(values?._id, values?.pin ? 0 : 1, {
      onSuccess: async () => {
        if (values.pin) {
          successMessage("One File removed from Pin", 2000);
        } else {
          successMessage("One File added to Pin", 2000);
        }
        values.pin = values.pin ? 0 : 1;
      },
      onFailed: (_: any) => {},
      onClosure: () => {},
    });
  };

  const handleDelete = async (data: ISearchFolderTypes) => {
    try {
      const deleted = await deleteSubFolderAndFile(data, user);
      if (deleted?.data?.updateFolders?._id || success) {
        successMessage("Delete folder success", 1000);
        setRefreshAuto({ isStatus: "extendsearch", isAutoClose: true });
        setDeleteId([...deleteId, deleted?.data?.updateFolders?._id]);
      }
    } catch (error) {
      errorMessage("Delete folder success", 1000);
      console.log(error);
    }
  };
  const handleDownloadFolder = async () => {
    const newFileData = [
      {
        id: activeData?._id,
        checkType: "folder",
        newPath: activeData?.newPath || "",
        newFilename: activeData?.newFolder_name || "",
        createdBy: {
          _id: activeData?.createdBy._id,
          newName: activeData?.createdBy?.newName,
        },
      },
    ];

    await manageFile.handleDownloadSingleFile(
      { multipleData: newFileData },
      {
        onSuccess: () => {
          successMessage("Download successful", 1000);
        },
        onFailed: (error: any) => {
          errorMessage(error, 3000);
        },

        onClosure: () => {},
      },
    );
  };

  const shouldShow = !deleteId.includes(data?._id);

  return (
    <>
      <div>
        {activeData && (
          <ShareExtend
            open={openEvent}
            handleClose={handleCloseShare}
            data={activeData}
            event={eventName}
          />
        )}
        {shouldShow && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
              onClick={() => {
                if (data) {
                  handleOpenFolder(data);
                }
              }}
            >
              <IconFolderContainer>
                {data?.file_id[0]?._id || data?.parentkey[0]?._id ? (
                  <FolderNotEmptyIcon />
                ) : (
                  <FolderEmptyIcon />
                )}
              </IconFolderContainer>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  fontSize: "0.8rem",
                }}
              >
                {cutStringWithEllipsis(data?.folder_name, 25)}
              </Typography>
              <ListItemText
                sx={{ fontSize: "0.5rem" }}
                primary={moment(data?.updatedAt).format("MM-DD-YYYY")}
              />
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
                {favouriteMenuItems?.map((menuItems, index) => {
                  return (
                    <MenuDropdownItem
                      key={index}
                      className="menu-item"
                      disabled={
                        data?.file_id[0]?._id || data?.parentkey[0]?._id
                          ? false
                          : menuItems.disabled
                      }
                      isPinned={data?.pin ? true : false}
                      isPassword={data?.access_password}
                      title={menuItems.title}
                      icon={menuItems.icon}
                      onClick={() => {
                        if (data) {
                          handleCheckPasswordBeforeEvent(
                            menuItems.action,
                            data,
                          );
                        }
                      }}
                    />
                  );
                })}
              </MenuDropdown>
            </Box>
          </Box>
        )}
      </div>
    </>
  );
}
