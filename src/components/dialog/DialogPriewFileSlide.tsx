import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Backdrop,
  Box,
  Dialog,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Button from "@mui/material/Button";
import { styled, useTheme } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDetails from "components/file/FileDetails";
import { ENV_KEYS } from "constants/env.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useClickOutside from "hooks/useClickOutside";
import React, { useRef } from "react";
import { FileIcon } from "react-file-icon";
import { FiDownload, FiEye, FiLink, FiLock, FiShare2 } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { MdFavorite } from "react-icons/md";
import { IFileTypes } from "types/filesType";
import { IUserTypes } from "types/userType";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getFileType,
  getFolderName,
  removeFileNameOutOfPath,
} from "utils/file.util";
import { ReturnMessage } from "utils/message";

type DialogProps = {
  open: boolean;
  handleClose: () => void;
  data: IFileTypes;
  user: IUserTypes;
};

const NavBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.grey[900],
  top: 0,
  left: 0,
  right: 0,
  padding: "10px 30px",
  zIndex: theme.zIndex.modal + 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  opacity: 1,
  [theme.breakpoints.down("sm")]: {
    padding: "10px 5px",
  },
}));
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
  margin: "auto",
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
  backgroundColor: theme.palette.grey[900],
  top: "10%",
  right: "10%",
  transform: "translateX(50%)",
  minWidth: "300px",
  minHeight: "88%",
  borderRadius: "10px",
  gap: "10px",
  opacity: 0.9,
}));

interface FileIconProps {
  color?: string;
}
export default function DialogPreviewFileSlide(props: DialogProps) {
  const { open, handleClose, data, user } = props;
  const theme = useTheme();
  const [zoom, setZoom] = React.useState(0.5);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const detailsRef = useRef<HTMLImageElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [dataForEvent, setDataForEvent] = React.useState<string>("");
  const { setIsAutoClose, isAutoClose } = useMenuDropdownState();
  const refs = [
    imageRef,
    navRef,
    zoomRef,
    ...(dataForEvent === "details" ? [detailsRef] : []),
  ];
  useClickOutside({
    refs,
    handleClose,
  });
  const handleDownloadUrl = useGetUrlDownload(data);

  const manageFile = useManageFile({ user });
  const type = getFolderName(data.fileType);
  const fileType = data.fileType as any;
  const [styles, setStyles] = React.useState<
    Record<string, Partial<FileIconProps>>
  >({});
  const fileStyle = styles[fileType];
  let real_path;

  if (data.path === null || data.path === "") {
    real_path = "";
  } else {
    real_path = removeFileNameOutOfPath(data.path);
  }

  const newUrl = `${ENV_KEYS.VITE_APP_LOAD_URL}preview?path=`;
  const sourcePath = `${
    user?.newName + "-" + user?._id + "/" + real_path + data.newFilename
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
    }
  }, [dataForEvent]);

  React.useEffect(() => {
    if (!open) {
      setZoom(0.5);
      setDataForEvent("");
    }
    if (isMobile) {
      setZoom(1);
    }
  }, [!open, isMobile]);

  const handleFavorite = async () => {
    try {
      const newFavoriteStatus = data.favorite ? 0 : 1;
      await manageFile.handleFavoriteFile(data._id, newFavoriteStatus, {
        onSuccess: async () => {
          data.favorite = newFavoriteStatus;
        },
        onFailed: async () => {},
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleDeleteFile = async () => {
    await manageFile.handleDeleteFile(data._id, {
      onSuccess: () => {
        successMessage("Delete file successful", 1000);
        handleClose();
        setIsAutoClose(true);
      },
      onFailed: (error: string) => {
        errorMessage(error, 3000);
      },
    });
  };
  const handleEvents = async (event: string) => {
    switch (event) {
      case "favorite":
        handleFavorite();
        break;
      case "lock":
        errorMessage(`${ReturnMessage.LockedFile}`, 200);
        break;
      case "details":
        setDataForEvent(event);
        break;
      case "trash":
        handleDeleteFile();
        break;
      case "download":
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
            <NavBox ref={navRef}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  pr: 10,
                }}
              >
                <CloseIconButton>
                  <CloseIcon
                    sx={{
                      fontSize: "18px",
                      cursor: "pointer",
                      "&:hover": {
                        color: theme.palette.primary.contrastText,
                        transform: "scale(1.1)",
                      },
                    }}
                    onClick={handleClose}
                  />
                </CloseIconButton>
                <Typography
                  component="p"
                  fontSize={14}
                  sx={{
                    overflow: "hidden",
                    textOverflow: isMobile ? "ellipsis" : "clip",
                    whiteSpace: isMobile ? "nowrap" : "normal",
                  }}
                >
                  {data.filename}
                </Typography>
              </Box>
              {isMobile ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FiDownload size={16} />
                  <Action
                    color="#ffffff"
                    params={data}
                    eventActions={{}}
                    anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <MdFavorite
                    fill={data.favorite ? "#17766B" : "#ffffff"}
                    size={16}
                    onClick={() => handleEvents("favorite")}
                  />
                  <FiLock size={16} onClick={() => handleEvents("lock")} />
                  <FiEye size={16} onClick={() => handleEvents("details")} />
                  <HiOutlineTrash
                    size={16}
                    onClick={() => handleEvents("trash")}
                  />
                  <FiDownload
                    size={16}
                    onClick={() => handleEvents("download")}
                  />
                  <FiLink size={16} onClick={() => handleEvents("getlink")} />
                  <Button variant="contained" sx={{ fontSize: "14px" }}>
                    <FiShare2 size={16} /> &nbsp; Share
                  </Button>
                </Box>
              )}
            </NavBox>
            <ContainerImage>
              {type &&
                (type === "image" ? (
                  <img
                    ref={imageRef}
                    src={newUrl + sourcePath}
                    alt={data.filename}
                    loading="lazy"
                    style={{
                      transform: `scale(${zoom})`,
                      transition: "transform 0.3s ease",
                      objectFit: "contain",
                      width: "100vw",
                    }}
                  />
                ) : (
                  <Box ref={imageRef} style={{ width: "250px" }}>
                    <FileIcon
                      extension={getFileType(data.newFilename) || ""}
                      {...fileStyle}
                    />
                  </Box>
                ))}
            </ContainerImage>
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
          {dataForEvent == "details" && (
            <ContainerDetails ref={detailsRef}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "white",
                  borderBottom: `2px solid ${theme.palette.grey[800]}`, // Example of adding a visible border
                  padding: "15px 20px",
                }}
              >
                <Typography component="p" fontSize={14}>
                  Details
                </Typography>
                <CloseIconButton>
                  <CloseIcon
                    sx={{
                      fontSize: "18px",
                      cursor: "pointer",
                      "&:hover": {
                        color: theme.palette.primary.contrastText,
                        transform: "scale(1.1)",
                      },
                    }}
                    onClick={() => setDataForEvent("")}
                  />
                </CloseIconButton>
              </Box>
              <FileDetails data={data} />
            </ContainerDetails>
          )}
        </Backdrop>
      </Dialog>
    </div>
  );
}
