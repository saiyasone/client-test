import { Box, Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import React, { useRef } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const MostDownloadDataGridContainer = styled("div")({
  height: "100%",
  ".MuiDataGrid-root": {
    borderRadius: 0,
  },
  ".MuiDataGrid-columnHeaders": {
    fontSize: "1rem",
  },
});

const FileIconContainer = styled("div")(() => ({
  width: "24px",
  minWidth: "24px",
  display: "flex",
  alignItems: "center",
}));

const MostDownloadDataGrid = (props) => {
  const isDataFound = useRef<boolean | null>(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  React.useEffect(() => {
    isDataFound.current = null;
    const timer = setTimeout(() => {
      if (props.data?.length > 0) {
        isDataFound.current = true;
      } else {
        isDataFound.current = false;
      }
    }, 10);
    return () => {
      clearTimeout(timer);
    };
  }, [props.data]);

  const columns = [
    {
      field: "filename",
      headerName: "File Name",
      editable: false,
      renderCell: (params) => {
        const { filename } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "12px",
              overflow: "hidden",
            }}
          >
            <FileIconContainer>
              <FileIcon
                extension={getFileType(filename)}
                {...{ ...defaultStyles[getFileType(filename) as string] }}
              />
            </FileIconContainer>
            <Tooltip title={filename}>
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
            </Tooltip>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "size",
      maxWith: 150,
      headerName: "Size",
      renderCell: (params) => convertBytetoMBandGB(params.row.size),
      editable: false,
      flex: 1,
    },
    {
      field: "totalDownloadFaild",
      hide: isMobile ? true : false,
      headerName: "Failed Download",
      renderCell: (params) => params.row.totalDownloadFaild || 0,
      editable: false,
      flex: 1,
    },
    {
      field: "totalDownload",
      headerName: "Success Download",
      renderCell: (params) => params.row.totalDownload || 0,
      editable: false,
      flex: 1,
    },
  ];

  return (
    <MostDownloadDataGridContainer>
      <DataGrid
        sx={{
          ...(isMobile && {
            fontSize: "0.7rem",
          }),
          height: "100% !important",
          /* ".MuiDataGrid-iconButtonContainer": {
            visibility: "visible",
          },
          ".MuiDataGrid-sortIcon": {
            opacity: "inherit !important",
          }, */
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          ".MuiDataGrid-columnHeader": {
            ...(isMobile && {
              fontSize: "0.7rem",
            }),
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            KhtmlUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none",
          },
        }}
        autoHeight
        columns={columns}
        rows={props.data || []}
        hideFooter
        disableSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        getRowId={(row) => row._id}
        components={{
          BaseCheckbox: React.forwardRef(
            (props, ref: React.ForwardedRef<HTMLButtonElement>) => {
              return (
                <Checkbox
                  ref={ref}
                  {...props}
                  sx={{
                    color: "#A5A3AE",
                  }}
                />
              );
            },
          ),
          ColumnSortedAscendingIcon: () => {
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "1.25rem",
                  color: "#A5A3AE",
                }}
              >
                <MdOutlineKeyboardArrowUp />
                <MdOutlineKeyboardArrowDown
                  style={{
                    color: "black",
                    marginTop: "-10px",
                  }}
                />
              </Box>
            );
          },
          ColumnSortedDescendingIcon: () => {
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "1.25rem",
                  color: "#A5A3AE",
                }}
              >
                <MdOutlineKeyboardArrowUp
                  style={{
                    color: "black",
                  }}
                />
                <MdOutlineKeyboardArrowDown
                  style={{
                    marginTop: "-10px",
                  }}
                />
              </Box>
            );
          },
          ColumnUnsortedIcon: () => {
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "1.25rem",
                  color: "#A5A3AE",
                }}
              >
                <MdOutlineKeyboardArrowUp />
                <MdOutlineKeyboardArrowDown
                  style={{
                    marginTop: "-10px",
                  }}
                />
              </Box>
            );
          },
        }}
      />
    </MostDownloadDataGridContainer>
  );
};

export default MostDownloadDataGrid;
