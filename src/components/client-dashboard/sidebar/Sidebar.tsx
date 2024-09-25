import styled from "@emotion/styled";
import { NavLink, useNavigate } from "react-router-dom";

// components
import vshareLogo from "assets/images/vshare-black-logo.png";
import SidebarNav from "./SidebarNav";

// material ui folder
import {
  Box,
  Button,
  ListItemButton,
  Drawer as MuiDrawer,
  Typography,
} from "@mui/material";
const Drawer: any = styled(MuiDrawer)``;
const Brand: any = styled(ListItemButton)`
  font-size: ${(props: any) => props.theme.typography.h5.fontSize};
  font-weight: ${(props: any) => props.theme.typography.fontWeightMedium};
  color: ${(props: any) => props.theme.sidebar.header.color};
  font-family: ${(props: any) => props.theme.typography.fontFamily};
  min-height: 56px;
  padding-bottom: ${(props: any) => props.theme.spacing(6)};
  padding-top: ${(props: any) => props.theme.spacing(6)};
  padding-left: ${(props: any) => props.theme.spacing(6)};
  padding-right: ${(props: any) => props.theme.spacing(6)};
  justify-content: center;
  cursor: pointer;
  flex-grow: 0;
  ${(props: any) => props.theme.breakpoints.up("sm")} {
    min-height: 64px;
  }
`;
// const Sidebar = ({ items, showFooter = true, ...rest }) => {
const Sidebar = ({ items = true, ...rest }) => {
  const navigate = useNavigate();
  return (
    <Drawer variant="permanent" {...rest}>
      <Brand
        component={NavLink}
        to="/dashboard"
        sx={{ cursor: "pointer", "&:hover": { background: "#ffffff" } }}
      >
        <img src={vshareLogo} alt="v-share logo" width={200} height={50} />
      </Brand>
      <Box sx={{ m: 4 }}>
        <SidebarNav items={items} />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          marginTop: "16%",
        }}
      >
        <Typography variant="h5" sx={{ color: "#5D596C" }}>
          We're launching the beta version
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          color="primaryTheme"
          onClick={() => navigate("/feedback")}
        >
          Your feedback is valued
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
