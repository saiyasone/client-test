import { IUserTypes } from "./userType";

export interface IFileCategoryTypes {
  _id: string;
  actionDate: Date;
  actionStatus: string;
  aproveDownloadPublic: number;
  checkFile: string;
  createdAt: Date;
  createdBy: IUserTypes;
  detail: string;
  expired: Date | null;
  favorite: number;
  filePassword: string;
  fileType: string;
  filename: string;
  ip: string;
  isPublic: string;
  newFilename: string;
  newPath: string;
  passwordUrlAll: string;
  path: string;
  permissionSharePublic: number;
  shortUrl: string;
  size: string;
  status: string;
  totalDownload: number;
  totalDownloadFaild: number;
  updatedAt: Date;
  url: string;
  urlAll: string;
}
export interface IFileCategoryAllTypes {
  data: IFileCategoryTypes;
  total: number;
}
