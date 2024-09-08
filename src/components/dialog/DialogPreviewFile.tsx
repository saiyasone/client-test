import musicIcon from "assets/images/music-note-in-a-circle.png";
import * as React from "react";
import ReactAudioPlayer from "react-audio-player";
import { FileIcon, defaultStyles } from "react-file-icon";
import { pdfjs } from "react-pdf";
import ReactPlayer from "react-player";
import * as MUI from "styles/dialog/dialogPreviewFile.style";

// component and functions
// material component
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  IconButton,
  Typography,
  createTheme,
  styled,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { ENV_KEYS } from "constants/env.constant";
import { useState } from "react";
import * as MdIcon from "react-icons/md";
import {
  getFileType,
  getFolderName,
  removeFileNameOutOfPath,
} from "utils/file.util";

const theme = createTheme();

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const DialogContentV1 = styled(DialogContent)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  paddingBottom: "5rem",

  [theme.breakpoints.down("md")]: {
    paddingBottom: "4rem",
  },
  [theme.breakpoints.down("sm")]: {
    paddingBottom: "2.8rem",
  },
});

export default function DialogPreviewFile(props) {
  const {
    open,
    handleClose,
    filename,
    user,
    newFilename,
    fileType,
    path,
    onClick,
  } = props;

  const type = getFolderName(fileType);
  const getType = getFileType(newFilename);
  let real_path;
  if (path === null || path === "") {
    real_path = "";
  } else {
    real_path = removeFileNameOutOfPath(path);
  }

  const descriptionElementRef = React.useRef(null);
  const [showNotFoundImage, setShowNotFoundImage] = useState(false);

  const newUrl = ENV_KEYS.VITE_APP_LOAD_URL + "preview?path=";
  const sourcePath = props?.isPublicPath
    ? "public" + "/" + newFilename
    : user?.newName + "-" + user?._id + "/" + real_path + newFilename;

  const handleImageError = () => {
    setShowNotFoundImage(true);
  };

  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement }: any = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open, newFilename]);

  return (
    <MUI.DivContainer>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="body"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
            padding: "16px 24px 0 24px",
          }}
        >
          <MUI.TextFileName>{filename} </MUI.TextFileName>
          <Typography
            className="title download-link"
            style={{ display: "flex", alignItems: "center" }}
          >
            {props?.permission !== "view" && (
              <IconButton onClick={() => onClick()}>
                <DownloadIcon
                  sx={{
                    cursor: "pointer",
                    color: "#707070",
                    [theme.breakpoints.down("md")]: { fontSize: 18 },
                  }}
                />
              </IconButton>
            )}
            &nbsp;&nbsp;
            <IconButton onClick={handleClose}>
              <ClearIcon
                fontSize="medium"
                sx={{ [theme.breakpoints.down("md")]: { fontSize: 18 } }}
              />
            </IconButton>
          </Typography>
        </Box>

        <DialogContentV1>
          <MUI.DivPreviewBody>
            {type === "image" ? (
              <MUI.ShowImageBox>
                {!showNotFoundImage ? (
                  <MUI.ImagePreview
                    className="image-preview"
                    src={newUrl + sourcePath}
                    onError={handleImageError}
                    alt=""
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <Typography
                    component="div"
                    sx={{
                      textAlign: "center",
                      pt: 5,
                    }}
                  >
                    <MdIcon.MdOutlineImageNotSupported
                      style={{
                        fontSize: "4rem",
                      }}
                    />
                    <Typography
                      component="div"
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                      }}
                    >
                      No image found
                    </Typography>
                  </Typography>
                )}
              </MUI.ShowImageBox>
            ) : (type === "application" && getType === "pptx") ||
              getType === "docx" ||
              getType === "xlsx" ? (
              <iframe
                title={filename}
                src={
                  "https://view.officeapps.live.com/op/embed.aspx?" +
                  "src=" +
                  newUrl +
                  sourcePath
                }
                style={{
                  height: "600px",
                  width: "600px",
                  border: 0,
                }}
              ></iframe>
            ) : type === "audio" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <img src={musicIcon} alt="music icon" />
                <Typography variant="h3" sx={{ margin: "1rem 0" }}>
                  Audio player
                </Typography>
                <ReactAudioPlayer
                  src={newUrl + sourcePath}
                  autoPlay
                  controls
                  preload=""
                  style={{
                    backgroundColor: "#f2f2f2",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
                    width: "100%",
                    maxWidth: "800px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                />
              </div>
            ) : type == "video" ? (
              <React.Fragment>
                <ReactPlayer
                  width={"100%"}
                  url={newUrl + sourcePath}
                  controls={true}
                />
              </React.Fragment>
            ) : type === "application" && getType === "pdf" ? (
              <iframe
                src={newUrl + sourcePath}
                style={{ width: "100%", height: "80vh", border: "none" }}
              ></iframe>
            ) : type === "text" && getType === "txt" ? (
              <iframe
                src={newUrl + sourcePath}
                width="100%"
                height="500px"
              ></iframe>
            ) : (
              <MUI.DivShowIcon>
                <Box style={{ width: "250px" }}>
                  <FileIcon
                    extension={getFileType(props.newFilename)}
                    {...defaultStyles[getFileType(props.newFilename) as string]}
                  />
                </Box>
              </MUI.DivShowIcon>
            )}
          </MUI.DivPreviewBody>
        </DialogContentV1>
      </Dialog>
    </MUI.DivContainer>
  );
}
