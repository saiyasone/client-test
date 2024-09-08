export function getFileType(name: string) {
  if (!name) {
    return null;
  }
  const fileName = name;
  const fileType = fileName?.split(".").pop();

  return fileType;
}

export function cutFileType(name: string) {
  const fileName = name;
  const regex = /^(.+)\.\w+$/;
  const match = regex.exec(fileName);
  if (match) {
    const name = match[1];
    return name;
  } else {
    return fileName;
  }
}

export function cutFileName(fileName: string, maxLength = 10) {
  const extension = fileName.split(".").pop();
  const nameWithoutExtension = fileName.replace(`.${extension}`, "");
  if (nameWithoutExtension.length <= maxLength) return fileName;
  return `${nameWithoutExtension.slice(0, maxLength)}...${extension}`;
}

export function combineOldAndNewFileNames(
  filename: string,
  newFileName: string,
) {
  if (!newFileName) {
    return filename;
  }
  if (filename && newFileName) {
    const newName = filename.replace(newFileName, "");
    return newName;
  }
}

export function getFilenameWithoutExtension(filename) {
  const dotIndex = filename?.lastIndexOf(".");
  if (dotIndex > 0) {
    return filename.slice(0, dotIndex);
  } else {
    return filename;
  }
}

export function getFileNameExtension(filename) {
  const dotIndex = filename?.lastIndexOf(".");
  if (dotIndex !== -1) {
    const fileExtension = filename?.slice?.(dotIndex);
    return fileExtension;
  } else {
    return "";
  }
}

export function removeFileNameOutOfPath(path: string) {
  return path?.substring(0, path?.lastIndexOf("/") + 1);
}

export function getShortFileTypeFromFileType(fileType) {
  if (!fileType) {
    return null;
  }
  return fileType?.split("/")[0] || fileType;
}

export const readBlob = (blobURL, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", blobURL);
  xhr.responseType = "blob";
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(xhr.response);
    } else {
      console.error("Failed to fetch Blob data:", xhr.statusText);
      callback(null);
    }
  };
  xhr.onerror = function () {
    console.error("Network error occurred while fetching Blob data.");
    callback(null);
  };
  xhr.send();
};

export function getFolderName(path: string) {
  if (!path) {
    return null;
  }
  const str = path;
  const parts = str.split("/");
  const firstPart = parts[0];
  return firstPart;
}

export const saveSvgToFile = (svgString, fileName) => {
  if (svgString) {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const file = new File([blob], fileName + ".svg", { type: "image/svg+xml" });
    return file;
  }
  return false;
};
