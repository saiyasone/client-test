import { IUserTypes } from "./userType";

export interface IUserToAccountTypes {
  _id: string;
  accessKey: null;
  accessedAt: Date;
  createdAt: Date;
  createdBy: string;
  expiredAt: Date;
  isPublic: string;
  isShare: string;
  item: string;
  permission: string;
  size: string;
  status: string;
  fromAccount: IUserTypes;
  ownerId: IUserTypes;
  toAccount: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profile: string;
    newName: string;
  };
}
