import { useLazyQuery } from "@apollo/client";
import { QUERY_RANDOM_VDO } from "api/graphql/feed/feed.graphql";

import React from "react";
import { IstateTypes } from "types/feed/vdoType";

const useGetRandomVdo = (filter?: IstateTypes) => {
  const [isSuccess, setIsSuccess] = React.useState({
    isSuccess: false,
    message: "",
  });
  const [randomVdo, { data, loading, refetch }] = useLazyQuery(
    QUERY_RANDOM_VDO,
    { context: { api: "feed" } },
  );
  React.useEffect(() => {
    randomVdo({
      variables: {
        limit: filter?.limit,
        option: filter?.option,
        searchKeyword: null,
      },
      onCompleted(data) {
        setIsSuccess({
          isSuccess: data?.randomVideos?.success,
          message: data?.randomVideos?.error?.message,
        });
      },
    });
  }, [randomVdo, filter]);

  return {
    data: data?.randomVideos,
    loading,
    isSuccess,
    randomVdo,
    refetch,
  };
};

export { useGetRandomVdo };
