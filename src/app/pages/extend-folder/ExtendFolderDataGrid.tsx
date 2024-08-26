import { Fragment, useEffect, useState } from "react";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
//function
import Action2 from "components/action-table/Action2";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import FileDataGrid from "components/file/FileDataGrid";
import ActionShare from "components/share/ActionShare";
import {
  favouriteMenuItems,
  shareWithMeFolderMenuItems,
  shortFavouriteMenuItems,
} from "constants/menuItem.constant";
import { Base64 } from "js-base64";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { convertBytetoMBandGB } from "utils/storage.util";

const ExtendFolderDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const FileIconContainer = styled("div")(() => ({
  width: "30px",
}));

function ExtendFolderDataGrid(props) {
  const [hover, setHover] = useState("");
  const [showEncryptPassword, setShowEncryptPassword] = useState(false);
  const [dataForEvents, setDataForEvents] = useState<any>({
    data: null,
  });
  const [anchorEvent, setAnchorEvent] = useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = useState(null);
  // const [isLoaded, setIsloaded] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");
  const navigate = useNavigate();

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r) => r._id === id);
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

  const handleOnPreview = (data) => {
    if (isTablet || isMobile) {
      if (props.user.permission) {
        const base64URL = Base64.encodeURI(
          props.user?._id +
            "/" +
            props.user?.newName +
            "/" +
            props.user.permission +
            "/" +
            data.row?.url,
        );
        navigate(`/folder/${base64URL}`);
      } else {
        const base64URL = Base64.encodeURI(data?.row?.url);
        navigate(`/folder/${base64URL}`);
      }
    }
  };

  // const columnsSelector = useMemo(() => {
  //   return columns || [];
  // }, [props?.dataSelector?.selectionFileAndFolderData]);

  const columns = [
    {
      field: "checkboxAction",
      headerName: "",
      editable: false,
      sortable: false,
      width: 50,
      renderCell: (params) => {
        const { _id } = params?.row || {};

        return (
          <Checkbox
            checked={
              props?.dataSelector?.selectionFileAndFolderData?.find(
                (el) => el?.id === _id,
              )
                ? true
                : false
            }
            aria-label={"checkbox" + _id}
            onClick={() => props?.handleSelection(_id)}
          />
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      editable: false,
      renderCell: (params) => {
        const { name, isContainsFiles, _id } = params.row || {};
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "6px",
            }}
          >
            <FileIconContainer onClick={() => handleOnPreview(params)}>
              {isContainsFiles ? <FolderNotEmptyIcon /> : <FolderEmptyIcon />}
            </FileIconContainer>
            <div className="file_name">{name}</div>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params) => {
        return (
          <Fragment>{convertBytetoMBandGB(params.row.total_size)}</Fragment>
        );
      },
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params) =>
        moment(params.row.updatedAt).format("D MMM YYYY, h:mm A"),
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      flex: 1,
      align: "right",
      editable: false,
      sortable: false,
      renderCell: (params) => {
        const { isContainsFiles } = params.row || {};

        return (
          <>
            {props.isFromSharingUrl ? (
              <ActionShare
                params={params}
                eventActions={{
                  hover,
                  setHover,
                  handleEvent: (action, data) =>
                    props.handleEvent(action, data),
                }}
                menuItems={shareWithMeFolderMenuItems}
                shortMenuItems={shortFavouriteMenuItems}
                anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                user={props.user}
                isContainsFiles={isContainsFiles}
              />
            ) : (
              <Action2
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
              />
            )}
          </>
        );
      },
    },
  ];

  function handleDoubleClick() {
    if (dataForEvents.data) {
      const { url } = dataForEvents.data || {};
      if (props.user.permission) {
        const base64URL = Base64.encodeURI(
          props.user?._id +
            "/" +
            props.user?.newName +
            "/" +
            props.user.permission +
            "/" +
            url,
        );
        if (props?.isShare) {
          navigate(`/folder/share/${base64URL}`);
        } else {
          navigate(`/folder/${base64URL}`);
        }
      } else {
        const base64URL = Base64.encodeURI(url);
        if (props?.isShare) {
          navigate(`/folder/share/${base64URL}`);
        } else {
          navigate(`/folder/${base64URL}`);
        }
      }
    }
  }

  function handleDecryptionPassword() {
    handleDoubleClick();
  }

  function handleClosePassword() {
    setShowEncryptPassword(false);
    setDataForEvents(() => {
      return {
        data: null,
      };
    });
  }

  useEffect(() => {
    if (dataForEvents.data) {
      if (dataForEvents.data?.access_password) {
        setShowEncryptPassword(true);
      } else {
        handleDoubleClick();
      }
    }
  }, [dataForEvents.data]);

  return (
    <Fragment>
      <ExtendFolderDataGridContainer>
        <FileDataGrid
          dataGrid={{
            sx: {
              "& .MuiDataGrid-columnSeparator": { display: "none" },
            },
            onRowDoubleClick: (params) => {
              setDataForEvents({ data: params.row });
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
            columns,
            hideFooter: true,
          }}
          data={props.data}
          handleSelection={props.handleSelection}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 3,
          }}
        ></Box>
      </ExtendFolderDataGridContainer>

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={dataForEvents.data?.name}
        filePassword={dataForEvents.data?.access_password}
        onConfirm={handleDecryptionPassword}
        onClose={handleClosePassword}
      />
    </Fragment>
  );
}

export default ExtendFolderDataGrid;
