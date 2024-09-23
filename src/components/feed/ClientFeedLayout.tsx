import styled from "@emotion/styled";
import { useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useLazyQuery } from "@apollo/client";
import { Box, CssBaseline, Paper as MuiPaper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { spacing } from "@mui/system";
import { QUERY_SETTING } from "api/graphql/setting.graphql";
import Sidebar from "components/client-dashboard/sidebar/Sidebar";
import navItems from "constants/navItem.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import GlobalStyle from "styles/GlobalStyle";
import Navbar from "./nav/navbar";

const drawerWidth = 300;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Drawer = styled.div`
  ${(props: any) => props.theme.breakpoints.up("md")} {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
  background-color: ${(props: any) => {
    return props.theme.sidebar.header.background;
  }};
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

const Paper = styled(MuiPaper)(spacing);

const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props: any) => props.theme.palette.background.default};

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }

  .MuiPaper-root .MuiPaper-root {
    box-shadow: none;
  }
`;


const ClientFeedLayout = () => {
  const router = useLocation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      <Drawer>
        <Box sx={{ display: { xs: "block", lg: "none" } }}>
          <Sidebar
            PaperProps={{ style: { width: drawerWidth } }}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            items={navItems}
          />
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Sidebar
            PaperProps={{ style: { width: drawerWidth } }}
            items={navItems}
          />
        </Box>
      </Drawer>
      <AppContent>
        <Navbar />
        <Paper sx={{ height: "100%" }}>
          <Box
            sx={{
              margin: "0 auto", 
              [theme.breakpoints.up("md")]: {
                maxWidth: "900px", 
              },
              [theme.breakpoints.up("lg")]: {
                padding: "0px 30px 30px 30px", 
              },
            }}
          >
            <Outlet />
          </Box>
        </Paper>
      </AppContent>
    </Root>
  );
};

export default ClientFeedLayout;
