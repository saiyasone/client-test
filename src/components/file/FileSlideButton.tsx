import { Box, Button, useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const SlideButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  height: "40px",
  minWidth: "40px",
  borderRadius: "100%",
  backgroundColor: theme.palette.grey[900],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
  },
}));
const LeftButton = styled(SlideButton)(({ theme }) => ({
  left: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    left: theme.spacing(1),
  },
}));
const RightButton = styled(SlideButton)(({ theme }) => ({
  right: theme.spacing(5),
  [theme.breakpoints.down("sm")]: {
    right: theme.spacing(1),
  },
}));
const MobileSlideButton = styled(Box)(() => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  height: "20px",
  minWidth: "20px",
  borderRadius: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const LeftMobileButton = styled(MobileSlideButton)(({ theme }) => ({
  left: theme.spacing(1),
}));

const RighMobiletButton = styled(MobileSlideButton)(({ theme }) => ({
  right: theme.spacing(1),
}));

type FileButtonEventsTypes = {
  handlePrevView: () => void;
  handleNextView: () => void;
};
export default function FileSlideButton({
  handlePrevView,
  handleNextView,
}: FileButtonEventsTypes) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <>
      <Box>
        {isMobile ? (
          <Box>
            <LeftMobileButton onClick={handlePrevView}>
              <GrFormPrevious
                style={{
                  fontSize: 22,
                  color: theme.palette.grey[300],
                  backgroundColor: "rgba(96, 96, 96, 0.7)",
                  borderRadius: "10px",
                }}
                onClick={handlePrevView}
              />
            </LeftMobileButton>
            <RighMobiletButton onClick={handleNextView}>
              <GrFormNext
                style={{
                  fontSize: 22,
                  color: theme.palette.grey[300],
                  backgroundColor: "rgba(96, 96, 96, 0.7)",
                  borderRadius: "10px",
                }}
                onClick={handleNextView}
              />
            </RighMobiletButton>
          </Box>
        ) : (
          <Box>
            <LeftButton onClick={handlePrevView}>
              <GrFormPrevious style={{ fontSize: 20, color: "#ffffff" }} />
            </LeftButton>
            <RightButton onClick={handleNextView}>
              <GrFormNext style={{ fontSize: 20, color: "#ffffff" }} />
            </RightButton>
          </Box>
        )}
      </Box>
    </>
  );
}
