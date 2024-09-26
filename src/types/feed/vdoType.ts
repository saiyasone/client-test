export interface IvisibilityVdosTypes {
  comment: string;
}

export interface IPreviewVdoTypes {
  preview_url?: string;
}
export interface IVideosTypes {
  id?: string;
  source: IPreviewVdoTypes;
}

export interface IChanelTypes {
  id: string;
  prefix: string;
  userId: string;
  name: string;
  option: IOptonChanelTypes;
  createdAt: string;
  updatedAt: string;
}
export interface IActionTyeps {
  total_comment: number;
  total_dislike: number;
  total_download: number;
  total_like: number;
  total_share: number;
  total_view: number;
}
export interface IOptonChanelTypes {
  total_post: string;
  total_view_fromPost: string;
  total_like_fromPost: string;
  total_dislike_fromPost: string;
  total_download_fromPost: string;
  total_share_fromPost: string;
  total_follower: string;
  total_following: string;
}
export interface IOptionTypes {
  video: IVideosTypes;
  title?: string;
  tag?: string[];
}

export interface IDataItemsTypes {
  visibility: IvisibilityVdosTypes;
  option: IOptionTypes;
  action: IActionTyeps;
  platform: string;
  chanel: IChanelTypes;
  id: number;
  chanelId: number;
  createdAt: string;
}

export interface IDataVdoItemsTypes {
  
  data: IDataItemsTypes;
}
export interface IrandomVideos {
  randomVideos: IDataItemsTypes;
  error?: string | null;
  success: boolean;
}

export interface IstateTypes {
  limit: number;
  option: string;
  searchKeyword: string;
}
