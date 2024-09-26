import { Box, Paper, createTheme, styled } from "@mui/material";
const theme = createTheme();

export const PaperGlobal = styled(Paper)({
  padding: "2rem",
  marginTop: "2rem",
  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: "1rem 0.5rem",
  },
});

export const FiledropContainer = styled(Box)({
  textAlign: "center",
  "& .MuiDialogActions-root": {
    display: "none",
  },
});

export const GenerateLinkArea = styled(Box)({
  margin: "2rem 0 1rem 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  h6: {
    margin: "1rem 0",
  },
});

export const ShowFileDropArea = styled(Box)({
  border: "1px solid green",
});

export const ShowSelectDataTime = styled(Box)({
  border: "1px solid #E2E1E5",
  width: "50%",
  marginLeft: "25%",
  marginTop: "1rem",
});

export const ShowHeaderDetail = styled(Box)({
  display: "flex",
  textAlign: "start",
  justifyContent: "start",
  flexDirection: "column",
  marginBottom: '1rem',
  h3: {
    color: "#4B465C",
    fontSize: "0.9rem",
    padding: "0",
    margin: "0.2rem 0 0 0",
  },
  h6: {
    color: "#4B465C",
    fontSize: "0.8rem",
    padding: "0",
    margin: "0.2rem 0 0 0",
  },
});
