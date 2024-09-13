import React, { useState } from "react";
import ResponsivePagination from "react-responsive-pagination";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";

// component

// graphql

//function
import Action2 from "components/action-table/Action2";
import FileDataGrid from "components/file/FileDataGrid";
import {
  favouriteMenuItems,
  shortMyCloudMenuItems,
} from "constants/menuItem.constant";
import moment from "instances/moment.instance";
import { useMemo } from "react";
import { convertBytetoMBandGB } from "utils/storage.util";
import { IFolderTypes } from "types/mycloudFileType";

const CloudFoldersDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const IconFolderContainer = styled(Box)({
  width: "34px",
  display: "flex",
  alignItems: "center",
});

function CloudFolderDataGrid(props: any) {
  const [hover, setHover] = useState("");
  const [_isPage, setIsPage] = useState(false);
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [isLoaded, setIsloaded] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const handlePopperOpen = (event: any) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r: IFolderTypes) => r._id === id);
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
      renderCell: (params: { row: IFolderTypes }) => {
        const { _id } = params?.row || {};
        const isChecked =
          !!props?.dataSelector?.selectionFileAndFolderData?.find(
            (el: IFolderTypes) => el?.id === _id,
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
                    (el: IFolderTypes) => el?.id === _id,
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
      field: "folder_name",
      headerName: "Name",
      editable: false,
      minWidth: 120,
      flex: 1,
      renderCell: (params: { row: IFolderTypes }) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "6px",
            }}
          >
            <IconFolderContainer>
              {parseInt(params.row?.total_size) > 0 ? (
                <FolderNotEmptyIcon />
              ) : (
                <FolderEmptyIcon />
              )}
            </IconFolderContainer>
            <span>{params?.row?.folder_name}</span>
          </div>
        );
      },
    },
    {
      field: "size",
      headerName: "Folder size",
      renderCell: (params: { row: IFolderTypes }) => {
        return (
          <span>{convertBytetoMBandGB(parseInt(params?.row?.total_size))}</span>
        );
      },
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Lasted Update",
      editable: false,
      renderCell: (params: { row: IFolderTypes }) => {
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
      renderCell: (params: { row: IFolderTypes }) => {
        return (
          <Action2
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action: string, data: IFolderTypes) =>
                props.handleEvent(action, data),
            }}
            menuItems={favouriteMenuItems}
            shortMenuItems={shortMyCloudMenuItems}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];

  const rows = useMemo(
    () =>
      props?.data.map((row: IFolderTypes) => ({
        ...row,
        id: row?._id,
      })) || [],
    [props?.data],
  );

  return (
    <CloudFoldersDataGridContainer>
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
          onCellDoubleClick: (params: { row: IFolderTypes }) =>
            props.handleEvent("folder double click", params.row),
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
          getRowId: (row: IFolderTypes) => row._id,
        }}
        data={rows}
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
            <ResponsivePagination
              current={props.pagination.currentPage}
              total={props.pagination.total}
              onPageChange={props.pagination.setCurrentPage}
            />
          )}
        </Box>
      )}
    </CloudFoldersDataGridContainer>
  );
}

export default CloudFolderDataGrid;
