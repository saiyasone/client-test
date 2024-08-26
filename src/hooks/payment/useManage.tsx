import { useLazyQuery } from "@apollo/client";
import { QUERY_PAYMENT } from "api/graphql/payment.graphql";
import useAuth from "hooks/useAuth";
import React from "react";

function useManagePayment({ filter }) {
  const { user }: any = useAuth();
  const [getPayment, { data }] = useLazyQuery(QUERY_PAYMENT, {
    fetchPolicy: "no-cache",
  });
  const [selectedRow, setSelectedRow] = React.useState([]);
  const { pageLimit, currentPageNumber, status = "success" } = filter;
  const customPayment = () => {
    const skip = (currentPageNumber - 1) * pageLimit;
    getPayment({
      variables: {
        orderBy: "createdAt_ASC",
        limit: pageLimit,
        skip,
        where: {
          payerId: user?._id,
          ...(status && { status: status }),
        },
      },
    });
  };

  React.useEffect(() => {
    customPayment();
  }, [filter, getPayment]);

  return {
    selectedRow,
    setSelectedRow,
    getPayment,
    customPayment,
    data: data?.getPayments?.data?.map((value, index) => ({
      ...value,
      no: index + 1,
    })),
    total: data?.getPayments?.total,
  };
}

export default useManagePayment;
