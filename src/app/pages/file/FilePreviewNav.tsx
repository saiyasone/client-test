import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Action from "components/action-table/Action";
import ActionFileDrop from "components/action-table/ActionFileDrop";
import ActionFileShare from "components/share/ActionFileShare";
import {
  shareWithMeFileMenuItems,
  shortFileShareMenu,
} from "constants/menuItem.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import React from "react";
import { FaLock } from "react-icons/fa";
import { FiDownload, FiEye, FiLink, FiLock, FiShare2 } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { MdFavorite } from "react-icons/md";
import { IFileTypes } from "types/filesType";

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
  filename?: string;
  handleEvents: (event: string) => Promise<void>;
  handleClose: () => void;
  setDataForEvent: (value: string) => void;
  propStatus: string;
}
export default function FilePreviewNav({
  data,
  filename,
  handleEvents,
  handleClose,
  setDataForEvent,
  propStatus,
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
              {propStatus !== "share" && propStatus !== "extendshare"
                ? filename || data?.filename
                : data?.filename || data?.fileId?.filename}
            </Typography>
          </Box>
          {isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FiDownload
                size={16}
                color={
                  data?.permission && data?.permission !== "edit"
                    ? "#6b7280"
                    : "#F7F9FC"
                }
                style={{
                  cursor:
                    data?.permission && data?.permission !== "edit"
                      ? "not-allowed"
                      : "pointer",
                  pointerEvents: "auto",
                }}
                onClick={() => {
                  if (data?.permission !== "view") {
                    handleEvents("download");
                  }
                }}
              />

              {propStatus === "filedrop" ? (
                <ActionFileDrop
                  color="#ffffff"
                  params={data}
                  eventActions={{
                    handleEvent: (action: string) => {
                      setIsAutoClose(true);
                      setDataForEvent(action), handleEvents(action);
                    },
                  }}
                  anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                />
              ) : propStatus !== "share" && propStatus !== "extendshare" ? (
                <Action
                  color="#ffffff"
                  params={data}
                  eventActions={{
                    handleEvent: (action: string) => {
                      setIsAutoClose(true);
                      setDataForEvent(action), handleEvents(action);
                    },
                  }}
                  anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                />
              ) : (
                <ActionFileShare
                  color="#ffffff"
                  params={data}
                  eventActions={{
                    handleEvent: (action: string) => {
                      setIsAutoClose(true);
                      setDataForEvent(action), handleEvents(action);
                    },
                  }}
                  menuItems={shareWithMeFileMenuItems}
                  shortMenuItems={shortFileShareMenu}
                  anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                />
              )}
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
              {propStatus !== "share" &&
                propStatus !== "extendshare" &&
                propStatus !== "filedrop" && (
                  <Box
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MdFavorite
                      fill={data.favorite ? "#17766B" : "#ffffff"}
                      size={16}
                      onClick={() => handleEvents("favourite")}
                    />
                    {data.filePassword ? (
                      <FaLock
                        fill={theme.palette.primary.main}
                        onClick={() => handleEvents("password")}
                      />
                    ) : (
                      <FiLock
                        size={16}
                        onClick={() => handleEvents("password")}
                      />
                    )}
                  </Box>
                )}

              <FiEye size={16} onClick={() => handleEvents("detail")} />
              <HiOutlineTrash
                size={16}
                onClick={() => handleEvents("delete")}
              />

              <FiDownload
                size={16}
                color={
                  data?.permission && data?.permission !== "edit"
                    ? "#6b7280"
                    : "#F7F9FC"
                }
                style={{
                  cursor:
                    data?.permission && data?.permission !== "edit"
                      ? "not-allowed"
                      : "pointer",
                  pointerEvents: "auto",
                }}
                onClick={() => {
                  if (data?.permission !== "view") {
                    handleEvents("download");
                  }
                }}
              />

              {propStatus !== "filedrop" && (
                <FiLink
                  size={16}
                  color={
                    data?.permission && data?.permission !== "edit"
                      ? "#6b7280"
                      : "#F7F9FC"
                  }
                  style={{
                    cursor:
                      data?.permission && data?.permission !== "edit"
                        ? "not-allowed"
                        : "pointer",
                    pointerEvents: "auto",
                  }}
                  onClick={() => {
                    if (data?.permission !== "view") {
                      handleEvents("get link");
                    }
                  }}
                />
              )}

              {propStatus === "filedrop" ? (
                <Button
                  disabled={
                    data?.permission && data?.permission !== "edit"
                      ? true
                      : false
                  }
                  variant="contained"
                  sx={{
                    fontSize: "14px",

                    bgcolor:
                      data?.permission === "view"
                        ? theme.palette.grey[800]
                        : theme.palette.primary.main,
                    "&.Mui-disabled": {
                      bgcolor: "#6b7280",
                      cursor: "not-allowed",
                      pointerEvents: "auto",
                    },
                  }}
                  onClick={() => {
                    if (!data?.permission || data?.permission !== "view") {
                      handleEvents("share");
                    }
                  }}
                >
                  <FiShare2 size={16} /> &nbsp; Save to Cloud
                </Button>
              ) : (
                <Tooltip
                  title={
                    data?.permission && data?.permission !== "edit"
                      ? "You don't have permission"
                      : ""
                  }
                >
                  <Button
                    disabled={
                      data?.permission && data?.permission !== "edit"
                        ? true
                        : false
                    }
                    variant="contained"
                    sx={{
                      fontSize: "14px",

                      bgcolor:
                        data?.permission === "view"
                          ? theme.palette.grey[800]
                          : theme.palette.primary.main,
                      "&.Mui-disabled": {
                        bgcolor: "#6b7280",
                        cursor: "not-allowed",
                        pointerEvents: "auto",
                      },
                    }}
                    onClick={() => {
                      if (!data?.permission || data?.permission !== "view") {
                        handleEvents("share");
                      }
                    }}
                  >
                    <FiShare2 size={16} /> &nbsp; Share
                  </Button>
                </Tooltip>
              )}
            </Box>
          )}
        </NavBox>
      </Box>
    </>
  );
}
