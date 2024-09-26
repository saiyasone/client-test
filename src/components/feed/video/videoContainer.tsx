import {
  Avatar,
  Box,
  CardMedia,
  Paper,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { IDataItemsTypes } from "types/feed/vdoType";
import MainLike from "./mainLike";

const VideoCardContainer = styled("div")(() => ({
  position: "relative",
  minHeight: "200px",
  maxHeight: "580px",
  overflow: "hidden",
  width: "400px",
  padding: "2rem 0 8rem",
  margin: "2px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "white",
  marginBottom: "5rem",
}));

const ChannelContainer = styled(Box)(() => ({
  position: "absolute",
  bottom: 10, // Adjust as needed
  left: 0, // Adjust as needed
  padding: "8px",
  borderRadius: "8px",
  color: "white",
}));

const ChannelCard = styled(Box)(() => ({
  padding: "2px 5px",
  display: "flex",
  alignItems: "center",
  gap: 8,
}));

const ChannelAvatar = styled(Box)(() => ({
  position: "relative",
  cursor: "pointer",
}));
const ChannelFollowIcon = styled("div")(() => ({
  position: "absolute",
  bottom: -8,
  left: 16,
  cursor: "pointer",
}));
const DescriptionTitle = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  color: "white",
}));
const MusicContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: "rgba(0, 0, 0, 0.28)",
  width: "50%",
  marginLeft: "6px",
  borderRadius: "10px",
}));

interface IVdeoTypeProps {
  data: IDataItemsTypes[];
}
export default function VideoContainer({ data }: IVdeoTypeProps) {
  const theme = useTheme();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const textRef = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Start muted
      videoRef.current.play(); // Auto-play
    }
  }, []);

  const handleProgressChange = (event: any, newValue: any) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
    }
  };

  React.useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const current = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        setProgress((current / duration) * 100);
      }
    };

    const videoElement = videoRef.current;
    videoElement?.addEventListener("timeupdate", updateProgress);

    return () => {
      videoElement?.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  return (
    <>
      <Box sx={{ py: 2 }}>
        <Paper>
          {data?.map((data, index: number) => {
            return (
              <Box sx={{display:"flex",gap:5}}>
                <VideoCardContainer key={index}>
                  <CardMedia
                    ref={videoRef}
                    component="video"
                    onClick={togglePlay}
                    onMouseEnter={() => setIsHovered(true)} // Set hover state to true
                    onMouseLeave={() => setIsHovered(false)}
                    sx={{
                      borderRadius: "8px",
                      objectFit: "fill",
                    }}
                    src={data.option.video.source.preview_url}
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
                            alt={data?.chanel?.name}
                            src="/static/images/avatar/1.jpg"
                          />
                          <ChannelFollowIcon>
                            <FaCirclePlus
                              size={20}
                              color="white"
                              fill="#17766B"
                            />
                          </ChannelFollowIcon>
                        </ChannelAvatar>
                      </Box>
                      <Box>
                        <Typography component="p" sx={{ fontSize: "20px" }}>
                          {data?.chanel.name}
                        </Typography>
                        <Typography
                          component="p"
                          sx={{
                            fontSize: "16px",
                            color: theme.palette.grey[100],
                          }}
                        >
                          {data?.option.tag}
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
                          id={data?.option.title}
                          ref={textRef}
                          component="p"
                          sx={{
                            fontSize: "16px",
                            color: "white",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            WebkitLineClamp: isExpanded ? "none" : 2,
                            textOverflow: "ellipsis",
                            lineHeight: "1.2em",
                            maxHeight: isExpanded ? "none" : "2.4em",
                          }}
                        >
                          {data?.option.title}
                        </Typography>
                        {isOverflowing && !isExpanded && (
                          <Typography
                            component="p"
                            sx={{
                              border: "none",
                              cursor: "pointer",
                              mt: 1,
                              position: "absolute",
                              bottom: 1,
                              right: 20,
                              color: "lightblue",
                            }}
                          >
                            Show More
                          </Typography>
                        )}
                        {isExpanded && (
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
                        )}
                      </Box>
                    </DescriptionTitle>
                    <MusicContainer>
                      <Typography component="p" sx={{ px: 2 }}>
                        Less
                      </Typography>
                    </MusicContainer>
                  </ChannelContainer>
                </VideoCardContainer>
                <MainLike />
              </Box>
            );
          })}
        </Paper>
      </Box>
    </>
  );
}
