import { Box, styled } from "@mui/material";
import { AiFillAlert, AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const WrapButton = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
}));
const WrapButtonContainer = styled("div")(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.28)",
  height: "50px",
  width: "50px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

export default function MainLike() {
  return (
    <>
      <Box sx={{ bgcolor: "gray", position: "relative" }}>
        <Box sx={{ position: "absolute", top: "50%" }}>
          <WrapButtonContainer>
            <WrapButton>
              {true ? (
                <AiFillHeart color="#ff2626" size="20" />
              ) : (
                <AiOutlineHeart className="animate-spin" size="20" />
              )}
            </WrapButton>
          </WrapButtonContainer>
          <WrapButtonContainer>
            <WrapButton>
              {true ? (
                <AiFillHeart color="#ff2626" size="20" />
              ) : (
                <AiOutlineHeart className="animate-spin" size="20" />
              )}
            </WrapButton>
          </WrapButtonContainer>
        </Box>
      </Box>
    </>
  );
}
