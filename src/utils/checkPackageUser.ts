import { IUserTypes } from "types/userType";

export const isUserPackage = async(user: IUserTypes | null) => {
  const isUserTypes = user?.packageId?.category;
  switch (isUserTypes) {
    case "free":
      return isUserTypes;
      break;
    case "pro":
      return isUserTypes;
      break;
    case "premium":
      return isUserTypes;
      break;
    default:
      return;
  }
};
