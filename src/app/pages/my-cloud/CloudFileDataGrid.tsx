import React, { Fragment, useState } from "react";
import { FileIcon, FileIconProps } from "react-file-icon";
import ResponsivePagination from "react-responsive-pagination";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";

// component

// graphql

//function
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { createTheme, styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { IMyCloudTypes } from "types/mycloudFileType";
import { combineOldAndNewFileNames, getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
const CloudFilesDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));
const theme = createTheme();
function CloudFileDataGrid(props: any) {
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
    const row = props.data.find((r: IMyCloudTypes) => r._id === id);
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

  const handleClick = (params: { row: IMyCloudTypes }) => {
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
      renderCell: (params: { row: IMyCloudTypes }) => {
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
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
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
      field: "filename",
      headerName: "Name",
      editable: false,
      minWidth: 120,
      flex: 1,
      renderCell: (params: { row: IMyCloudTypes }) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "12px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{ maxWidth: "24px", display: "flex", alignItems: "center" }}
              mt={2}
              onClick={() => props.handleEvent("preview", params.row)}
            >
              <FileIcon
                color="white"
                extension={getFileType(params.row.filename) ?? ""}
                {...{
                  ...styles[getFileType(params.row.filename) as string],
                }}
              />
            </Box>
            <span
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {combineOldAndNewFileNames(
                params?.row?.filename,
                params?.row?.newFilename,
              )}
            </span>
          </div>
        );
      },
    },
    {
      field: "size",
      headerName: "File size",
      flex: 1,
      renderCell: (params: { row: IMyCloudTypes }) => {
        return (
          <span>
            {convertBytetoMBandGB(
              params.row.size ? parseInt(params.row.size) : 0,
            )}
          </span>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Lasted Update",
      editable: false,
      renderCell: (params: { row: IMyCloudTypes }) => {
        return (
          <span>
            {moment(params.row.updatedAt).format("D MMM YYYY, h:mm A")}
          </span>
        );
      },
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      flex: 1,
      align: "right",
      editable: false,
      sortable: false,
      renderCell: (params: { row: IMyCloudTypes }) => {
        return (
          <Action
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action: string, data: { row: IMyCloudTypes }) =>
                props.handleEvent(action, data),
            }}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];

  return (
    <CloudFilesDataGridContainer>
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
          onRowDoubleClick: (params: { row: IMyCloudTypes }) => {
            props.handleEvent("preview", params.row);
          },
          onCellClick: (params: { field: string; row: IMyCloudTypes }) => {
            if (
              params.field !== "checkboxAction" &&
              params.field !== "action"
            ) {
              handleClick(params);
            }
          },
          columns,
          hideFooter: true,
          getRowId: (row: IMyCloudTypes) => row._id,
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
    </CloudFilesDataGridContainer>
  );
}

export default CloudFileDataGrid;
