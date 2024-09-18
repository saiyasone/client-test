import { createTheme, styled } from "@mui/material/styles";
import React, { useState } from "react";
import { FileIcon, FileIconProps } from "react-file-icon";
//function
import { Box, Checkbox, useMediaQuery } from "@mui/material";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { IFavouriteTypes } from "types/favouriteType";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { IRecentTypes } from "types/recentFileType";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

const theme = createTheme();
const RecentDataGridContainer = styled("div")(() => ({
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

function RecentFileDataGrid(props: any) {
  const [hover, setHover] = useState("");
  const { handleSelection } = props;
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [styles, setStyles] = React.useState<
    Record<string, Partial<FileIconProps>>
  >({});

  const handlePopperOpen = (event: any) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r: IFavouriteTypes) => r.id === id);
    setHover(row);
    setAnchorEvent(event.currentTarget);
  };

  const handlePopperClose = () => {
    if (anchorEvent == null) {
      return;
    }
    setHover("");
    setAnchorEvent(null);
  };

  const columns = [
    {
      field: "checkboxAction",
      headerName: "",
      editable: false,
      sortable: false,
      maxWidth: isMobile ? 40 : 70,
      flex: 1,
      renderCell: (params: { row: IFavouriteTypes }) => {
        const { _id } = params?.row || {};
        const isChecked =
          !!props?.dataSelector?.selectionFileAndFolderData?.find(
            (el: IFavouriteTypes) => el?.id === _id,
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
                    (el: IFavouriteTypes) => el?.id === _id,
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
      field: "filename",
      headerName: "Name",
      editable: false,
      minWidth: 120,
      flex: 1,
      renderCell: (params: { row: IFavouriteTypes }) => {
        const { filename } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              columnGap: "12px",
            }}
          >
            <FileIconContainer>
              <FileIcon
                extension={getFileType(filename) ?? ""}
                {...{ ...styles[getFileType(filename) as string] }}
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
              {filename}
            </div>
          </div>
        );
      },
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params: { row: IFavouriteTypes }) =>
        convertBytetoMBandGB(parseInt(params.row.size)),
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params: { row: IFavouriteTypes }) =>
        moment(params.row.actionDate).format("YYYY-MM-DD h:mm:ss"),
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      flex: 1,
      align: "right",
      editable: false,
      sortable: false,
      renderCell: (params: { row: IFavouriteTypes }) => {
        return (
          <Action
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action: string, data: IFavouriteTypes) =>
                props.handleEvent(action, data),
            }}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];
  const handleClick = (params: { row: IRecentTypes }) => {
    if (!isMobile) {
      return;
    }
    props.handleEvent("preview", params.row);
  };

  return (
    <RecentDataGridContainer>
      <FileDataGrid
        handleSelection={handleSelection}
        dataGrid={{
          sx: {
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
              display: "none",
            },
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
          onRowDoubleClick: (params: { row: IFavouriteTypes }) => {
            props.handleEvent("preview", params.row);
          },
          onCellClick: (params: { field: string; row: IFavouriteTypes }) => {
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
      />
    </RecentDataGridContainer>
  );
}

export default RecentFileDataGrid;
