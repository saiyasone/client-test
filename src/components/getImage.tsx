import { ENV_KEYS } from "constants/env.constant";
import { Fragment } from "react/jsx-runtime";

const ImageComponent = ({ imagePath, fileType }) => {
  const newUrl = ENV_KEYS.VITE_APP_LOAD_URL + "preview?path=";
  const sourcePath = imagePath || "";

  return (
    <Fragment>
      <img
        src={newUrl + sourcePath}
        alt={fileType}
        width={40}
        style={{ borderRadius: "5px !important", objectFit: "cover" }}
      />
    </Fragment>
  );
};

export default ImageComponent;
