import { styled } from "@mui/material/styles";

export const TrashFilesContainer = styled("div")(({ theme }) => ({
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

export const TrashFilesList = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "25px",
  marginTop: "20px",
});

export const TrashFilesItem = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: "8px",
});

export const TitleAndSwitch = styled("div")({
  display: "flex",
  height: "50px",
  alignItems: "center",
  justifyContent: "space-between",
  ".title": {
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
});

export const ListButtonTrash = styled("div")({
  display: "flex",
  marginTop: "20px",
  color: "black",
});

export const AlertTittle = styled("div")(({ theme }) => ({
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

export const TrashIsEmptyContainer = styled("div")({
  flexGrow: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
