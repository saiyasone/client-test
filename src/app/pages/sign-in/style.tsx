import { Box, Button, Container, Paper } from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";
const theme = createTheme();

// Admin back office css start
export const BoxShowLoginLayout = styled(Box)({
  maxWidth: "500px",
  margin: "0 auto",
  width: "100%",
  height: "90vh",
  marginTop: "2.5rem",
  display: "flex",
  textAlign: "center",
  justifyContent: "center",
  flexDirection: "column",
});

export const BoxShowLoginInside = styled(Box)({
  position: "relative",
  zIndex: 1001,
});

export const LoginContainer = styled(Container)({
  position: "relative",
  // padding: "4rem",
  paddingBottom: "3rem",
  borderRadius: "15px",
  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  backgroundColor: "#fff",
  h3: {
    color: "#5D596C",
    fontSize: "1.5rem",
    margin: "0.2rem 0",
  },
  h6: {
    color: "#6F6B7D",
    fontSize: "1rem",
    margin: "0.2rem 0",
  },
  [theme.breakpoints.down("sm")]: {
    boxShadow: "none",
    h3: {
      width: "100%",
    },
    h6: {
      fontSize: "0.8rem",
    },
  },
});

export const BoxRectangleTop = styled(Box)({
  position: "absolute",
  top: "-25px",
  left: "-40px",
  width: "125px",
  height: "125px",
  backgroundColor: "#E5EDEE",
  borderRadius: "8px",
  zIndex: -99,
  backgroundRepeat: "no-repeat",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
});

export const BoxRectangleTop1 = styled(Box)({
  position: "absolute",
  top: "-40px",
  left: "40px",
  width: "100px",
  height: "100px",
  backgroundColor: "transparent",
  borderRadius: "16px",
  zIndex: -99,
  border: "1px solid #ddd",
  backgroundRepeat: "no-repeat",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
});

export const BoxRectangleBottom = styled(Box)({
  position: "absolute",
  bottom: "-50px",
  right: "-45px",
  width: "100px",
  height: "90px",
  backgroundColor: "transparent",
  borderRadius: "8px",
  zIndex: -999,
  border: "3px dashed #E3DFF8",
  padding: "1rem",
  backgroundRepeat: "no-repeat",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
});

export const BoxRectangleBottomInside = styled(Box)({
  position: "relative",
  zIndex: 999,
  backgroundColor: "#E5EDEE",
  borderRadius: "8px",
  width: "100%",
  height: "100%",
  backgroundRepeat: "no-repeat",
});

// client back office css start
export const MainBox = styled(Box)({
  width: "100%",
  display: "flex",
  flex: "1 1 0%",
  justifyContent: "space-between",
});

export const LeftBox = styled(Box)({
  width: "50%",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
});

export const LeftBoxRow1 = styled(Box)({
  img: {
    width: "40%",
  },
  [theme.breakpoints.down("md")]: {
    textAlign: "center",
    img: {
      width: "60%",
    },
  },
  [theme.breakpoints.between("sm", "md")]: {
    textAlign: "center",
    img: {
      width: "80%",
    },
  },
});

export const LeftBoxRowAuthenticationLimit = styled(Box)({
  padding: "1rem 0",
  textAlign: "center",

  h2: {
    fontSize: "1rem",
    marginBottom: "0.8rem",
  },

  h4: {
    fontSize: "0.9rem",
  },

  "h2, h4": {
    color: "#d33",
  },
});

export const BoxShowSocialMediaLogin = styled(Box)({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: {
    margin: "1rem 2rem 0.5rem 2rem",
  },
});

export const BoxShowFormik = styled(Box)({
  width: "80%",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    padding: "0 0.5rem",
  },
});

export const LeftBoxRow2 = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  paddingTop: "3rem",
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    marginTop: "0",
    paddingTop: "1rem",
  },
  [theme.breakpoints.between("sm", "md")]: {
    marginTop: "0",
  },
});

export const RightBox = styled(Box)({
  color: "#ffffff",
  background:
    "linear-gradient(90deg, rgba(22,209,187,1) 0%, rgba(23,118,107,1) 100%)",
  width: "50%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  [theme.breakpoints.down(900)]: {
    display: "none",
  },
  [theme.breakpoints.between("sm", "md")]: {
    justifyContent: "start",
    paddingTop: "15rem",
  },

  h2: {
    fontSize: "3.5rem",
    fontWeight: 700,

    [theme.breakpoints.down(980)]: {
      fontSize: "2.8rem",
    },
  },
});

export const BoxShowDetail = styled(Box)({
  margin: "2rem 0",
  textAlign: "center",
  h4: {
    fontSize: "1.5rem",
    lineHeight: "2",
    fontWeight: 500,

    [theme.breakpoints.down(980)]: {
      fontSize: "1rem",
    },
  },
});

export const ButtonGetStarted = styled(Button)({
  border: "1px solid #ffffff",
  color: "#ffffff",
  padding: "0.8rem 5rem",
  borderRadius: "2rem",
  fontSize: "18px",
});

export const ContainerCarousel = styled(Paper)({
  width: "700px",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
});

export const DivCarouselDetail = styled("div")({
  textAlign: "center",
  img: {},
  h1: {
    padding: "0 4rem",
    margin: "1rem 0 5rem 0",
    span: {
      color: "#2F998B",
    },
  },
});
