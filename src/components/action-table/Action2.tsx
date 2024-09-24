import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import useAuth from "hooks/useAuth";
import React, { useEffect, useState } from "react";
import { BsPinAngleFill } from "react-icons/bs";
import { FaLock } from "react-icons/fa";
import { MdFavorite } from "react-icons/md";

export default function Action2(props) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { params, eventActions } = props;
  const { user }: any = useAuth();
  const [_userPackage, setUserPackage] = useState();

  useEffect(() => {
    if (user) {
      setUserPackage(user?.packageId);
    }
  }, [user]);

  return (
    <div style={{ position: "relative" }}>
      {eventActions.hover &&
      (eventActions.hover?.id || eventActions.hover?._id) === params?.id &&
      !isMobile ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {props?.shortMenuItems?.map((menuItem, index) => {
              let result;
              switch (true) {
                case menuItem.title === "Favourite":
                  if (params?.row?.favorite) {
                    result = <MdFavorite fill="#17766B" />;
                  } else {
                    result = menuItem.icon;
                  }
                  break;

                case menuItem.title === "Password":
                  if (
                    params?.row?.filePassword ||
                    params?.row?.access_password ||
                    params?.row?.password ||
                    params?.row?.access_passwordFolder
                  ) {
                    result = <FaLock fill="#17766B" />;
                  } else {
                    result = menuItem.icon;
                  }
                  break;
                case menuItem.title === "Pin":
                  if (params?.row?.pin || params?.folderId?.pin) {
                    result = <BsPinAngleFill fill="#3C384A" />;
                  } else {
                    result = menuItem.icon;
                  }
                  break;

                default:
                  result = menuItem.icon;
              }
              return (
                <IconButton
                  disabled={
                    params?.row?.total_size > 0 ||
                    // params?.row?.file_id?.[0]?._id ||
                    // params.row.parentkey?.[0]?._id ||
                    props?.isContainFile ||
                    params?.row?.isContainsFiles
                      ? false
                      : menuItem.disabled
                  }
                  key={index}
                  onClick={() =>
                    eventActions.handleEvent(
                      menuItem.action,
                      params?.row || params,
                    )
                  }
                >
                  {React.cloneElement(result, {
                    size: "18px",
                  })}
                </IconButton>
              );
            })}
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
            {props.menuItems.map((menuItem, index) => {
              return (
                <MenuDropdownItem
                  disabled={
                    params?.row?.total_size > 0 ||
                    // params?.row?.file_id?.[0]?._id ||
                    // params.row.parentkey?.[0]?._id ||
                    props?.isContainFile ||
                    params?.row?.isContainsFiles
                      ? false
                      : menuItem.disabled
                  }
                  isPassword={
                    params?.row?.filePassword ||
                    params?.row?.access_password ||
                    params?.row?.password ||
                    params?.row?.access_passwordFolder
                      ? true
                      : false
                  }
                  isFavorite={params?.row?.favorite ? true : false}
                  isPinned={
                    params?.row?.pin || params?.folderId?.pin ? true : false
                  }
                  onClick={() => {
                    eventActions.handleEvent(menuItem.action, params?.row);
                  }}
                  key={index}
                  title={menuItem.title}
                  icon={menuItem.icon}
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
                <MoreVertRoundedIcon />
              </IconButton>
            ),
          }}
        >
          {props.menuItems.map((menuItem, index) => {
            return (
              <MenuDropdownItem
                disabled={
                  params?.row?.total_size > 0 ||
                  // params?.row?.file_id?.[0]?._id ||
                  // params.row.parentkey?.[0]?._id ||
                  props.isContainFile ||
                  params?.row?.isContainsFiles
                    ? false
                    : menuItem.disabled
                }
                key={index}
                title={menuItem.title}
                isPassword={
                  params?.row?.filePassword ||
                  params?.row?.access_password ||
                  params?.row?.password ||
                  params?.row?.access_passwordFolder
                    ? true
                    : false
                }
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
