//mui component and style
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { styled as muiStyled } from "@mui/system";

const FileCardContainerStyled = muiStyled("div")({
  WebkitTapHighlightColor: "transparent",
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  KhtmlUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
});

export default function FileCardContainer({ ...props }) {
  return (
    <FileCardContainerStyled>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, sm: 3, lg: 5 }}>
          {props.children}
        </Grid>
      </Box>
    </FileCardContainerStyled>
  );
}
