import { useLazyQuery } from "@apollo/client";
import { QUERY_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import useAuth from "hooks/useAuth";
import React from "react";

function useManageFileDrop({ filter }) {
  const { user }: any = useAuth();
  const [getFileDrop, { data }] = useLazyQuery(QUERY_FILE_DROP_URL_PRIVATE, {
    fetchPolicy: "no-cache",
  });
  const [selectedRow, setSelectedRow] = React.useState([]);
  const { pageLimit, currentPageNumber, status } = filter;
  const customeFileDrop = () => {
    const skip = (currentPageNumber - 1) * pageLimit;
    getFileDrop({
      variables: {
        orderBy: "createdAt_DESC",
        limit: pageLimit,
        skip,
        where: {
          ...(status && { status: status }),
          createdBy: user?._id,
        },
      },
    });
  };

  React.useEffect(() => {
    customeFileDrop();
  }, [filter, getFileDrop]);

  return {
    selectedRow,
    setSelectedRow,
    getFileDrop,
    customeFileDrop,
    data: data?.getPrivateFileDropUrl?.data?.map((value, index) => ({
      ...value,
      no: index + 1,
    })),
    pageLimit,
    total: data?.getPrivateFileDropUrl?.total,
  };
}

export default useManageFileDrop;
