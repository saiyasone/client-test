import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { FiDownload, FiEye, FiLink, FiLock, FiShare2 } from "react-icons/fi";
import Action from "components/action-table/Action";
import { MdFavorite } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi";
import { IFileTypes } from "types/filesType";
import React, { RefObject } from "react";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { FaLock } from "react-icons/fa";
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

interface PreviewType {
  data: IFileTypes;
  handleEvents: (event: string) => Promise<void>;
  handleClose: () => void;
  setDataForEvent: (value: string) => void;
}
export default function FilePreviewNav({
  data,
  handleEvents,
  handleClose,
  setDataForEvent,
}: PreviewType) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const { setIsAutoClose } = useMenuDropdownState();
  return (
    <>
      <Box>
        <NavBox>
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
              <FiDownload size={16} onClick={() => handleEvents("download")} />
              <Action
                color="#ffffff"
                params={data}
                eventActions={{
                  handleEvent: (action: string) => {
                    setIsAutoClose(true);
                    setDataForEvent("details"), handleEvents(action);
                  },
                }}
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
              {data.filePassword ? (
                <FaLock
                  fill={theme.palette.primary.main}
                  onClick={() => handleEvents("lock")}
                />
              ) : (
                <FiLock size={16} onClick={() => handleEvents("lock")} />
              )}
              <FiEye size={16} onClick={() => handleEvents("details")} />
              <HiOutlineTrash size={16} onClick={() => handleEvents("trash")} />
              <FiDownload size={16} onClick={() => handleEvents("download")} />
              <FiLink size={16} onClick={() => handleEvents("getlink")} />
              <Button
                variant="contained"
                sx={{ fontSize: "14px" }}
                onClick={() => handleEvents("share")}
              >
                <FiShare2 size={16} /> &nbsp; Share
              </Button>
            </Box>
          )}
        </NavBox>
      </Box>
    </>
  );
}
