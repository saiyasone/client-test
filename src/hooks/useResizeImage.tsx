// import axios from "axios";
// import { ENV_KEYS } from "constants/env.constant";
// import _ from "lodash";
// import { useEffect, useState } from "react";
// import { encryptData } from "utils/secure.util";
// const { CancelToken } = axios;

// type Props = {
//   imagePath: string;
//   user: any;
//   fileType: string;
//   width: number | string;
//   height: number | string;
//   isPublic: boolean;
// };

// const useResizeImage = ({
//   imagePath,
//   user,
//   fileType,
//   width,
//   height,
//   isPublic,
// }: // width = 200,
// // height = 200,
// // isPublic = false,
// Props) => {
//   const [imageSrc, setImageSrc] = useState<any>("");
//   const [imageFound, setImageFound] = useState<any>(null);

//   const source = CancelToken.source();
//   const cancelToken = source.token;

//   // useEffect(() => {
//   //   console.log(imagePath);
//   // }, [imagePath]);

//   useEffect(() => {
//     if (fileType === "image") {
//       const fetchResizeImage = async (imagePath: string, userId: string) => {
//         try {
//           const enData = encryptData({
//             path: imagePath,
//             createdBy: isPublic ? "0" : userId,
//             width: `${width}`,
//             height: `${height}`,
//           });

//           const res = await axios.get(
//             `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/resize-image?file=${enData}`,
//             {
//               responseType: "arraybuffer",
//               cancelToken,
//               headers: { "Cache-Control": "no-cache" },
//             },
//           );
//           if (_.isArrayBuffer(res.data)) {
//             if (res.data.byteLength > 50) {
//               const blob = new Blob([res.data], { type: "image/jpeg" });

//               const url = URL.createObjectURL(blob);

//               setImageSrc(url);
//               setImageFound(true);
//               return () => URL.revokeObjectURL(url);
//             } else {
//               setImageFound(false);
//             }
//           } else {
//             setImageFound(false);
//           }
//         } catch (e) {
//           setImageFound(false);
//         }
//       };

//       if (imagePath && user?._id) {
//         fetchResizeImage(imagePath, user?._id);
//       } else {
//         setImageFound(false);
//       }
//     }
//   }, [imagePath, user, fileType]);

//   return { imageSrc, imageFound };
// };

// export default useResizeImage;

import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import _ from "lodash";
import { useEffect, useState } from "react";
import { encryptData } from "utils/secure.util";

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
}: Props) => {
  const [imageSrc, setImageSrc] = useState<any>("");
  const [imageFound, setImageFound] = useState<any>(null);

  useEffect(() => {
    if (fileType === "image") {
      const fetchResizeImage = async (
        imagePath: string,
        userId: string,
        cancelToken: any,
      ) => {
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
              cancelToken, // Pass the cancel token here
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
          if (axios.isCancel(e)) {
            // console.log("Request canceled", e.message);
          } else {
            setImageFound(false);
          }
        }
      };

      const source = axios.CancelToken.source();

      if (imagePath && user?._id) {
        fetchResizeImage(imagePath, user._id, source.token);
      } else {
        setImageFound(false);
      }

      // Cleanup function to cancel request on unmount or dependency change
      return () => {
        source.cancel("");
      };
    }
  }, [imagePath, user, fileType, width, height, isPublic]);

  return { imageSrc, imageFound };
};

export default useResizeImage;
