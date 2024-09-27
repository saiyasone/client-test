import { createTheme, styled } from "@mui/material/styles";

const theme = createTheme();

export const ExtendContainer = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("lg")]: {
    paddingLeft: "30px",
    paddingRight: "30px",
  },
  [theme.breakpoints.down("sm")]: {
    paddingLeft: "10px",
    paddingRight: "10px",
  },
}));

export const ExtendList = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "25px",
});

export const ExtendItem = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "8px",
});

export const TitleAndSwitch = styled("div")({
  display: "flex",
  height: "50px",
  alignItems: "center",
  justifyContent: "space-between",
});

export const ListButtonRecent = styled("div")({
  display: "flex",
  marginTop: "20px",
  color: "black",
});

export const ExtendTotalItemContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const AlertTittle = styled("div")(() => ({
  width: "100%",
  height: "30px",
  fontSize: "12px",
  marginTop: "40px",
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: "10px 20px",
  },
}));
