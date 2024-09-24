import { Box, Grid } from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";

const theme = createTheme();

export const DivFolder = styled("div")({
  marginTop: "2rem",
  display: "grid",

  gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))",
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
});

export const SwitchPage = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  [theme.breakpoints.down("lg")]: {
    marginRight: "-10px",
  },
});

export const SwitchItem = styled("div")({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",

  h5: {
    fontSize: "16px",
  },
});

export const TitleAndSwitch = styled("div")(({ theme }) => ({
  minHeight: "50px",
  backgroundColor: "#F7F9FC",
  display: "flex",
  justifyContent: "space-between",
  top: "60px",
  position: "sticky",
  margin: "0 -20px",
  padding: "0 10px",
  zIndex: 100,
  [theme.breakpoints.down("lg")]: {
    margin: "0px",
    top: "55px",
    padding: "0 10px",
  },
}));

export const FolderList = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "25px",
  marginTop: "20px",
});

export const TitleAndIcon = styled("div")({
  display: "flex",
  alignItems: "center",
  fontSize: "22px",
  h5: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#4B465C",
  },
});
export const ListButton = styled("div")({
  display: "flex",
  marginTop: "20px",
  color: "black",
});

export const AlertTittle = styled("div")({
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
});

export const TitleDate = styled("div")({
  width: "100%",
  // borderBottom: "1px solid #C0C0C0",
  marginTop: "20px",
  paddingTop: "20px",
});

export const Folder = styled("div")({
  marginTop: "10px",
});
export const FolderTitle = styled("div")({
  backgroundColor: "#F3F3F3",
  position: "absolute",
  bottom: 0,
  left: "50%",
  transform: "translate(-50%,-50%)",
  padding: "8px 20px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  zIndex: 1,
  margin: 0,
});
export const SelelctedItem = styled("div")({
  display: "flex",
  alignItems: "center",
});
export const SelectClose = styled("div")({
  display: "flex",
});

export const SelectActions = styled("div")(({ theme }) => ({
  display: "flex",
  marginLeft: "50px",
  color: "#333",

  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
    marginLeft: "5px",
  },
}));

export const SelectionContainer = styled("div")({
  position: "absolute",
  top: 0,
  left: 5,
});

export const FavoritesContainer = styled("div")({
  position: "absolute",
  left: 5,
  bottom: 5,
});

export const FolderGrid = ({ ...props }) => {
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, sm: 3, lg: 5 }}>
          {props.children}
        </Grid>
      </Box>
    </div>
  );
};
