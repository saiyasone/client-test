import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Backdrop,
  Box,
  Button,
  Dialog,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import FileLock from "app/pages/file/FileLock";
import FilePreviewNav from "app/pages/file/FilePreviewNav";
import FileDetails from "components/file/FileDetails";
import { ENV_KEYS } from "constants/env.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useHandlePreNext } from "hooks/file/useHandlePrevNext";
import useManageFile from "hooks/file/useManageFile";
import useGetUrl from "hooks/url/useGetUrl";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useClickOutside from "hooks/useClickOutside";
import React, { useRef } from "react";
import { FileIcon } from "react-file-icon";
import { IFileTypes } from "types/filesType";
import { IUserTypes } from "types/userType";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getFileType,
  getFolderName,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { ReturnMessage } from "utils/message";

import LockedFilePreview from "app/pages/file/LockedFilePreview";
import FileRename from "components/file/FileRename";
import FileSlideButton from "components/file/FileSlideButton";
import { useAllowKey } from "hooks/file/useAllowKey";
import useManageUserFromShare from "hooks/user/useManageUserFromShare";
import SharePrevieFile from "app/pages/file/SharePreviewFile";

const CloseIconButton = styled(Box)(({ theme }) => ({
  padding: "6px",
  display: "flex",
  zIndex: 10,
  alignItems: "center",
  justifyItems: "center",
  borderRadius: "100%",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.grey[800],
  },
}));
const ContainerImage = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  height: "100vh",
  overflow: "auto",
}));
const ContainerZoon = styled(Box)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.grey[900],
  bottom: "16px",
  right: "50%",
  transform: "translateX(50%)",
  display: "flex",
  alignItems: "end",
  justifyContent: "center",
  padding: "5px 20px",
  borderRadius: "20px",
  gap: "10px",
}));

const ContainerDetails = styled(Box)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.grey[100],
  top: "0",
  right: "11%",
  zIndex: theme.zIndex.modal + 1,
  transform: "translateX(50%)",
  minWidth: "350px",
  minHeight: "100%",
  borderRadius: "10px",
  gap: "10px",
  color: theme.palette.grey[700],
  opacity: 1,
  [theme.breakpoints.down("sm")]: {
    top: "30%",
    right: "0",
    left: "0",
    opacity: 1,
    minWidth: "100%",
    float: "right",
    fontSize: "100%",
    transform: "none",
  },
}));

interface FileIconProps {
  color?: string;
}
type DialogProps = {
  open: boolean;
  handleClose: () => void;
  data: IFileTypes;
  user: IUserTypes;
  mainFile: IFileTypes[];
};
export default function DialogPreviewFileSlide(props: DialogProps) {
  const { open, handleClose, data, user, mainFile } = props;
  const theme = useTheme();
  const [zoom, setZoom] = React.useState(0.5);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const detailsRef = useRef<HTMLImageElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const refSlide = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isCurrentImage, setIsCurrentImage] = React.useState<IFileTypes>(data);
  const [type, setType] = React.useState<string>("");
  const [dataForEvent, setDataForEvent] = React.useState<string>("");
  const { isAutoClose, setIsAutoClose } = useMenuDropdownState();
  const [filename, setFilename] = React.useState<string>();

  const handleGetFolderURL = useGetUrl(data);
  const handleDownloadUrl = useGetUrlDownload(data);
  const manageFile = useManageFile({ user });
  const { handleNext, handlePrev } = useHandlePreNext();
  const [refs, setRefs] = React.useState<React.RefObject<HTMLElement>[]>([
    imageRef,
    navRef,
    zoomRef,
    refSlide,
  ]);
  const manageUserFromShare = useManageUserFromShare({
    inputFileOrFolder: data,
    inputType: data.fileType,
    user,
  });

  React.useEffect(() => {
    if (
      open &&
      (dataForEvent === "details" ||
        dataForEvent === "password" ||
        dataForEvent === "rename" ||
        dataForEvent === "share")
    ) {
      setRefs((prevRefs) => [...prevRefs, detailsRef]);
    } else {
      setRefs((prevRefs) => prevRefs.filter((ref) => ref !== detailsRef));
    }
  }, [dataForEvent]);

  useClickOutside({
    refs,
    handleClose,
    enabled: dataForEvent !== "share",
  });
  const fileType = isCurrentImage.fileType;
  const [styles, setStyles] = React.useState<
    Record<string, Partial<FileIconProps>>
  >({});
  const fileStyle = styles[fileType];
  let real_path;

  const pathToUse = isCurrentImage.path ?? data.path;
  if (pathToUse === null || pathToUse === "") {
    real_path = "";
  } else {
    real_path = removeFileNameOutOfPath(pathToUse);
  }

  const newUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}preview?path=`;
  const sourcePath = `${
    user?.newName +
    "-" +
    user?._id +
    "/" +
    real_path +
    (isCurrentImage?.newFilename ?? data.newFilename)
  }`;

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.2));
  };

  React.useEffect(() => {
    if (dataForEvent == "download") {
      handleDownloadUrl?.(data);
      setDataForEvent("");
    }
    if (dataForEvent == "get link") {
      setDataForEvent("");
      handleGetFolderURL?.(data);
    }
  }, [dataForEvent]);
  React.useEffect(() => {
    if (data) {
      setIsCurrentImage(data);
      setType(getFolderName(data.fileType)!);
    }
  }, [data, isAutoClose]);
  React.useEffect(() => {
    if (!open) {
      setZoom(0.5);
      setDataForEvent("");
      setType("");
      setFilename("");
    }
    if (isMobile) {
      setZoom(1);
    }
  }, [!open, isMobile]);

  const handleNextView = () => {
    if (!dataForEvent) {
      const newImage = handleNext({
        currentFile: isCurrentImage ?? data,
        mainFile,
      });
      if (newImage) {
        setIsCurrentImage(newImage ?? isCurrentImage);
        setType(getFolderName(newImage.fileType)!);
      }
    }
  };
  const handlePrevView = () => {
    if (!dataForEvent) {
      const prevImage = handlePrev({
        currentFile: isCurrentImage ?? data,
        mainFile,
      });
      if (prevImage) {
        setIsCurrentImage(prevImage ?? isCurrentImage);
        setType(getFolderName(prevImage.fileType)!);
      }
    }
  };
  useAllowKey({
    handlePrevView,
    handleNextView,
    currentFile: isCurrentImage,
    mainFile,
  });
  const handleFavorite = async () => {
    try {
      const newFavoriteStatus = data.favorite ? 0 : 1;
      await manageFile.handleFavoriteFile(data._id, newFavoriteStatus, {
        onSuccess: async () => {
          data.favorite = newFavoriteStatus;
        },
        onFailed: async () => {},
      });
    } catch (error: any) {
      errorMessage(error, 1000);
    }
  };

  const handleDeleteFile = async () => {
    await manageFile.handleDeleteFile(data._id, {
      onSuccess: () => {
        successMessage(ReturnMessage.DeleteFile, 1000);
        handleClose();
        setIsAutoClose(true);
      },
      onFailed: (error: string) => {
        errorMessage(error, 3000);
      },
    });
  };
  const handleDownloadFile = async () => {
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
          successMessage(ReturnMessage.DownloadFile, 1000);
        },
        onFailed: (error: string) => {
          errorMessage(error, 1000);
        },
        onClosure: () => {},
      },
    );
  };

  const handleEvents = async (event: string): Promise<void> => {
    switch (event) {
      case "favourite":
        handleFavorite();
        break;
      case "password":
        if (user.packageId.lockFile === "on") {
          setDataForEvent(event);
        } else {
          setDataForEvent("");
          errorMessage(`${ReturnMessage.LockedFile}`, 200);
        }
        break;
      case "detail":
        setDataForEvent(event);
        break;
      case "delete":
        handleDeleteFile();
        break;
      case "download":
        if (user.packageId.category === "free") {
          setDataForEvent(event);
        } else {
          handleDownloadFile();
        }
        break;
      case "get link":
        setDataForEvent(event);
        break;
      case "rename":
        setFilename(isCurrentImage.filename);
        break;
      case "share":
        setDataForEvent(event);
        break;
      default:
        return;
    }
  };

  return (
    <div>
      <Dialog open={open}>
        <Backdrop
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={open}
        >
          <Box>
            <Box ref={navRef}>
              <FilePreviewNav
                filename={filename}
                data={data}
                handleEvents={handleEvents}
                handleClose={handleClose}
                setDataForEvent={setDataForEvent}
              />
            </Box>
            <ContainerImage>
              {type && type !== null && isCurrentImage.filePassword ? (
                <Box ref={imageRef}>
                  <LockedFilePreview data={isCurrentImage} />
                </Box>
              ) : type === "image" ? (
                <img
                  ref={imageRef}
                  src={newUrl + sourcePath}
                  alt={isCurrentImage.filename}
                  loading="lazy"
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "transform 0.3s ease",
                    objectFit: "contain",
                    width: "100vw",
                  }}
                />
              ) : type ? (
                <Box ref={imageRef} style={{ width: "250px" }}>
                  <FileIcon
                    extension={getFileType(isCurrentImage.newFilename) || ""}
                    {...fileStyle}
                  />
                </Box>
              ) : null}
            </ContainerImage>
            {dataForEvent !== "detail" && dataForEvent !== "lock" && (
              <Box ref={refSlide}>
                <FileSlideButton
                  handlePrevView={handlePrevView}
                  handleNextView={handleNextView}
                />
              </Box>
            )}
            <ContainerZoon ref={zoomRef}>
              <RemoveIcon
                onClick={handleZoomIn}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: theme.palette.grey[600],
                    borderRadius: "50%",
                    transform: "scale(1.1)",
                    transition: "transform 0.3s ease, color 0.3s ease",
                    opacity: 0.5,
                  },
                }}
              />
              <AddIcon
                onClick={handleZoomOut}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: theme.palette.grey[600],
                    borderRadius: "50%",
                    transform: "scale(1.1)",
                    transition: "transform 0.3s ease, color 0.3s ease",
                    opacity: 0.5,
                  },
                }}
              />
            </ContainerZoon>
          </Box>
          {(dataForEvent == "detail" ||
            dataForEvent == "password" ||
            dataForEvent === "rename" ||
            dataForEvent === "share") && (
            <ContainerDetails ref={detailsRef}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "white",
                  borderBottom: `1px solid ${theme.palette.grey[400]}`,
                  padding: "15px 20px",
                  height: "100%",
                }}
              >
                <Typography component="p" fontSize={14}>
                  {dataForEvent === "password"
                    ? "Password protect this file"
                    : dataForEvent === "detail"
                    ? "Details"
                    : "Share"}
                </Typography>
                <CloseIconButton
                  onClick={() => setDataForEvent("")}
                  sx={{
                    "&:hover": {
                      color: theme.palette.primary.contrastText,
                      transform: "scale(1.1)",
                      cursor: "pointer",
                    },
                  }}
                >
                  <CloseIcon
                    sx={{
                      fontSize: "18px",
                    }}
                  />
                </CloseIconButton>
              </Box>
              {dataForEvent === "password" ? (
                <FileLock data={isCurrentImage} handleClose={handleClose} />
              ) : dataForEvent === "rename" ? (
                <FileRename
                  data={isCurrentImage}
                  filename={filename}
                  setFilename={setFilename}
                  user={user}
                  setDataForEvent={setDataForEvent}
                />
              ) : dataForEvent === "share" ? (
                <SharePrevieFile user={user} data={isCurrentImage} />
              ) : (
                <FileDetails data={isCurrentImage} />
              )}
            </ContainerDetails>
          )}
        </Backdrop>
      </Dialog>
    </div>
  );
}
