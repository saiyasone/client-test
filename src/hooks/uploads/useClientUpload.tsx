import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import { calculateTime } from "utils/date.util";
import { encryptData } from "utils/secure.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import * as uuid from "uuid";

const baseURL = ENV_KEYS.VITE_APP_LOAD_URL;
const chunkSize = 100 * 1024 * 1024;

export const encryptHeader = (
  newFilename?: string,
  createdBy?: string,
  pathBunny?: string,
) => {
  const auth: any = {
    createdBy,
    PATH: pathBunny,
    FILENAME: newFilename,
  };

  try {
    const encryptedData = encryptData(auth);
    return encryptedData;
  } catch (error) {
    console.error("Error encrypting header:", error);
    return null;
  }
};

export function getTag(file: any): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      const url = `${baseURL}initiate-multipart-upload`;

      // const uploadIdList: any = [];
      const fileName = file.newFilename;
      const headers = {
        encryptedheaders: encryptHeader(fileName, file.createdBy, file?.path),
      };
      const options = {
        headers,
        method: `POST`,
        url: url,
      };

      const run = await axios<{ uploadId?: string }>(options);
      const uploadId = await run.data?.uploadId;

      resolve(uploadId);
    } catch (error: any) {
      console.log(`error complete get tag`, error.message);
      reject(error.message);
    }
  });
}

export function getTarget(uploads: Array<any>): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      const url = `${baseURL}generate-presigned-url`;
      const targetList: any = [];

      for (let i = 0; i < uploads.length; i++) {
        const file = uploads[i].file;
        const numParts = Math.ceil(file.size / chunkSize);
        const item: any[] = [];

        for (let partNumber = 1; partNumber <= numParts; partNumber++) {
          const start = (partNumber - 1) * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const blob = file.slice(start, end);

          try {
            const formData = new FormData();
            formData.append("partNumber", partNumber.toString());
            formData.append("uploadId", uploads[i].uploadId);

            const fileName = file.newFilename;
            const headers = {
              encryptedheaders: encryptHeader(
                fileName,
                file.createdBy,
                file.path,
              ),
            };
            const options = {
              method: `POST`,
              url: url,
              headers: headers,
              data: formData,
            };
            const run = await axios(options);
            const target = await run.data.url;

            const model: any = {
              file,
              target,
              uploadId: uploads[i].uploadId,
              partNumber: partNumber,
              blob,
              fileType: uploads[i].file.type,
              uuid: uuid.v4(),
              size: file.size,
            };
            item.push(model);
          } catch (error: any) {
            console.error(`Error uploading part ${partNumber}:`, error);
          }
        }
        targetList.push(item);
      }

      resolve(targetList);
    } catch (error: any) {
      console.log(`error complete get target`, error.message);
      reject(error.message);
    }
  });
}

export function startTransaction(
  target: any,
  startTime: any,
  handleProgress?: (uploadId: any, partNumber: any, percentage: number) => void,
  handleTimeSpeed?: (uploadId, partNumber, speed, duration) => void,
): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      let percentComplete = 0;

      const request = new XMLHttpRequest();
      request.open("PUT", target.target, true);
      request.setRequestHeader("Content-Type", target.fileType);

      request.upload.onprogress = (event) => {
        const speed = convertBytetoMBandGB(
          event.loaded / ((Date.now() - startTime) / 1000),
        );
        const endTime = Date.now();
        const duration = calculateTime(endTime - startTime);
        handleTimeSpeed?.(target.uploadId, target.partNumber, speed, duration);

        if (event.lengthComputable) {
          percentComplete = Math.round(
            ((event.loaded + (target.partNumber - 1) * chunkSize) * 100) /
              target.size,
          );
          console.log(percentComplete);
          handleProgress?.(target.uploadId, target.partNumber, percentComplete);
        }
      };
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          const model = {
            ETag: request.getResponseHeader("ETag"),
            PartNumber: target.partNumber,
          };

          const response = {
            data: model,
            message: "success",
          };
          resolve(response);
        }
      };

      request.send(target.blob);
    } catch (error: any) {
      console.log(`error start transaction`, error.message);
      reject(error.message);
    }
  });
}

export function startTransactionV1(
  target: any,
  startTime: any,
  handleProgress?: (uploadId: any, partNumber: any, percentage: number) => void,
  handleTimeSpeed?: (
    uploadId: any,
    partNumber: any,
    speed: string,
    duration: string,
  ) => void,
): { request: XMLHttpRequest; promise: Promise<any> } {
  const request = new XMLHttpRequest();

  const promise = new Promise<any>((resolve, reject) => {
    try {
      let percentComplete = 0;

      request.open("PUT", target.target, true);
      request.setRequestHeader("Content-Type", target.fileType);

      request.upload.onprogress = (event) => {
        const speed = convertBytetoMBandGB(
          event.loaded / ((Date.now() - startTime) / 1000),
        );
        const endTime = Date.now();
        const duration = calculateTime(endTime - startTime);
        handleTimeSpeed?.(target.uploadId, target.partNumber, speed, duration);

        if (event.lengthComputable) {
          percentComplete = Math.round(
            ((event.loaded + (target.partNumber - 1) * chunkSize) * 100) /
              target.size,
          );
          handleProgress?.(target.uploadId, target.partNumber, percentComplete);
        }
      };

      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            const model = {
              ETag: request.getResponseHeader("ETag"),
              PartNumber: target.partNumber,
            };

            const response = {
              data: model,
              message: "success",
            };
            resolve(response);
          } else {
            reject(new Error(`Request failed with status ${request.status}`));
          }
        }
      };

      request.onerror = function () {
        reject(new Error("Network error occurred"));
      };

      request.onabort = function () {
        reject(new Error("Request aborted"));
      };

      request.send(target.blob);
    } catch (error: any) {
      console.log(`error start transaction`, error.message);
      reject(error.message);
    }
  });

  return { request, promise };
}

export function endTransaction(
  parts: Array<any>,
  uploads: Array<any>,
): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      const url = `${baseURL}complete-multipart-upload`;
      for (let i = 0; i < uploads.length; i++) {
        const file = uploads[i].file;
        const fileName = file.newFilename;
        const headers = {
          encryptedheaders: encryptHeader(fileName, file.createdBy, file?.path),
        };
        const formData = new FormData();
        formData.append("parts", JSON.stringify(parts[i]));
        formData.append("uploadId", uploads[i]?.uploadId);
        const options = {
          method: `POST`,
          url: url,
          headers: headers,
          data: formData,
        };
        await axios(options);
      }

      resolve("success");
    } catch (error: any) {
      console.log(`error end transaction`, error.message);
      reject(error.message);
    }
  });
}
