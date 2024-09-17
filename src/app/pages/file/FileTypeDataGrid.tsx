import React, { useState } from "react";
import { FileIcon, FileIconProps, defaultStyles } from "react-file-icon";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";
import ResponsivePagination from "react-responsive-pagination";

import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { combineOldAndNewFileNames, getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { IFileTypes } from "types/filesType";
const FileTypeDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const FileIconContainer = styled("div")(() => ({
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
}));

function FileTypeDataGrid(props: any) {
  const { pagination, total, handleSelect } = props;
  const [hover, setHover] = useState("");
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [styles, setStyles] = React.useState<
    Record<string, Partial<FileIconProps>>
  >({});
  const handlePopperOpen = (event: any) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data?.find((r: any) => r.id === id);
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

  const handleClick = (params: { row: IFileTypes }) => {
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
      width: 50,
      renderCell: (params: { row: IFileTypes }) => {
        const { _id } = params?.row || {};

        return (
          <Checkbox
            checked={
              !!props?.dataSelector?.selectionFileAndFolderData?.find(
                (el: any) => el?.id === _id,
              ) && true
            }
            aria-label={"checkbox" + _id}
            onClick={() => handleSelect(_id)}
          />
        );
      },
    },
    {
      field: "filename",
      headerName: "Name",
      editable: false,
      renderCell: (params: { row: IFileTypes }) => {
        const { filename } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "12px",
            }}
          >
            <FileIconContainer>
              <FileIcon
                extension={getFileType(filename) ?? ""}
                {...{ ...styles[getFileType(filename) as string] }}
              />
            </FileIconContainer>
            <div className="file_name">
              {combineOldAndNewFileNames(filename, params?.row?.newFilename)}
            </div>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params:{row:IFileTypes}) => convertBytetoMBandGB(parseInt(params.row.size)),
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params:{row:IFileTypes}) =>
        moment(params.row.updatedAt).format("D MMM YYYY, h:mm A"),
      flex: 1,
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      editable: false,
      sortable: false,
      renderCell: (params:{row:IFileTypes}) => {
        return (
          <Action
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action:string, data:IFileTypes) => {
                props.handleEvent(action, data);
              },
            }}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];

  return (
    <FileTypeDataGridContainer>
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
          onRowDoubleClick: (params:{row:IFileTypes}) => {
            props.handleEvent("preview", params.row);
          },
          onCellClick: (params: { field: string; row: IFileTypes }) => {
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
        // handleSelection={handleSelect}
        data={props.data}
      />
      {total > props.data?.length && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 3,
          }}
        >
          <ResponsivePagination
            total={pagination?.total}
            current={pagination?.currentPage}
            onPageChange={pagination?.setCurrentPage}
          />
        </Box>
      )}
    </FileTypeDataGridContainer>
  );
}

export default FileTypeDataGrid;
