export enum ReturnMessage {
  LockedFile = "The package you've selected is not compatible. Please consider choosing a different one",
  DeleteFile = "Delete file successful",
  DownloadFile = "Download successful",
}

export enum ReturnFileLockedMessage {
  RequiredPassord = "Please enter a password",
  LockedFileSuccess = "Lock file successful",
  LockedFileFailed = "Lock failed",
  LockedFileExits = "This file has an existing password.",
  LockedFileError = "An error occurred while locking the file",
}


export enum RenameFileMessage {
  UpdateSuccess = "Update file successful",
  UpdateFailed = "Update file failed",
}


export enum RenameFavouriteMessage {
  AddFavorite = "Add one favorite success",
  RemoveFavorite = "Remove one favorite success",
  FavoriteFailed = "Add or remove one favorite failed",
}
