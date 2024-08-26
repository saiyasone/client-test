import { useLazyQuery } from "@apollo/client";
import React from "react";
import useDeepEqualEffect from "../../../../hooks/useDeepEqualEffect";
import { QUERY_FILE_DROP_PUBLIC } from "api/graphql/fileDrop.graphql";

const useFetchFile = ({ filter }) => {
  const [isDataFound, setDataFound] = React.useState<boolean | null>(null);
  const [getData, { data: dataFetching, loading }] = useLazyQuery(
    QUERY_FILE_DROP_PUBLIC,
    {
      fetchPolicy: "no-cache",
    },
  );

  const customgetFiles = () => {
    getData({
      variables: {
        where: {
          dropUrl: filter.url,
          status: "active",
        },
      },
    });
  };

  useDeepEqualEffect(() => {
    customgetFiles();
  }, [filter]);

  const data = React.useMemo(() => {
    const queryData = dataFetching?.getFileDrop?.data || [];
    const queryTotal = dataFetching?.getFileDrop?.total || null;
    if (queryData !== undefined) {
      if (queryData.length > 0) {
        setDataFound(true);
      } else {
        setDataFound(false);
      }
    }
    return {
      data: queryData,
      total: queryTotal,
      loading,
      isDataFound,
      customgetFiles,
    };
  }, [dataFetching, isDataFound]);

  return data;
};

export default useFetchFile;
