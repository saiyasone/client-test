import React, { useRef } from "react";

//mui component and style
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { styled as muiStyled } from "@mui/system";

//function

//icon
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import LockIcon from "assets/images/lock-icon.png";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
import useResizeImage from "hooks/useResizeImage";
import { FileIcon, defaultStyles } from "react-file-icon";
import * as MdIcon from "react-icons/md";
import { getFileType } from "utils/file.util";

const Item = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
}));

const Image = muiStyled("img")({
  width: "100%",
  height: "100%",
  textAlign: "center",
  objectFit: "cover",
});

const LockImage = muiStyled("img")(({ theme }) => ({
  width: "30px",
  height: "30px",
  textAlign: "center",
  objectFit: "cover",

  [theme.breakpoints.down("md")]: {
    width: "20px",
    height: "20px",
  },
}));

const FileCardItemIconContainer = muiStyled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  maxHeight: "100%",
  borderRadius: "4px",
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
}));

const FileCardItemIcon: React.FC<any> = ({
  imagePath,
  user,
  isContainFiles,
  fileType,
  password,
  ...props
}) => {
  const itemRef = useRef(null);

  const resizeImage = useResizeImage({
    imagePath,
    fileType,
    user,
    height: 200,
    isPublic: false,
    width: 200,
  });

  return (
    <Item ref={itemRef} className="card-item">
      {fileType === "image" ? (
        <React.Fragment>
          {password ? (
            <LockImage src={LockIcon} alt={props?.name} />
          ) : (
            <React.Fragment>
              {resizeImage.imageFound === null && (
                <CircularProgress
                  size={15}
                  sx={{
                    color: "#17766B",
                  }}
                />
              )}
              {resizeImage.imageFound === true && (
                <>
                  {resizeImage.imageSrc && (
                    <Image
                      src={resizeImage.imageSrc}
                      alt={props.name}
                      className="file-card-image"
                    />
                  )}
                </>
              )}
              {resizeImage.imageFound === false && (
                <MdIcon.MdOutlineImageNotSupported
                  style={{
                    fontSize: "2rem",
                  }}
                />
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {fileType === "folder" && (
            <Box
              sx={{
                display: "flex",
                height: "100%",
              }}
            >
              {isContainFiles ? (
                <FolderNotEmptyIcon
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <FolderEmptyIcon
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </Box>
          )}
          {fileType !== "folder" && (
            <FileCardItemIconContainer
              sx={{
                svg: {
                  width: "100%",
                  height: "100%",
                },
              }}
            >
              <FileIcon
                extension={getFileType(props.name)}
                {...{ ...defaultStyles[getFileType(props.name) as string] }}
              />
            </FileCardItemIconContainer>
          )}
        </React.Fragment>
      )}
    </Item>
  );
};

export default FileCardItemIcon;
