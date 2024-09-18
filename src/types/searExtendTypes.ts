import { ICreateByTypes, IFileTypes, IFolderIdTypes } from "./filesType";

export interface ISearchTypes {
  _id: string;
  path: string;
  pin: number;
  shortUrl: string | null;
  total_size: string;
  updatedAt: string;
  url: string;
  access_password: string | null;
  checkFolder: string;
  folder_name: string;
  folder_type: string;
  newFolder_name: string;
  newPath: string;
  file_id: IFileTypes[];
  parentkey: IFolderIdTypes[];
  createdBy: ICreateByTypes;
}
