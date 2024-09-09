export interface IFileTypes {
  _id: string;
  actionDate: Date;
  actionStatus: string;
  aproveDownloadPublic: number;
  checkFile: string;
  createdAt: Date;
  createdBy: ICreateByTypes;
  detail?: string | null;
  device: string;
  downloadBy: IDownloadByTypes;
  downloadStatus: string | null;
  dropExpiredAt: string | null;
  dropLink: string | null;
  dropStatus: string;
  dropUrl: string | null;
  expired: string | null;
  favorite: number;
  filePassword: string | null;
  fileType: string;
  type?: string;
  filename: string;
  folder_id: IFolderIdTypes;
  getLinkBy: string | null;
  ip: string | null;
  isDeleted: number;
  isPublic: string;
  longUrl: string;
  newFilename: string;
  newPath: string | null;
  passwordUrlAll: string | null;
  path: string | null;
  permissionSharePublic: number;
  restore: string;
  shortUrl: string;
  size: string;
  source: string;
  status: string;
  totalDownload: number;
  totalDownloadFaild: number;
  type_id: { _id: string | null };
  updatedAt: Date;
  updatedBy: IDownloadByTypes;
  uploadBy: IDownloadByTypes;
  uploadStatus: string | null;
  url: string;
  urlAll: string | null;
  newName?: string
}

export interface ICreateByTypes {
  _id: string;
  newName: string;
  lastName: string;
  email: string;
  firstName: string;
}
export interface IDownloadByTypes {
  _id: string | null;
}
export interface IFolderIdTypes {
  _id: string | null;
}
