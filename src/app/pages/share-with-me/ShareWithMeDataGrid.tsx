import { Box, Checkbox, styled, useMediaQuery } from "@mui/material";
import FolderNotEmpty from "assets/images/empty/folder-not-empty.svg?react";
import FileDataGrid from "components/file/FileDataGrid";
import ActionFileShare from "components/share/ActionFileShare";
import ActionShare from "components/share/ActionShare";
import {
  shareWithMeFileMenuItems,
  shareWithMeFolderMenuItems,
  shortFavouriteMenuItems,
  shortFileShareMenu,
} from "constants/menuItem.constant";
import { Base64 } from "js-base64";
import moment from "moment";
import React, { Fragment, useMemo, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useSelector } from "react-redux";
import ResponsivePagination from "react-responsive-pagination";
import { useNavigate } from "react-router-dom";
import { checkboxFileAndFolderSelector } from "stores/features/checkBoxFolderAndFileSlice";
import "styles/pagination.style.css";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import Loader from "../../../components/Loader";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

const FolderIconContainer = styled(Box)({
  width: "30px",
});

const FileIconContainer = styled(Box)({
  width: "24px",
  display: "flex",
  alignItems: "center",
});

function ShareWithMeDataGrid(props) {
  const { data, onDoubleClick, handleSelection } = props;
  const navigate = useNavigate();
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [anchorEl, _setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [hover, setHover] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");
  const dataSelector = useSelector(checkboxFileAndFolderSelector);

  const [showLoader, setShowLoader] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const handleOnClick = (folderId: string) => {
    if (!folderId == null || !folderId) {
      return;
    }
    console.log(folderId);

    // const base64URL = Base64?.encodeURI(data?.folderId?._id);
    // if ((data.folderId?.folder_type && isTablet) || isMobile) {
    // const userData =
    //   data?.fromAccount?._id +
    //   "/" +
    //   data?.fromAccount?.newName +
    //   "/" +
    //   data?.permission +
    //   "/" +
    //   data?.folderId?.url;
    // const base64URL = Base64.encodeURI(userData);
    // navigate(`/folder/${base64URL}`);
    // }
    // const base64URL = Base64.encodeURI(data?.folderId?._id);
    // navigate(`/folder/share/${base64URL}`);
  };

  const handleClick = (params: { row: any }) => {
    console.log("mobile onclick");

    if (isMobile) {
      const { folderId } = params?.row;
      if (!folderId && folderId == null) {
        props.handleEvent("preview", params?.row);
      } else {
        handleOnClick(params?.row);
      }
    }
  };

  // use for desktop
  const handleDouble = (params: any) => {
    console.log("desktpp onclick");

    const { folderId } = params?.row;
    console.log("desktop open folder", folderId?._id);
    if (folderId?._id) {
      handleOnClick(folderId?._id);
    } else {
      props.handleEvent("preview", params?.row);
    }
  };

  const columns = [
    {
      field: "checkboxAction",
      headerName: "",
      editable: false,
      sortable: false,
      maxWidth: isMobile ? 40 : 70,
      renderCell: (params) => {
        const { _id } = params?.row || {};
        const isChecked =
          !!props?.dataSelector?.selectionFileAndFolderData?.find(
            (el: any) => el?.id === _id,
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
                    (el: any) => el?.id === _id,
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
      field: "folder_name||filename",
      headerName: "Name",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: params?.row?.folderId?.folder_name ? "6px" : "12px",
          }}
        >
          {params?.row?.folderId?.folder_name ? (
            <FolderIconContainer>
              <FolderNotEmpty />
            </FolderIconContainer>
          ) : (
            <FileIconContainer>
              <FileIcon
                extension={getFileType(params?.row?.fileId?.filename)}
                {...{
                  ...defaultStyles[
                    getFileType(params?.row?.fileId?.filename) as string
                  ],
                }}
              />
            </FileIconContainer>
          )}
          <span>
            {params?.row?.folderId?.folder_name ||
              params?.row?.fileId?.filename}
          </span>
        </div>
      ),
    },

    {
      field: "size",
      headerName: "File size",
      flex: 1,
      renderCell: (params) => {
        let fileSize = 0;

        if (params?.row?.fileId?._id) {
          fileSize = params?.row?.fileId?.size;
        } else {
          fileSize = params?.row?.size;
        }

        return <Fragment>{convertBytetoMBandGB(fileSize || 0)}</Fragment>;
      },
    },

    {
      field: "updatedAt",
      headerName: "Latest shared",
      flex: 1,
      renderCell: (params) => {
        return (
          <span>
            {moment(params.row.createdAt).format("DD-MM-YYYY h:mm:ss")}
          </span>
        );
      },
    },
    {
      field: "action",
      headerName: "",
      flex: 1,
      align: "right",
      renderCell: (params) => {
        if (params?.row?.folderId?.folder_type) {
          return (
            <ActionShare
              params={params}
              shortMenuItems={shortFavouriteMenuItems}
              menuItems={shareWithMeFolderMenuItems}
              eventActions={{
                hover,
                setHover,
                handleEvent: (action, data) => props?.handleEvent(action, data),
              }}
            />
          );
        } else {
          return (
            <ActionFileShare
              params={params}
              eventActions={{
                hover,
                setHover,
                handleEvent: (action, data) => props?.handleEvent(action, data),
              }}
              menuItems={shareWithMeFileMenuItems}
              shortMenuItems={shortFileShareMenu}
              anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
            />
          );
        }
      },
    },
  ];

  const rows = useMemo(
    () =>
      data?.map((row) => ({
        ...row,
        id: row._id,
      })) || [],
    [data],
  );

  return (
    <Fragment>
      {showLoader && rows?.length && <Loader />}
      {!showLoader && (
        <>
          <FileDataGrid
            dataGrid={{
              columns,
              hideFooter: true,
              checked: true,
              disableColumnFilter: true,
              disableColumnMenu: true,
              onCellDoubleClick: !isMobile
                ? (params: { field: string; row: any }) => {
                    if (
                      params.field !== "checkboxAction" &&
                      params.field !== "action"
                    ) {
                      handleDouble(params);
                    }
                  }
                : undefined,
              
              onCellClick: isMobile
                ? (params: { field: string; row: any }) => {
                    if (
                      params.field !== "checkboxAction" &&
                      params.field !== "action"
                    ) {
                      handleClick(params);
                    }
                  }
                : undefined,
            }}
            data={rows}
            hover={hover}
            setHover={setHover}
            open={open}
            handleSelection={handleSelection}
            dataSelector={dataSelector}
          />
          {props.pagination?.countPage > 1 && (
            <>
              {props.pagination?.countTotal > rows?.length && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "90%",
                    mt: 3,
                  }}
                >
                  <ResponsivePagination
                    current={props.pagination.currentPage}
                    total={props.pagination.countPage}
                    onPageChange={props.pagination.setCurrentPage}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Fragment>
  );
}

export default ShareWithMeDataGrid;
