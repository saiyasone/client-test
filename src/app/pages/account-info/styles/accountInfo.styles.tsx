import { Box, Button, Container, Paper } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { createTheme, styled } from "@mui/material/styles";
const theme = createTheme();

export const PaperGlobal = styled(Paper)({
  padding: "1.5rem",
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
});

// account setting css
export const BoxAccountSetting = styled(Container)({});

export const BoxShowTabs = styled(Box)({
  [theme.breakpoints.between("sm", "lg")]: {
    padding: "0 1.5rem",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "scroll",
  },
});

export const ButtonTab = styled(Button)({
  margin: "0 2rem 0 0",
  padding: "0.5rem 1.5rem",
  fontSize: "1rem",
  "&:hover": {
    color: "#ffffff",
    background: "#17766B",
  },
  [theme.breakpoints.up("sm")]: {
    margin: "0 0.5rem 0 0",
    padding: "0.5rem 1rem",
  },
  [theme.breakpoints.down("sm")]: {
    margin: "1rem 0.5rem 0 0",
    padding: "0.2rem 3rem",
    fontSize: "0.8rem",
  },
});

export const BoxShowTabDetail = styled(Box)({
  margin: "2rem 0",
});

export const BoxShowAccountHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  marginTop: "2rem",
  img: {
    width: "100px",
    height: "100px",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    img: {
      width: "90px",
      height: "90px",
    },
  },
});

export const BoxShowHeaderDetail = styled(Box)({
  display: "flex",
  alignItems: "space-between",
  justifyContent: "space-between",
  flexDirection: "column",
  marginLeft: "2rem",
  h6: {
    color: "#A5A3AE",
    fontSize: "0.8rem",
    marginTop: "1rem",
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: "0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1rem",
    h6: {
      fontWeight: 400,
    },
  },
});

export const BoxShowButtons = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
});

export const ButtonUploadProfile: any = styled(Button)({
  padding: "0.5rem 1rem",
  background: "#17766B",
  color: "#ffffff",
  fontSize: "0.8rem",
  [theme.breakpoints.down("sm")]: {
    padding: "0.3rem 0.5rem",
    fontSize: "0.8rem",
  },
});

export const ButtonReset = styled(Button)({
  padding: "0.5rem 1rem",
  background: "#F1F1F2",
  color: "#A8AAAE",
  fontSize: "0.8rem",
  marginLeft: "1rem",
  [theme.breakpoints.down("sm")]: {
    padding: "0.3rem 0.5rem",
    fontSize: "0.8rem",
  },
});

export const BoxShowUserDetail = styled(Box)({});

export const BoxShowActionButton = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  marginTop: "2rem",
});

// Security css start
export const BoxShowPasswordRequirement = styled(Box)({
  ul: {
    li: {
      fontSize: "0.9rem",
      lineHeight: "1.5rem",
      color: "#5D596C",
    },
  },
});

export const BoxShowActionsButton = styled(Box)({
  margin: "1rem 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
});

export const RowTableRow = styled(TableRow)({});

export const CellTableCell = styled(TableCell)({
  fontSize: "0.9rem",
  fontWeight: "550",
  color: "#5D596C",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    fontWeight: "400",
  },
});

// Invoices css start
export const BoxShowPlanDetail = styled(Box)({
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
});

export const BoxLeftShowPlanDetail = styled(Box)({
  width: "45%",
  display: "flex",
  alignItems: "start",
  justifyContent: "start",
  flexDirection: "column",
  h5: {
    color: "#5D596C",
    fontWeight: "500",
    fontSize: "1rem",
    marginTop: "1rem",
  },
  h6: {
    color: "#5D596C",
    fontWeight: "500",
    fontSize: "0.9rem",
    marginTop: "0.2rem",
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
});

export const BoxRightShowPlanDetail = styled(Box)({
  width: "50%",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
});

export const BoxShowRemainDay = styled(Box)({
  display: "flex",
  flexDirection: "column",
  marginTop: "1.5rem",
  h5: {
    color: "#5D596C",
    fontSize: "1rem",
    fontWeight: "600",
  },
  h6: {
    color: "#5D596C",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginTop: "0.8rem",
  },
});

export const BoxShowPaymentHistoryHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "1.5rem",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
});

export const BoxShowLeftPaymentHistory = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  width: "30%",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  [theme.breakpoints.between("sm", "md")]: {
    width: "40%",
  },
  [theme.breakpoints.between("md", "xl")]: {
    width: "45%",
  },
});

export const BoxShowRightPaymentHistory = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "30%",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginTop: "1rem",
  },
  [theme.breakpoints.between("sm", "md")]: {
    width: "45%",
  },
  [theme.breakpoints.between("md", "xl")]: {
    width: "50%",
  },
});

// API access

export const BoxShowServerDetail = styled(Box)({
  padding: "1rem",
  background: "#F8F8F8",
  borderRadius: "6px",
  margin: "1.2rem 0",
});

export const BoxShowServerHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const BoxShowCopyKey = styled(Box)({
  width: "100%",
  display: "flex",
  alignItems: "center",
  padding: "0.5rem 1rem 0.5rem 0",
  borderRadius: "5px",
  marginTop: "0.5rem",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
});
