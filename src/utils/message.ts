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
