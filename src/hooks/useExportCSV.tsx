import { useLazyQuery } from "@apollo/client";

import { QUERY_FILE_CSV } from "api/graphql/folder.graphql";
import { useEffect } from "react";
import { errorMessage } from "utils/alert.util";
import { DateOfNumber } from "utils/date.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const useExportCSV = ({ folderId, exportRef, onSuccess }) => {
  const [exportCSV, { data: getFileData }] = useLazyQuery(QUERY_FILE_CSV, {
    fetchPolicy: "no-cache",
  });

  async function handleGetAllFile() {
    try {
      if (folderId) {
        const result = await exportCSV({
          variables: {
            id: String(folderId),
          },
        });
        if (result.data?.exportMultipleShortUrl?.data) {
          await exportRef?.current?.link.click();
          await onSuccess?.();
        }
      }
    } catch (error: any) {
      errorMessage(error?.message, 3000);
    }
  }

  useEffect(() => {
    handleGetAllFile();
  }, [folderId]);

  return {
    data:
      getFileData?.exportMultipleShortUrl?.data?.map((item, index) => {
        return {
          ID: index + 1,
          Filename: item.filename,
          ShortUrl: item.shortUrl || "",
          Size: convertBytetoMBandGB(item.size),
          createdAt: DateOfNumber(item.createdAt),
        };
      }) || [],
  };
};

export default useExportCSV;
