//mui component and style
import MenuItem from "@mui/material/MenuItem";
import { BsPinAngleFill } from "react-icons/bs";
import { FaLock } from "react-icons/fa";
import { MdFavorite, MdOutlineDone } from "react-icons/md";
const MenuDropdownItem: React.FC<any> = ({
  icon,
  title,
  isFavorite,
  isPinned,
  isPassword,
  ...props
}) => {
  let result;
  const { isglobals, statusshare } = props;

  switch (true) {
    case title === "Favourite":
      if (isFavorite) {
        result = <MdFavorite fill="#17766B" />;
      } else {
        result = icon;
      }
      break;
    case title === "Password":
      if (isPassword) {
        result = <FaLock fill="#17766B" />;
      } else {
        result = icon;
      }
      break;
    case title === "Pin":
      if (isPinned) {
        result = <BsPinAngleFill fill="#3C384A" />;
        title = "Unpinned";
      } else {
        result = icon;
        title = "Pinned";
      }
      break;
    case title === "Private":
      if (isglobals === "private") {
        result = <MdOutlineDone fill="#17766B" size="18" />;
        title = <span style={{ color: "#212121" }}>{title}</span>;
      } else {
        result = icon;
        title = <span style={{ color: "#9e9e9e" }}>{title}</span>;
      }
      break;
    case title === "Public":
      if (isglobals === "public") {
        result = <MdOutlineDone fill="#17766B" size="18" />;
        title = <span style={{ color: "#212121" }}>{title}</span>;
      } else {
        result = icon;
        title = <span style={{ color: "#9e9e9e" }}>{title}</span>;
      }
      break;
    case title === "Can view":
      if (statusshare === "view") {
        result = icon;
        title = <span style={{ color: "#212121" }}>{title}</span>;
      } else {
        title = <span style={{ color: "#9e9e9e" }}>{title}</span>;
        result = <MdOutlineDone style={{ opacity: 0 }} />;
      }
      break;
    case title === "Can edit":
      if (statusshare === "edit") {
        result = icon;
        title = <span style={{ color: "#212121" }}>{title}</span>;
      } else {
        result = <MdOutlineDone style={{ opacity: 0 }} />;
        title = <span style={{ color: "#9e9e9e" }}>{title}</span>;
      }
      break;
    default:
      result = icon;
  }

  return (
    <MenuItem className="menu-item" {...props}>
      {result}
      {title}
    </MenuItem>
  );
};

export default MenuDropdownItem;
