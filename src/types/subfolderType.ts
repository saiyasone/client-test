import { IMyCloudTypes } from "./mycloudFileType";
import { IUserTypes } from "./userType";

export interface ISubFolderTypes {
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
  parentkey: string | null;
  updatedAt: Date;
}
