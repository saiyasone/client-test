import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Chip,
  IconButton,
  Paper,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import { FaCirclePlus } from "react-icons/fa6";

const VideoCardContainer = styled("div")(({ theme }) => ({
  padding: "1px",
  width: "70%",
  position: "relative",
}));

const ChannelContainer = styled(Paper)(({ theme }) => ({
  padding: "2px 5px",
  position: "absolute",
  bottom: "10%",
  left: "5%",
  width: "90%",
}));

const ChannelCard = styled(Paper)(({ theme }) => ({
  padding: "2px 5px",
  display: "flex",
  alignItems: "center",
  gap: 8,
}));

const ChannelAvatar = styled(Paper)(({ theme }) => ({
  position: "relative",
  cursor: "pointer",
}));
const ChannelFollowIcon = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: -8,
  left: 16,
  cursor: "pointer",
}));
const DescriptionTitle = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));
const MusicContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: "rgba(0, 0, 0, 0.38)",
  width: "50%",
  marginLeft: "6px",
  borderRadius: "10px",
}));
export default function VideoContainer() {
  const theme = useTheme();
  return (
    <>
      <Box sx={{ py: 2 }}>
        <Paper sx={{ width: 600, bgcolor: "gray" }}>
          <VideoCardContainer>
            <CardMedia
              component="video"
              sx={{ m: 2, borderRadius: "8px", width: 400, height: 600 }}
              src="/static/videos/sample-video.mp4"
              controls
              autoPlay
              muted
              loop
            />
            <ChannelContainer>
              <ChannelCard>
                <Box>
                  <ChannelAvatar>
                    <Avatar
                      sx={{ width: 50, height: 50 }}
                      alt="Remy Sharp"
                      src="/static/images/avatar/1.jpg"
                    />
                    <ChannelFollowIcon>
                      <FaCirclePlus size={20} color="white" fill="#17766B" />
                    </ChannelFollowIcon>
                  </ChannelAvatar>
                </Box>
                <Box>
                  <Typography component="p" sx={{ fontSize: "20px" }}>
                    John song
                  </Typography>
                  <Typography
                    component="p"
                    sx={{ fontSize: "16px", color: theme.palette.grey[600] }}
                  >
                    @John song
                  </Typography>
                </Box>
              </ChannelCard>
              <DescriptionTitle>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Typography
                    component="p"
                    sx={{
                      fontSize: "16px",
                      color: theme.palette.grey[600],
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      // WebkitLineClamp: 2,
                      WebkitLineClamp: false ? "none" : 2,
                    }}
                  >
                    Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit
                    amet consectetur.t amet consectetur.Lorem ipsum dolor sit
                    amet consectetur.
                  </Typography>
                  <Typography
                    component="p"
                    sx={{
                      border: "none",
                      cursor: "pointer",
                      mt: 1,
                      position: "absolute",
                      bottom: 1,
                      right: 20,
                    }}
                  >
                    Less
                  </Typography>
                </Box>
              </DescriptionTitle>
              <MusicContainer>
                <Typography component="p">Less</Typography>
              </MusicContainer>
            </ChannelContainer>
          </VideoCardContainer>
        </Paper>
      </Box>
    </>
  );
}
