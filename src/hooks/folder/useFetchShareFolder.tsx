import { useLazyQuery } from "@apollo/client";
import { QUERY_FOLDER_SHARE_PUBLIC } from "api/graphql/share.graphql";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { useContext, useEffect, useMemo } from "react";

const useFetchShareFolder = ({ folderUrl }: any) => {
  const [getData, { data: dataFetching }] = useLazyQuery(
    QUERY_FOLDER_SHARE_PUBLIC,
    {
      fetchPolicy: "no-cache",
    },
  );

  const eventUploadTrigger = useContext(EventUploadTriggerContext);

  useEffect(() => {
    if (folderUrl) {
      getData({
        variables: {
          id: folderUrl,
        },
      });
    }
  }, [folderUrl, eventUploadTrigger.triggerData]);

  const data = useMemo(() => {
    const [queryData] = dataFetching?.folderPublic?.data || [];
    const queryTotal = 1;
    return {
      data: queryData,
      total: queryTotal,
    };
  }, [dataFetching]);

  return data;
};

export default useFetchShareFolder;
