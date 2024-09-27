import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Button,
  InputBase,
  AppBar as MuiAppBar,
  Paper,
  styled,
  useMediaQuery,
} from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";
import { Fragment } from "react";
const AppBar = styled(MuiAppBar)`
  background: ${(props: any) => props.theme.header.background};
  color: ${(props: any) => props.theme.header.color};
  border-bottom: 1px solid #ececec;
  height: 90px;
`;
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  height: "36px",
  boxShadow: `0px 0px 1px 0px ${theme.palette.grey[800]}`,
  marginRight: theme.spacing(1),
  marginLeft: 0,
  width: "60%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "40%",
  },
}));

const AppBarContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  height: "80px",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    height: "60px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 4),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  right: 0,
  top: 1,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0, 1),
  },
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(2, 1, 1, 0),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      paddingLeft: `calc(1em + ${theme.spacing(2)})`,
      width: "50ch",
    },
  },
}));

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      width642: 642,
      width599: 599,
    },
  },
});
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <>
      <Fragment>
        <AppBar position="sticky" elevation={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 2,
            }}
          >
            <Box
              sx={{
                gridColumn: {
                  xs: "span 12",
                  sm: "span 12",
                  md: "span 3",
                },
              }}
            >
              <Item></Item>
            </Box>
            <Box
              sx={{
                gridColumn: {
                  xs: "span 12",
                  sm: "span 12",
                  md: "span 9",
                },
              }}
            >
              <Item>
                <AppBarContainer>
                  <Search>
                    <StyledInputBase
                      placeholder="Search…"
                      inputProps={{ "aria-label": "search" }}
                    />
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                  </Search>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mr: isMobile ? 0 : 5,
                      gap: isMobile ? 1 : 5,
                    }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: theme.palette.grey[400],
                        color: theme.palette.grey[600],
                        height: isMobile ? "36px" : "38px",
                        "&:hover": {
                          borderColor: theme.palette.grey[400],
                          bgcolor: theme.palette.grey[300],
                        },
                      }}
                    >
                      <AddIcon />
                      {isMobile ? "" : "Post video"}
                    </Button>
                    <Avatar
                      alt="Remy Sharp"
                      src="/static/images/avatar/1.jpg"
                      sx={{ width: 36, height: 36, cursor: "pointer" }}
                    />
                  </Box>
                </AppBarContainer>
              </Item>
            </Box>
          </Box>
        </AppBar>
      </Fragment>
    </>
  );
}
