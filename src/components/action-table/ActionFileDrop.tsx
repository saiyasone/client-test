import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import { fileDropMenuItems } from "constants/menuItem.constant";
import { BiSolidEdit } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";
import { MdFavorite, MdOutlineFavoriteBorder } from "react-icons/md";
export default function ActionFileDrop(props) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { params, eventActions } = props;

  return (
    <div style={{ position: "relative" }}>
      {(eventActions.hover && eventActions.hover?.id) === params?.id &&
      !isMobile ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{ padding: "0 20px", display: "flex", alignItems: "center" }}
          >
            {/* <IconButton
              onClick={() => eventActions.handleEvent("share", params?.row)}
            >
              <PiShareNetworkLight size="18px" />
            </IconButton> */}
            <IconButton
              onClick={() => eventActions.handleEvent("download", params?.row)}
            >
              <FiDownload size="18px" />
            </IconButton>

            <IconButton
              onClick={() => eventActions.handleEvent("rename", params?.row)}
            >
              <BiSolidEdit size="18px" />
            </IconButton>
            <IconButton
              onClick={() => {
                eventActions.handleEvent("favourite", params?.row);
              }}
            >
              {params?.row?.favorite ||
              params?.row?.fileId?.favorite ||
              params.favorite ? (
                <MdFavorite size="18px" fill="#17766B" />
              ) : (
                <MdOutlineFavoriteBorder size="18px" />
              )}
            </IconButton>
          </Box>

          <MenuDropdown
            customButton={{
              element: (
                <IconButton>
                  <MoreVertRoundedIcon />
                </IconButton>
              ),
            }}
          >
            {fileDropMenuItems.map((menuItem, index) => {
              return (
                <MenuDropdownItem
                  isFavorite={
                    params?.row?.favorite ||
                    params.row.fileId?.favorite ||
                    params?.favorite
                      ? true
                      : false
                  }
                  key={index}
                  title={menuItem.title}
                  icon={menuItem.icon}
                  onClick={() => {
                    eventActions.handleEvent(menuItem.action, params?.row);
                  }}
                />
              );
            })}
          </MenuDropdown>
        </Box>
      ) : (
        <MenuDropdown
          anchor={props.anchor}
          customButton={{
            element: (
              <IconButton>
                <MoreVertRoundedIcon sx={{ color: props.color ?? "" }}/>
              </IconButton>
            ),
          }}
        >
          {fileDropMenuItems.map((menuItem, index) => {
            return (
              <MenuDropdownItem
                isFavorite={
                  params?.row?.favorite ||
                  params?.row?.fileId?.favorite ||
                  params?.favorite
                    ? true
                    : false
                }
                key={index}
                title={menuItem.title}
                icon={menuItem.icon}
                onClick={() => {
                  eventActions.handleEvent(menuItem.action, params?.row);
                }}
              />
            );
          })}
        </MenuDropdown>
      )}
    </div>
  );
}
