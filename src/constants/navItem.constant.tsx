import { AiOutlineCloud } from "react-icons/ai";
import { BiPackage, BiTime } from "react-icons/bi";
import { BsPinAngleFill, BsTrash3 } from "react-icons/bs";
import { FiFile } from "react-icons/fi";
import { HiOutlineShare } from "react-icons/hi";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { TbDashboard } from "react-icons/tb";
import { RiHome5Fill } from "react-icons/ri";
import { MdOutlineExplore } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import { PiUserCircle } from "react-icons/pi";
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

const dashboard = [
  {
    href: "/dashboard",
    icon: TbDashboard,
    title: "Dashboard",
  },
];

const myCloud = [
  {
    href: "/my-cloud",
    icon: AiOutlineCloud,
    title: "My Cloud",
    pin: [
      {
        icon: BsPinAngleFill,
        title: "folder",
      },
      {
        icon: BsPinAngleFill,
        title: "folder1",
      },
    ],
  },
];

// const myFolders = [
//   {
//     href: "/my-folder",
//     icon: FaRegFolderOpen,
//     title: "My folders",
//   },
// ];

const shareWithMe = [
  {
    href: "/share-with-me",
    icon: HiOutlineShare,
    title: "Share with me",
  },
];

const recent = [
  {
    href: "/recent",
    icon: BiTime,
    title: "Recent",
  },
];

const Uppy = [
  {
    href: "/uppy",
    icon: BiPackage,
    title: "Uppy",
  },
];

const myFavourite = [
  { href: "/favourite", icon: MdOutlineFavoriteBorder, title: "Favourite" },
];

const myFileDrop = [{ href: "/file-drop", icon: FiFile, title: "File Drop" }];

const trash = [
  {
    href: "/trash",
    icon: BsTrash3,
    title: "Trash",
  },
];

///Feed 
const feedForyou = [
  {
    href: "/feed-for-you",
    icon: RiHome5Fill,
    title: "For you",
  },
];

const feedExplore = [
  {
    href: "/feed-explore",
    icon: MdOutlineExplore,
    title: "Explore",
  },
];

const feedFollowing = [
  {
    href: "/feed-following",
    icon: RiUserAddLine,
    title: "Following",
  },
];
const feedFriend = [
  {
    href: "/feed-friend",
    icon: PeopleOutlineIcon,
    title: "Frieds",
  },
];

const feedProfile = [
  {
    href: "/feed-profile",
    icon: PiUserCircle,
    title: "Profile",
  },
];


const navItems: any = [
  {
    title: "",
    pages: dashboard,
  },
  {
    title: "",
    pages: myCloud,
  },
  {
    title: "",
    pages: shareWithMe,
  },
  {
    title: "",
    pages: recent,
  },
  {
    title: "",
    pages: myFavourite,
  },
  {
    title: "",
    pages: myFileDrop,
  },
  {
    title: "",
    pages: trash,
  },
  // {
  //   title: "",
  //   pages: Uppy,
  // },
  {
    title: "SHORT",
    pages: null,
  },
  {
    title: "",
    pages: feedForyou,
  },
  {
    title: "",
    pages: feedExplore,
  },
  {
    title: "",
    pages: feedFollowing,
  },
  {
    title: "",
    pages: feedFriend,
  },
  {
    title: "",
    pages: feedProfile,
  },
];

export default navItems;
