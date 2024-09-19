import { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { ENV_KEYS } from 'constants/env.constant';
import { encryptData } from 'utils/secure.util';

const fetchResizeImage = async (imagePath: string, isPublic: string, userId: string, cancelToken: any) => {
  try {
    const enData = encryptData({
      path: imagePath,
      createdBy: isPublic ? '0' : userId,
      width: 50,
      height: 50,
    });

    const res = await axios.get(`${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/resize-image?file=${enData}`, {
      responseType: 'arraybuffer',
      cancelToken,
    });

    if (_.isArrayBuffer(res.data)) {
      if (res.data.byteLength > 50) {
        const blob = new Blob([res.data], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        return url;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const ImageComponent = ({ imagePath, isPublic, userId }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const source = axios.CancelToken.source();
    
    const fetchImage = async () => {
      const imageUrl = await fetchResizeImage(imagePath, isPublic, userId, source.token);
      if (imageUrl) {
        setImageSrc(imageUrl);
      }
    };

    fetchImage();

    return () => {
      source.cancel('Image fetch canceled');
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imagePath, isPublic, userId]);

  return (
    <img
      src={imageSrc || ""}
      alt=""
      width={60}
      style={{borderRadius: '5px !important'}}
    />
  );
};

export default ImageComponent;
