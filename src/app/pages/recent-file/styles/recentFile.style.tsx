import { createTheme, styled } from "@mui/material/styles";

const theme = createTheme();

export const RecentFilesContainer = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  [theme.breakpoints.down("lg")]: {
    paddingLeft: "30px",
    paddingRight: "30px",
  },
  [theme.breakpoints.down("sm")]: {
    paddingLeft: "10px",
    paddingRight: "10px",
  },
}));

export const RecentFilesList = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "25px",
  marginTop: "20px",
});

export const RecentFilesItem = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "8px",
});

export const TitleAndSwitch = styled("div")({
  display: "flex",
  height: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "space-between",
});

export const ListButtonRecent = styled("div")({
  display: "flex",
  marginTop: "20px",
  color: "black",
});

export const AlertTittle = styled("div")(() => ({
  width: "100%",
  height: "30px",
  fontSize: "12px",
  marginTop: "40px",
  display: "flex",
  alignItems: "center",
  // paddingLeft: "20px",
  [theme.breakpoints.down("sm")]: {
    padding: "10px 20px",
  },
}));
