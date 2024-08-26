import { LoadingButton } from "@mui/lab";
import { Box, Button, Link, createTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
const theme = createTheme();

export const DivLine = styled("div")({
  position: "relative",
  height: "1px",
  width: "100%",
  margin: "20px 0",
  backgroundColor: "#d4d4d4",
  "&::before": {
    content: "'OR'",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    color: "#232836",
    padding: "0 15px",
  },
});

export const divCarouselDetail = styled("div")({
  // border: "1px solid red",
});

export const ButtonLogin = styled(Button)({
  padding: "0.5rem 5rem",
  fontSize: "18px",
  marginTop: "1.5rem",
  borderRadius: "2rem",
  background: "#17766B",
  [theme.breakpoints.down("sm")]: {
    padding: "0.2rem 2rem",
  },
});

export const ButtonLoginAdmin = styled(Button)({
  padding: "0.45rem 5rem",
  fontSize: "15px",
  marginTop: "1.5rem",
  borderRadius: "6px",
  background: "#17766B",
  "&:hover": {
    background: "#17766B !important",
  },
});

export const ButtonRegister = styled(LoadingButton)({
  background: "#17766B",
  padding: "0.8rem 5rem",
  borderRadius: "2rem",
  fontSize: "1rem",
  "&:hover:": {
    background: "#17766B !important",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0.2rem 2rem",
  },
});

export const PasswordBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  marginTop: "1rem",
});

export const PasswordForgetBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const PasswordForget = styled(Link)({
  textDecoration: "none",
  color: "#17766B",
  fontSize: "0.9rem",
  cursor: "pointer",
  fontWeight: "600",
});
