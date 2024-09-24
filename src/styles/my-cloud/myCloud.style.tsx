import { TableCell } from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";

export const CustomizeTheme1 = createTheme({
  breakpoints: {
    values: {
      width600: 600,
      width788: 788,
      width360: 345,
      sm: 600,
    },
  },
});
export const DivCards = styled("div")(({ theme }) => ({
  marginTop: "2rem",

  [theme.breakpoints.down("sm")]: {},
  [theme.breakpoints.between(600, 788)]: {},
}));

export const DivCloud = styled("div")(({ theme }) => ({
  marginBottom: "1rem",
  height: "100%",
  [theme.breakpoints.down("lg")]: {
    paddingLeft: "30px",
    paddingRight: "30px",
  },
  [theme.breakpoints.down("sm")]: {
    paddingLeft: "10px",
    paddingRight: "10px",
  },
}));

export const DivFolders = styled("div")({
  margin: "2rem 0 0 0",
});

export const DivShowFolder = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))",
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
}));

export const DivFolderHeader = styled("div")({
  fontSize: "16px",
  fontWeight: "600",
  color: "#797979",
  margin: "0",
});

export const DivRecentFile = styled("div")({});

export const DivRecentFileHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const TDTableCell = styled(TableCell)(({ theme }) => ({
  width: "auto",
  fontWeight: "500",
  fontSize: "16px",
  color: "#797979",

  [theme.breakpoints.between(360, 460)]: {
    fontSize: "12px",
    border: "1px solid blue",
  },
}));

export const SearchDashboard = styled("div")(({ theme }) => ({
  marginBottom: "1rem",
  height: "100%",
  marginTop: "2rem",
  [theme.breakpoints.down("lg")]: {
    margin: "0 10px",
    padding: "0 10px",
  },
}));
