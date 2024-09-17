import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  width = 200,
  height = 200,
  isPublic = false,
}: Props) => {
  const [imageSrc, setImageSrc] = useState<any>("");
  const [imageFound, setImageFound] = useState<any>(null);
  const location = useLocation();

  const source = CancelToken.source();
  const cancelToken = source.token;

  useEffect(() => {
    if (fileType === "image") {
      const fetchResizeImage = async (imagePath, userId) => {
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

      return () => {
        // source.cancel("Operation canceled due to route change.");
      };
    }
  }, [imagePath, user, fileType, location]);

  return { imageSrc, imageFound };
};

export default useResizeImage;
