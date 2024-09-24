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

export interface ISearchFolderTypes {
  _id: string;
  path: string;
  pin: number;
  shortUrl: string | null;
  total_size: string;
  type: string;
  updatedAt: string;
  url: string;
  folder_name: string;
  folder_type: string;
  isContainsFiles: boolean;
  name: string;
  newFolder_name: string;
  newName: string;
  newPath: string;
  access_password: string | null;
  checkFolder: string;
  createdBy: ICreateByTypes;
  file_id: IFileTypes[];
  parentkey: IFolderIdTypes[];
}

