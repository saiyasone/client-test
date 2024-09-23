import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import _ from "lodash";
import { useEffect, useState } from "react";
import { encryptData } from "utils/secure.util";
const { CancelToken } = axios;

type Props = {
  imagePath: string;
  user: any;
  fileType: string;
  width: number | string;
  height: number | string;
  isPublic: boolean;
};

const useResizeImage = ({
  imagePath,
  user,
  fileType,
  width,
  height,
  isPublic,
}: // width = 200,
// height = 200,
// isPublic = false,
Props) => {
  const [imageSrc, setImageSrc] = useState<any>("");
  const [imageFound, setImageFound] = useState<any>(null);

  const source = CancelToken.source();
  const cancelToken = source.token;
  // 484720865-703/f2c283d0-8d83-4d1a-bee9-e694e97718d7/0e78db66-1658-4a7c-869e-f8465769db62/6695a8b5-9456-44cf-9384-80d26a8ba60e/ceacbf1e-54c0-4494-83e9-ba672aabca6f_w2tpOTgifo5x0Ftjp2xtGjkOy.jpg
  // 484720865-703/f2c283d0-8d83-4d1a-bee9-e694e97718d7/0e78db66-1658-4a7c-869e-f8465769db62/6695a8b5-9456-44cf-9384-80d26a8ba60e/70bab883-b6d9-44eb-9f69-505a52e74e27.png

  useEffect(() => {
    if (fileType === "image") {
      const fetchResizeImage = async (imagePath: string, userId: string) => {
        try {
          const enData = encryptData({
            path: imagePath,
            createdBy: isPublic ? "0" : userId,
            width: `${width}`,
            height: `${height}`,
          });

          const res = await axios.get(
            `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/resize-image?file=${enData}`,
            {
              responseType: "arraybuffer",
              cancelToken,
              headers: { "Cache-Control": "no-cache" },
            },
          );
          if (_.isArrayBuffer(res.data)) {
            if (res.data.byteLength > 50) {
              const blob = new Blob([res.data], { type: "image/jpeg" });

              const url = URL.createObjectURL(blob);

              setImageSrc(url);
              setImageFound(true);
              return () => URL.revokeObjectURL(url);
            } else {
              setImageFound(false);
            }
          } else {
            setImageFound(false);
          }
        } catch (e) {
          setImageFound(false);
        }
      };

      if (imagePath && user?._id) {
        fetchResizeImage(imagePath, user?._id);
      } else {
        setImageFound(false);
      }
    }
  }, [imagePath, user, fileType]);

  return { imageSrc, imageFound };
};

export default useResizeImage;
