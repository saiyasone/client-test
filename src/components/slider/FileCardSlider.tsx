import { Box } from "@mui/material";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import CardHeadMobile from "./CardHeadMobile";
import cardNumber from "./cardNumber";
import { useEffect, useRef } from "react";

function FileCardSlider({ ...props }) {
  const applicationRef = useRef<number>(0);
  const imageRef = useRef<number>(0);
  const videoRef = useRef<number>(0);
  const audioRef = useRef<number>(0);
  const textRef = useRef<number>(0);
  const otherRef = useRef<number>(0);

  useEffect(() => {
    for (
      let i = 0;
      i < props?.getCount?.getFileCategoryDetails?.data?.length;
      i++
    ) {
      if (
        props?.getCount?.getFileCategoryDetails?.data[i]?.fileType?.split(
          "/",
        )?.[0] === "application"
      ) {
        applicationRef.current =
          props?.getCount?.getFileCategoryDetails?.data[i]?.size;
      } else if (
        props?.getCount?.getFileCategoryDetails?.data[i]?.fileType?.split(
          "/",
        )?.[0] === "image"
      ) {
        imageRef.current =
          props?.getCount?.getFileCategoryDetails?.data[i]?.size;
      } else if (
        props?.getCount?.getFileCategoryDetails?.data[i]?.fileType?.split(
          "/",
        )?.[0] === "video"
      ) {
        videoRef.current =
          props?.getCount?.getFileCategoryDetails?.data[i]?.size;
      } else if (
        props?.getCount?.getFileCategoryDetails?.data[i]?.fileType?.split(
          "/",
        )?.[0] === "audio"
      ) {
        audioRef.current =
          props?.getCount?.getFileCategoryDetails?.data[i]?.size;
      } else if (
        props?.getCount?.getFileCategoryDetails?.data[i]?.fileType?.split(
          "/",
        )?.[0] === "text"
      ) {
        textRef.current =
          props?.getCount?.getFileCategoryDetails?.data[i]?.size;
      } else if (
        props?.getCount?.getFileCategoryDetails?.data[i]?.fileType?.split(
          "/",
        )?.[0] === "" ||
        null
      ) {
        otherRef.current =
          props?.getCount?.getFileCategoryDetails?.data[i]?.size;
      }
    }
  }, [props?.getCount?.getFileCategoryDetails?.data]);

  const objV1 = {
    application: applicationRef.current,
    image: imageRef.current,
    video: videoRef.current,
    audio: audioRef.current,
    text: textRef.current,
    other: otherRef.current,
  };

  return (
    <div>
      <Box>
        <Swiper spaceBetween={5} slidesPerView={3}>
          {cardNumber.map((card, index) => (
            <SwiperSlide key={index}>
              <CardHeadMobile
                data={objV1}
                icon={card.icon}
                title={card.title}
                type={card.type}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </div>
  );
}

export default FileCardSlider;
