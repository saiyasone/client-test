import { IUserTypes } from "./userType";

export interface ISelectMultipleType {
  id?: string;
  name?: string;
  check?: string;
  checkType?: string;
  newPath?: string;
  totalSize?: number;
  newFilename?: string;
  dataPassword?: string;
  shortLink?: string;
  createdBy?: IUserTypes;
  pin?: boolean;
  longUrl?: string;
  favorite?: any;
  totalDownload?: number;
  permission?: string;
  toAccount?: IUserTypes;
  share: {
    _id?: string;
    isFromShare?: boolean;
  };
}
