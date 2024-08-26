import { Box, Card, CardActions, CardContent, IconButton } from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";
const theme = createTheme();
export const CustomizeTheme2 = createTheme({
  breakpoints: {
    values: {
      // account info
      width1027: 1027,
      width960: 960,

      // for show folder
      width533: 533,

      // for mobile size
      width345: 345,
      width316: 316,
      sm: 600,
      xs: 300,
    },
  },
});

// media cards
export const DivMediaCard = styled("div")(({ theme }) => ({
  minWidth: "100px",
  width: "240px",
  marginBottom: "1px",
  borderRadius: "10px",
  [theme.breakpoints.down("sm")]: {
    width: "auto",
    borderRadius: "0.5rem",
    // width: "160px",
  },
  [theme.breakpoints.down(345)]: {
    width: "145px",
  },
  [theme.breakpoints.down(316)]: {
    width: "100%",
    marginBottom: "0.2rem",
  },
}));

export const MediaCardContent = styled(CardContent)(({ theme }) => ({
  h6: {
    fontSize: "12px",
    fontWeight: "400",
  },
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 0.5rem",
    width: "100%",
    h5: {
      display: "none",
    },
    h6: {
      display: "none",
    },
  },
}));

export const DivIconButton = styled(IconButton)(({ theme }) => ({
  [theme.breakpoints.between(360, 460)]: {
    display: "none",
  },
}));

export const MediaCardAction = styled(CardActions)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  [theme.breakpoints.between(360, 460)]: {
    justifyContent: "center",
  },
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

// folders
export const FolderMobileIcon = styled("div")({
  display: "none",
  [theme.breakpoints.down("sm")]: {
    display: "block",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
export const MobileFolder = styled("div")(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("sm")]: {
    minWidth: "100px",
    display: "block",
    backgroundColor: "#fff",
    borderRadius: "6px",
    fontSize: "12px",
  },
  [theme.breakpoints.down("xs")]: {
    minWidth: "80px",
    display: "block",
    backgroundColor: "#fff",
    borderRadius: "6px",
  },
}));

export const MobileFolderHeard = styled("div")({
  display: "none",
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0px 5px",
    padding: "0",
  },
});

export const FolderCardContent = styled(CardContent)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    padding: "0",
  },
});

// account status cards
export const AccountStatusCard = styled(Card)(({ theme }) => ({
  width: "22rem",
  background: "#EEF7F6",
  border: "2px solid #C8E5E1",
  padding: "0.5rem 0",
  marginBottom: "1rem",
  [theme.breakpoints.between(960, 1027)]: {
    width: "20rem",
  },
  [theme.breakpoints.down("sm")]: {
    width: "12rem",
    padding: "0",
  },
  [theme.breakpoints.down(408)]: {
    width: "100%",
  },
}));

export const AccountStatusCardContent = styled(CardContent)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    padding: "0.5rem",
  },
  h3: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "12px",
      fontWeight: "800",
      margin: "0",
    },
  },
  h6: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "12px",
      fontWeight: "500",
      margin: "0",
    },
  },
}));
export const MyclouldIcon = styled(Box)({
  fontSize: "24px",
  width: "40px",
  height: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "50%",
  backgroundColor: "#e3f2fd",
  color: "#10b981",
  marginBottom: "10px",
});
export const CardFolder = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
});
export const TextIcons = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  padding: "5px 15px",
  alignItems: "center",
});
