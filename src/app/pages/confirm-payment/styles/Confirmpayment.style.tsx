import { createTheme, styled } from "@mui/material";

const theme = createTheme();

export const ConfirmPaymentContainer = styled("div")({
  width: "100%",
});

export const HeaderContainer = styled("div")({
  backgroundColor: "#00C771",
  padding: "2rem 1rem",
});

export const HeaderContainerWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const HeaderCircleContainer = styled("div")({
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
});

export const ConfirmImage = styled("img")({
  width: "50px",
  height: "50px",
  objectFit: "cover",

  [theme.breakpoints.down("md")]: {
    width: "45px",
    height: "45px",
  },
});

export const BodyContainer = styled("div")({
  padding: "2rem 1rem",
  textAlign: "center",
  // backgroundColor: "#f3f5f6",

  h2: {
    fontSize: "2.2rem",
    color: "#00C771",

    [theme.breakpoints.down("md")]: {
      fontSize: "1.8rem",
    },

    [theme.breakpoints.down("sm")]: {
      fontSize: "1.5rem",
    },
  },
});

export const BodyContainerWrap = styled("div")({
  maxWidth: "450px",
  margin: "0 auto",
});

export const BodyInline = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "1rem 0",

  img: {
    width: "25px",
    height: "25px",
    objectFit: "cover",

    [theme.breakpoints.down("md")]: {
      width: "20px",
      height: "20px",
    },
  },

  p: {
    fontSize: "1rem",
    marginLeft: "10px",
    fontWeight: "bold",
    color: "#454554",

    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
    },
  },
});

export const BodyBox = styled("div")({
  span: {
    fontSize: "1rem",
    color: "#454554",
    fontWeight: "400",

    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
    },
  },
});

export const BodyAction = styled("div")({
  marginTop: "2rem",
});

export const ActionButton = styled("button")({
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer",
  outline: "none",
  padding: "12px 24px",
  fontSize: "0.9rem",
  textDecoration: "none",
  backgroundColor: "#00C771",
  fontWeight: "500",
  transition: "3s all",

  "&:hover": {
    backgroundColor: "#00A95B",
  },

  [theme.breakpoints.down("md")]: {
    padding: "9px 22px",
  },
});
