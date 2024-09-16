import { useLazyQuery } from "@apollo/client";
import { QUERY_FILE } from "api/graphql/file.graphql";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import useDeepEqualEffect from "hooks/useDeepEqualEffect";
import React, { useContext } from "react";
import { accumulateArray } from "utils/covert.util";
import { getShortFileTypeFromFileType } from "utils/file.util";

const useFetchFile = ({ user }: any = {}) => {
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const fileTypeList = [
    "pdf",
    "txt",
    "docx",
    "xlsx",
    "doc",
    "json",
    "md",
    "xml",
    "yaml",
    "html",
    "css",
    "js",
    "php",
    "rb",
    "swift",
    "go",
    "c",
    "cpp",
    "java",
    "py",
    "ini",
    "cfg",
    "conf",
  ];
  const [getData, { data: dataFetching, loading: dataLoading }] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });

  const getCustomFiles = () => {
    return getData({
      variables: {
        where: {
          status: "active",
          createdBy: user?._id,
        },
        noLimit: true,
        orderBy: "updatedAt_DESC",
      },
    });
  };

  useDeepEqualEffect(() => {
    getCustomFiles();
  }, [user, eventUploadTrigger.triggerData]);

  useDeepEqualEffect(() => {
    if (eventUploadTrigger.triggerData.isTriggered) {
      getCustomFiles();
    }
  }, [eventUploadTrigger.triggerData]);

  const data = React.useMemo(() => {
    const queryData = dataFetching?.files?.data || [];
    const queryTotal = dataFetching?.files?.total || null;

    const totalSize = accumulateArray(queryData, "size");

    const totalActiveSize = accumulateArray(
      queryData.filter((data: any) => data.status === "active"),
      "size",
    );

    const totalDownload = accumulateArray(queryData, "totalDownload");

    const documentFileData = queryData.filter(
      (data: any) => data.fileType.split("/")[0] === "application",
    );

    const imageFileData = queryData.filter(
      (data: any) => getShortFileTypeFromFileType(data.fileType) === "image",
    );

    const videoFileData = queryData.filter(
      (data: any) => getShortFileTypeFromFileType(data.fileType) === "video",
    );

    const audioFileData = queryData.filter(
      (data: any) => getShortFileTypeFromFileType(data.fileType) === "audio",
    );

    const textFileData = queryData.filter(
      (data: any) => getShortFileTypeFromFileType(data.fileType) === "text",
    );

    const otherFileData = queryData.filter((data: any) => {
      const dataFileType = getShortFileTypeFromFileType(data.fileType);
      return (
        dataFileType !== "image" &&
        dataFileType !== "video" &&
        dataFileType !== "audio" &&
        dataFileType !== "text" &&
        data.fileType.split("/")[0] !== "application" &&
        !data.fileType &&
        !fileTypeList.some((fileType) => fileType === dataFileType)
      );
    });

    return {
      data: queryData,
      downloadedDataCount: accumulateArray(
        queryData.filter((data: any) => data.totalDownload >= 1),
        "totalDownload",
      ),
      total: queryTotal,
      totalSize,
      totalActiveSize,
      totalDownload,
      documentFileData: {
        totalLength: documentFileData.length,
        totalSize: accumulateArray(documentFileData, "size"),
      },
      imageFileData: {
        totalLength: imageFileData.length,
        totalSize: accumulateArray(imageFileData, "size"),
      },
      textFileData: {
        totalLength: textFileData.length,
        totalSize: accumulateArray(textFileData, "size"),
      },
      videoFileData: {
        totalLength: videoFileData.length,
        totalSize: accumulateArray(videoFileData, "size"),
      },
      audioFileData: {
        totalLength: audioFileData.length,
        totalSize: accumulateArray(audioFileData, "size"),
      },
      otherFileData: {
        totalLength: otherFileData.length,
        totalSize: accumulateArray(otherFileData, "size"),
      },
    };
  }, [dataFetching]);

  return {
    data,
    dataLoading,
    getData: getCustomFiles,
  };
};

export default useFetchFile;
