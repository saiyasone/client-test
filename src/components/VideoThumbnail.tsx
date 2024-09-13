import React, { useRef, useState, useEffect } from "react";
import Loader from "./Loader";

interface VideoThumbnailProps {
  videoSrc: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const captureThumbnail = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/png");
        setThumbnail(dataUrl);
      }
    }
  };

  const handleLoadedData = () => {
    if (videoRef.current) {
      const video = videoRef.current;

      video.currentTime = 2;
      video.pause();

      video.addEventListener("seeked", captureThumbnail, { once: true });
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadeddata", handleLoadedData);
    }

    return () => {
      if (videoRef!.current) {
        videoRef!.current.removeEventListener("loadeddata", handleLoadedData);
      }
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ display: "none" }}
        crossOrigin="anonymous"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {thumbnail ? (
        <img
          src={thumbnail}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          alt="Video Thumbnail"
        />
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default VideoThumbnail;
