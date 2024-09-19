import React, { Fragment, useState } from "react";
import { FileIcon, FileIconProps, defaultStyles } from "react-file-icon";
import ResponsivePagination from "react-responsive-pagination";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";
//function
import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { IFavouriteTypes } from "types/favouriteType";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

const FavouriteFilesDataGridContainer = styled("div")(() => ({
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

function FavouriteFileDataGrid(props: any) {
  const [hover, setHover] = useState("");
  const [isPage, setIsPage] = useState(false);
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [isLoaded, setIsloaded] = useState<any>(null);
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

  React.useEffect(() => {
    if (props.data?.length > 0) {
      setIsloaded(true);
    }
  }, [props.data]);

  React.useEffect(() => {
    if (props?.total > 10) {
      setIsPage(true);
    } else {
      setIsPage(false);
    }
  }, [props?.data]);

  const handleClick = (params: { row: IFavouriteTypes }) => {
    if (!isMobile) {
      return;
    }
    props.handleEvent("preview", params.row);
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
      renderCell: (params: IFavouriteTypes) => {
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

  return (
    <FavouriteFilesDataGridContainer>
      <FileDataGrid
        handleSelection={props.handleSelection}
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
          getRowId: (row: IFavouriteTypes) => row._id,
        }}
        data={props.data}
      />
      {props.pagination.total > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 3,
          }}
        >
          {isLoaded !== null && isLoaded && (
            <Fragment>
              {isPage && (
                <ResponsivePagination
                  current={props.pagination.currentPage}
                  total={props.pagination.total}
                  onPageChange={props.pagination.setCurrentPage}
                />
              )}
            </Fragment>
          )}
        </Box>
      )}
    </FavouriteFilesDataGridContainer>
  );
}

export default FavouriteFileDataGrid;
