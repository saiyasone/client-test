//mui component and style
import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled as muiStyled } from "@mui/system";
import BaseDialogV1 from "components/BaseDialogV1";
import BreadcrumbV2 from "components/BreadcrumbV2";
import FileCardItem from "components/FileCardItem";
import { FileIcon, defaultStyles } from "react-file-icon";
import { FaTimes } from "react-icons/fa";
import { getFileType } from "utils/file.util";
import { cutStringWithEllipsis } from "utils/string.util";

const DialogFileDetailHeader = muiStyled("div")({
  display: "flex",
  alignItems: "center",
});
const DialogFileDetailBoby = muiStyled("div")({
  width: "100%",
  display: "flex",
  columnGap: "2rem",
});

const DialogFileDetailLeft = muiStyled("div")({
  width: "100%",
  flexShrink: 0,
  flexGrow: 1,
  height: "164px",
  minHeight: "164px",
});

const DialogFileDetailRight = muiStyled("div")({
  width: "100%",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  rowGap: "0.7rem",
  flexShrink: 0,
});

const DialogFileDetailRightHeader = muiStyled("div")({
  fontSize: "1rem",
  fontWeight: "600",
});

const DialogFileDetailRightList = muiStyled("ul")({
  listStyleType: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  rowGap: "0.6rem",
});

const DialogFileDetailRightListItem = muiStyled("li")({
  width: "100%",
  display: "flex",
  alignItems: "center",
  columnGap: "1.2rem",
  "> .content": {
    fontWeight: 500,
  },
  "> .content.path": {},
});

const FileIconContainer = muiStyled("div")(() => ({
  display: "flex",
  width: "25px",
  minWidth: "25px",
  alignItems: "center",
  marginRight: "10px",
}));

const DialogFileDetail = (props) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  return (
    <BaseDialogV1
      {...props}
      onClose={() => props.onClose()}
      disableDefaultButton
      dialogContentProps={{
        sx: {
          paddingBottom: "35px",
        },
      }}
      titleContent={
        <DialogFileDetailHeader>
          <FileIconContainer>
            <FileIcon
              extension={getFileType(props?.name)}
              {...{ ...defaultStyles[getFileType(props?.name) as string] }}
            />
          </FileIconContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            {props.name?.length > (isMobile ? 20 : 35) ? (
              <Tooltip title={props.name} placement="bottom">
                <Typography
                  variant="h6"
                  fontSize={isMobile ? "0.8rem" : "1rem"}
                  whiteSpace="nowrap"
                >
                  {cutStringWithEllipsis(props.name, 20)}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                variant="h6"
                fontSize={isMobile ? "0.8rem" : "1rem"}
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {props.name}
              </Typography>
            )}
            <IconButton
              onClick={props.onClose}
              style={{
                color: "#817E8D",
              }}
            >
              <FaTimes />
            </IconButton>
          </Box>
        </DialogFileDetailHeader>
      }
    >
      <DialogFileDetailBoby>
        <Grid container spacing={10} rowSpacing={13}>
          <Grid item md={5} sm={12} xs={12}>
            <DialogFileDetailLeft>
              <FileCardItem
                fileType={props.type}
                imagePath={props.imagePath}
                user={props.user}
                isPublic={props?.data?.createdBy?._id === "0" ? true : false}
                disableName
                disableOnHoverEffect
                name={props.name}
                cardProps={{
                  isNormalCard: true,
                  sx: {
                    "&:hover": {
                      ".file-card-image": {
                        transition: "200ms",
                        opacity: 0.9,
                      },
                    },
                  },
                }}
                favouriteIcon={{
                  isShow: props?.favouriteIcon?.isShow,
                  handleOnClick: props?.favouriteIcon?.handleFavouriteOnClick,
                  isFavourite: props?.favouriteIcon?.isFavourite,
                }}
                pinIcon={{
                  isShow: props?.pinIcon?.isShow,
                  handleOnClick: props?.pinIcon?.handlePinOnClick,
                  isPinned: props?.pinIcon?.isPinned,
                }}
                downloadIcon={{
                  isShow: props?.downloadIcon?.isShow,
                  handleOnClick: props?.downloadIcon?.handleDownloadOnClick,
                }}
              />
            </DialogFileDetailLeft>
          </Grid>
          {/* right */}
          <Grid item md={7} sm={12} xs={12}>
            <DialogFileDetailRight>
              <DialogFileDetailRightHeader>
                File Details
              </DialogFileDetailRightHeader>
              <DialogFileDetailRightList>
                <DialogFileDetailRightListItem>
                  <div className="title">Type</div>
                  {props.displayType.length > 35 ? (
                    <Tooltip title={props.displayType} placement="bottom">
                      <div className="content">
                        {cutStringWithEllipsis(props.displayType, 35)}
                      </div>
                    </Tooltip>
                  ) : (
                    <div className="content">{props.displayType}</div>
                  )}
                </DialogFileDetailRightListItem>
                <DialogFileDetailRightListItem>
                  <div className="title">Size</div>
                  <div className="content">{props.size}</div>
                </DialogFileDetailRightListItem>
                <DialogFileDetailRightListItem>
                  <div className="title">Path</div>
                  <div
                    className="content path"
                    style={{
                      overflow: "hidden",
                      flex: "1 1 100%",
                    }}
                  >
                    <BreadcrumbV2
                      title={props.title}
                      path={props.path}
                      mainIcon={props.iconTitle}
                      handleFolderNavigate={(path) => {
                        props.breadcrumb.handleFolderNavigate(path);
                        props.handleOnClose?.();
                      }}
                    />
                  </div>
                </DialogFileDetailRightListItem>
                <DialogFileDetailRightListItem>
                  <div className="title">Date added</div>
                  <div className="content">{props.dateAdded}</div>
                </DialogFileDetailRightListItem>
                <DialogFileDetailRightListItem>
                  <div className="title">Last modified</div>
                  <div className="content">{props.lastModified}</div>
                </DialogFileDetailRightListItem>
                <DialogFileDetailRightListItem>
                  <div className="title">Total download</div>
                  <div className="content">
                    {props.totalDownload
                      ? `${props.totalDownload} ${
                          props.totalDownload > 1 ? "times" : "time"
                        }`
                      : "0 time"}
                  </div>
                </DialogFileDetailRightListItem>
              </DialogFileDetailRightList>
            </DialogFileDetailRight>
          </Grid>
        </Grid>
      </DialogFileDetailBoby>
    </BaseDialogV1>
  );
};

export default DialogFileDetail;
