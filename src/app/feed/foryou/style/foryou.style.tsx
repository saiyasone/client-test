import { Box, Container } from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";
const theme = createTheme();

export const ContainerForyou= styled(Container)({
  display: "flex",
  alignItems:'center',
  flexDirection: "column",
  height: "100%",
  padding: "2rem",
  h3: {
    margin: "1rem 0",
    color: "#5D596C",
  },
  h1: {
    textAlign: "center",
    color: "#5D596C",
  },
  h4: {
    textAlign: "center",
    color: "#5D596C",
    margin: "0.5rem 0",
  },
  h6: {
    color: "#5D596C",
    fontWeight: "600",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0 0.2rem",
    h1: {
      fontSize: "1.3rem",
    },
    h3: {
      fontSize: "1rem",
      padding: "0 1rem",
    },
    h4: {
      fontSize: "0.8rem",
    },
    h6: {
      fontSize: "0.8rem",
    },
  },
});

  export const VideoZone = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    padding: "2rem",
    marginTop: "2rem",
    // boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
    border: '1px solid #dedede',
    [theme.breakpoints.down("sm")]: {
      padding: "1rem 0.5rem",
    },
  });