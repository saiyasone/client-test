import { Box } from "@mui/material";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import CardHeadMobile from "./CardHeadMobile";
import cardNumber from "./cardNumber";
import { useEffect, useRef } from "react";

interface IFilesCategoryTypes {
  fileCategory: any;
  countLoading: boolean;
}
function FileCardSlider({ fileCategory, countLoading }: IFilesCategoryTypes) {
  const objV1 = {
    application: fileCategory.documentFileData.totalSize,
    image: fileCategory.imageFileData.totalSize,
    video: fileCategory.videoFileData.totalSize,
    audio: fileCategory.audioFileData.totalSize,
    text: fileCategory.textFileData.totalSize,
    other: fileCategory.otherFileData.totalSize,
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
                isLoading={countLoading}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </div>
  );
}

export default FileCardSlider;
