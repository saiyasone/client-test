import { Dialog, createTheme, styled } from "@mui/material";

const theme = createTheme();

export const UploadDialogContainer = styled(Dialog)({
  "& .MuiPaper-root": {
    maxWidth: "680px",
  },
});

export const UploadUppyContainer = styled("div")({
  padding: "2rem 1.7rem",

  [theme.breakpoints.down("md")]: {
    padding: "1.5rem 1.2rem",
  },
});

export const UploadFolderCircularProgress = styled("div")<{ progress: number }>(
  ({ progress }) => ({
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #ccc", // default border color
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      border: "2px solid #fff",
      clip: "rect(0, 30px, 30px, 15px)", // clip to show half circle
      transform: `rotate(${(progress / 100) * 180}deg)`, // rotate based on progress
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      border: "2px solid #fff",
      clip: "rect(0, 15px, 30px, 0)", // clip to show half circle
      transform:
        progress > 50
          ? `rotate(180deg)`
          : `rotate(${(progress / 100) * 180}deg)`,
    },
  }),
);

export const UppyHeader = styled("div")({
  marginBottom: "2rem",
  textAlign: "center",

  [theme.breakpoints.down("md")]: {
    marginBottom: "1.5rem",
  },

  [theme.breakpoints.down("sm")]: {
    marginBottom: "1.2rem",
  },

  h2: {
    fontWeight: "500",
    fontSize: "18px",
    color: "#4b465c",

    [theme.breakpoints.down("sm")]: {
      fontSize: "15px",
    },
  },
});

export const ActionTabContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginBottom: "20px",
});

export const ActionTab = styled("button")({
  outline: "none",
  border: "1px solid #17766B",
  borderRadius: "6px",
  padding: "10px 18px",
  transition: "all 0.3s",
  fontSize: "15px",
  backgroundColor: "transparent",
  cursor: "pointer",

  "&.active": {
    backgroundColor: "#17766B",
    color: "#fff",
  },
});

export const UploadFolderContainer = styled("div")({
  borderRadius: "10px",
  border: "1px solid #eee",
  backgroundColor: "#fff",
});

export const UploadFolderHeaderContainer = styled("div")({
  width: "inherit",
  backgroundColor: "#F5F5F5",
  padding: "12px",

  [theme.breakpoints.down("md")]: {
    padding: "9px",
  },

  h2: {
    fontSize: "1rem",

    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
    },
  },
});

export const UploadFolderHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",

  h4: {
    color: "#4B465C",
    fontSize: "14px",
    fontWeight: "bold",
  },

  button: {
    cursor: "pointer",
    fontSize: "13px",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    padding: "6px 8px",
    borderRadius: "5px",
    transition: "0.3s all",
  },
});

export const UploadFolderCancelButton = styled("button")({
  color: "#4B465C",
  fontSize: "2rem",
  "&:focus": {
    backgroundColor: "#F0F0F0",
  },
});

export const UploadFolderAddMoreButton = styled("button")({
  color: "#17766B",
  "&:focus": {
    backgroundColor: "#C7E3E0",
  },
});

export const UploadFolderBody = styled("div")<{
  isDrag: boolean;
}>(({ isDrag }) => ({
  padding: "20px",
  // height: "350px",
  textAlign: "center",
  minHeight: "100%",
  overflowX: "hidden",
  overflowY: "auto",
  ...(isDrag && {
    border: "2px dashed #0087F7",
    textAlign: "center",

    "&*": {
      display: "none",
    },
  }),
}));

export const UploadFolderBorderDashed = styled("div")({
  border: "2px dashed #17766B",
  padding: "20px",
  borderRadius: "5px",
  cursor: "pointer",
  outline: "none",
  display: "flex",
  justifyContent: "center",

  [theme.breakpoints.down("md")]: {
    padding: "1rem",
  },

  h4: {
    margin: "10px 0",
    fontSize: "1rem",
    width: "100%",
    fontWeight: "500",

    [theme.breakpoints.down("md")]: {
      fontSize: "0.9rem",
    },

    [theme.breakpoints.down("sm")]: {
      fontSize: "0.7rem",
    },
  },
});

export const UploadFolderNameContainer = styled("div")({
  marginTop: "12px",

  h4: {
    fontSize: "0.8rem",
  },
});

export const UploadFolderContainerGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr repeat(3, 1fr)",
  gap: "0.5rem",

  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "1fr repeat(3, 1fr)",
  },

  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr repeat(2, 1fr)",
  },

  [theme.breakpoints.down(660)]: {
    gridTemplateColumns: "1fr 1fr",
  },
});

export const UploadFolderGridWrapper = styled("div")({});

// Folder list
export const UploadFolderContainerList = styled("div")({
  padding: "7px 12px",
});
export const UploadFolderListBoxLeft = styled("div")({
  display: "flex",
  alignItems: "center",
});

export const UploadFolderListFlex = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const UploadFolderListProgress = styled("div")({
  position: "relative",
  marginRight: "5px",

  ".folder-list": {
    width: 50,
    height: 50,
    objectFit: "cover",
  },
});

export const UploadFolderListBoxData = styled("div")({
  textAlign: "left",

  h2: {
    fontSize: "11px",
  },
});

export const UploadFolderListBoxRight = styled("div")({
  // display: "flex",
  // alignItems: "center",
  // gap: "1rem",
  position: "relative",
});

export const UploadFolderBackgroundProgress = styled("div")<{
  progress: number;
}>(({ progress }) => ({
  position: "relative",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "150px",
  // flexDirection: "column",
  zIndex: 1,

  ":after": {
    content: "''",
    backgroundColor: progress > 99 ? "rgb(0, 0, 0, 0.5)" : "#f2f2f2",
    bottom: 0,
    borderRadius: "10px",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: progress > 99 ? 1 : -1,

    ">*": {
      position: "relative",
      // zIndex: progress > 99 ? 1 : -1,
    },
  },
}));

export const UploadFolderRemoveFolder = styled("div")({
  cursor: "pointer",
  position: "absolute",
  top: 7,
  right: 7,
  color: "#5C5C5C",
});

export const UploadFolderRemoveFolderList = styled("div")({
  cursor: "pointer",
});

export const UploadFolderProgressContainer = styled("div")({
  marginTop: "10px",
  border: "1px solid #eee",
  borderRadius: "2px",
  backgroundColor: "#fff",
});

export const UploadFolderAllProgress = styled("div")<{
  progress: number;
  isFailed: boolean;
}>(({ progress, isFailed }) => ({
  height: "3px",
  backgroundColor: isFailed ? "#FF0001" : "#17766B",
  width: (progress || 0) + "%",
}));

export const UploadFolderProgressBody = styled("div")({
  padding: "10px 15px",
});

export const UploadFolderBottomProgress = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const UploadFolderBoxLeftProgress = styled("div")({
  display: "flex",
  alignItems: "center",
});

export const UploadFolderMiniProgress = styled("div")({
  marginRight: "12px",
});

export const UploadFolderContentData = styled("div")({
  h2: {
    fontSize: "10px",
  },
});

export const UploadFolderCancelAll = styled("div")({
  cursor: "pointer",
  color: "#5C5C5C",
});

export const ButtonActionBody = styled("div")({
  marginTop: "1.5rem",
  // padding: "1.6rem",
});

export const ButtonActionContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "1rem",

  button: {
    fontSize: "0.8rem",
    borderRadius: "5px",
    padding: "8px 18px",
    border: "none",
    outline: "none",
    cursor: "pointer",
  },
});

export const ButtonCancelAction = styled("button")({
  backgroundColor: "#E5E6E7",
  color: "#4B465C",

  "&:hover": {
    backgroundColor: "#cecece",
  },

  "&:disabled": {
    backgroundColor: "#ddd",
    cursor: "default",
  },
});

export const ButtonUploadAction = styled("button")({
  backgroundColor: "#17766B",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#10524a",
  },
});

// ========== Files ============= //
export const UploadFilesContainer = styled("div")({
  maxWidth: "992px",
  margin: "0 auto",
});
