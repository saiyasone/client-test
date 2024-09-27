import { AiOutlineCloud } from "react-icons/ai";
import { BiPackage, BiTime } from "react-icons/bi";
import { BsPinAngleFill, BsTrash3 } from "react-icons/bs";
import { FiFile } from "react-icons/fi";
import { HiOutlineShare } from "react-icons/hi";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { TbDashboard } from "react-icons/tb";
import FeedHome from "assets/images/feed-icon/home.svg?react";
import { MdOutlineExplore } from "react-icons/md";
import { TbUserPlus } from "react-icons/tb";
import { FiUsers } from "react-icons/fi";

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

const Feed = [
  {
    href: "/feed/foryou",
    icon: FeedHome,
    title: "For you",
  },
  {
    href: "/feed/explore",
    icon: MdOutlineExplore,
    title: "Explore",
  },
  {
    href: "/feed/following",
    icon: TbUserPlus,
    title: "Following",
  },
  {
    href: "/feed/friends",
    icon: FiUsers,
    title: "Friends",
  },
  {
    href: "/feed/profile",
    icon: FiUsers,
    title: "Channel",
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
  // { title: "SHORT", pages: Feed },
  // {
  //   title: "",
  //   pages: Uppy,
  // },
];

export default navItems;
