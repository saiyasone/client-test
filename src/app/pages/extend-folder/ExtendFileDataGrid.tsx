import React, { useState } from "react";
import { FileIcon, FileIconProps, defaultStyles } from "react-file-icon";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";
//function
import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import ActionFileShare from "components/share/ActionFileShare";
import menuItems, {
  favouriteMenuItems,
  shortFavouriteMenuItems,
  shortFileShareMenu,
} from "constants/menuItem.constant";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import moment from "moment";
import ResponsivePagination from "react-responsive-pagination";
import { DATE_PATTERN_FORMAT } from "utils/date.util";
import { combineOldAndNewFileNames, getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { IFolderTypes, IMyCloudTypes } from "types/mycloudFileType";
const ExtendFilesDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));
const FileIconContainer = styled("div")(({ theme }) => ({
  maxWidth: "24px",
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "20px",
    minWidth: "20px",
  },
}));

function ExtendFileDataGrid(props:any) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");
  const [hover, setHover] = useState("");
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [styles, setStyles] = React.useState<
  Record<string, Partial<FileIconProps>>
>({});
  const handlePopperOpen = (event:any) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r:IFolderTypes) => r._id === id);
    setHover(row);
    setAnchorEvent(event.currentTarget);
  };

  const handleOnPreview = (data:{row:IFolderTypes}) => {
    if (isTablet || isMobile) {
      props.handleEvent("preview", data.row);
    }
  };
  // const handlePopperClose = (event) => {
  const handlePopperClose = () => {
    if (anchorEvent == null) {
      return;
    }
    setHover("");
    setAnchorEvent(null);
  };
  const handleClick = (params: { row: IFolderTypes }) => {
    if (!isMobile) {
      return;
    }
    props.handleEvent("folder double click", params.row);
  };

  const columns = [
    {
      field: "checkboxAction",
      headerName: "",
      editable: false,
      sortable: false,
      maxWidth: isMobile ? 40 : 70,
      flex: 1,
      renderCell: (params:{row:IMyCloudTypes}) => {
        const { _id } = params?.row || {};
        const isChecked =
        !!props?.dataSelector?.selectionFileAndFolderData?.find(
          (el: IMyCloudTypes) => el?.id === _id,
        );
        return (
         
          <div>
            {isMobile ? (
              <Box>
                <Checkbox
                  checked={isChecked}
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={
                    <CheckBoxIcon
                      sx={{
                        color: "#17766B",
                      }}
                    />
                  }
                  onClick={() => props?.handleSelection(_id)}
                  sx={{ padding: "0" }}
                />
              </Box>
            ) : (
              <Checkbox
                checked={
                  !!props?.dataSelector?.selectionFileAndFolderData?.find(
                    (el: IMyCloudTypes) => el?.id === _id,
                  ) && true
                }
                aria-label={"checkbox" + _id}
                onClick={() => props?.handleSelection(_id)}
              />
            )}
          </div>
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      editable: false,
      minWidth: 120,
      flex: 1,
      renderCell: (params:any) => {
        const { name, newName } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "12px",
              overflow: "hidden",
            }}
          >
            <FileIconContainer onClick={() => handleOnPreview(params)}>
              <FileIcon
                extension={getFileType(name)??""}
                {...{ ...styles[getFileType(name) as string] }}
              />
            </FileIconContainer>
            <div
              className="file_name"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {combineOldAndNewFileNames(name, newName)}
            </div>
          </div>
        );
      },
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params:{row:IMyCloudTypes}) => {
        return <Box>{convertBytetoMBandGB(parseInt(params.row.size))}</Box>;
      },
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params:{row:IMyCloudTypes}) =>
        moment(params.row.updatedAt).format(DATE_PATTERN_FORMAT.datetime),
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      flex: 1,
      align: "right",
      editable: false,
      sortable: false,
      renderCell:  (params:{row:IMyCloudTypes}) =>{
        return (
          <>
            {props.isFromSharingUrl ? (
              <ActionFileShare
                params={params}
                eventActions={{
                  hover,
                  setHover,
                  handleEvent: (action, data) =>
                    props.handleEvent(action, data),
                }}
                menuItems={menuItems}
                shortMenuItems={props.shortMenuItems || shortFileShareMenu}
                anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                user={props.user}
              />
            ) : (
              <Action
                params={params}
                eventActions={{
                  hover,
                  setHover,
                  handleEvent: (action, data) =>
                    props.handleEvent(action, data),
                }}
                menuItems={favouriteMenuItems}
                shortMenuItems={shortFavouriteMenuItems}
                anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                user={props.user}
              />
            )}
          </>
        );
      },
    },
  ];

  return (
    <ExtendFilesDataGridContainer>
      <FileDataGrid
        dataGrid={{
          sx: {
            "& .MuiDataGrid-columnSeparator": { display: "none" },
          },
          checked: true,
          disableColumnFilter: true,
          disableColumnMenu: true,
          componentsProps: {
            row: {
              onMouseEnter: handlePopperOpen,
              onMouseLeave: handlePopperClose,
            },
          },
          onRowDoubleClick:(params: { row: IFolderTypes }) =>{
            props.handleEvent("preview", params.row);
          },
          onCellClick: (params: { field: string; row: IFolderTypes }) => {
            if (
              params.field !== "checkboxAction" &&
              params.field !== "action"
            ) {
              handleClick(params);
            }
          },

          columns,
          hideFooter: true,
        }}
        data={props.data}
        handleSelection={props.handleSelection}
      />

      {props?.pagination?.totalItems > 10 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 5,
          }}
        >
          <ResponsivePagination
            current={props?.pagination?.currentPage}
            total={props?.pagination?.total}
            onPageChange={props?.pagination?.setCurrentPage}
          />
        </Box>
      )}
    </ExtendFilesDataGridContainer>
  );
}

export default ExtendFileDataGrid;
