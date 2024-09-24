import { ICreateByTypes } from "./filesType";
import { IUserTypes } from "./userType";

export interface IMyCloudTypes {
  field: string;
  actionDate: Date;
  actionStatus: string;
  aproveDownloadPublic: number;
  checkFile: string;
  createdAt: Date;
  createdBy: ICreateByTypes;
  detail: string;
  device: string;
  downloadBy: ICreateByTypes;
  downloadStatus: string;
  dropExpiredAt: string;
  dropLink: string;
  dropStatus: string;
  dropUrl: string;
  expired: string;
  favorite: number;
  filePassword: string;
  fileType: string;
  filename: string;
  folder_id: { _id: string };
  getLinkBy: number;
  access_password: string;
  id: string;
  ip: string;
  isDeleted: number;
  isPublic: string;
  longUrl: string;
  newFilename: string;
  newPath: string;
  passwordUrlAll: string;
  path: string;
  permissionSharePublic: 0;
  restore: string;
  shortUrl: string;
  size: string;
  source: string;
  status: string;
  totalDownload: 0;
  totalDownloadFaild: 0;
  type_id: { _id: string };
  updatedAt: Date;
  updatedBy: ICreateByTypes;
  uploadBy: { _id: string };
  uploadStatus: string;
  url: string;
  urlAll: string;
  _id: string;
}

export interface IFolderTypes {
  _id: string;
  id?: string; // for custom
  folder_name: string;
  total_size: string;
  folder_type: string;
  checkFolder: boolean;
  newFolder_name: string;
  access_password: string | null;
  shortUrl: string | null;
  url: string;
  path: string;
  newPath: string;
  pin: number;
  createdBy: IUserTypes;
  file_id: IMyCloudTypes;
  updatedAt: Date;
}
