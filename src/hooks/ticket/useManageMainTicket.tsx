import { useLazyQuery } from "@apollo/client";
import { QUERY_TICKET_TYPE } from "api/graphql/ticket.graphql";
import { useEffect, useState } from "react";

const useManageMainTicket = ({ filter }) => {
  const [getTickets, { data: get_tickets }] = useLazyQuery(QUERY_TICKET_TYPE, {
    fetchPolicy: "no-cache",
  });
  const [selectedRow, setSelectedRow] = useState([]);
  const [reloading, setReloading] = useState(false);

  const {
    id,
    currentPageNumber,
    pageLimit,
    search,
    status,
    createdAt,
    createdBy,
  } = filter;

  const handleReloading = () => setReloading((prev) => !prev);

  const customTicket = () => {
    const skip = (currentPageNumber - 1) * pageLimit;
    getTickets({
      variables: {
        orderBy: "createdAt_DESC",
        limit: pageLimit,
        skip,
        where: {
          ...(search && { title: search }),
          ...(status && { status: status }),
          ...(id && { _id: id }),
          ...(createdBy && { createdBy: createdBy }),
          ...(createdAt.startDate &&
            createdAt.endDate && {
              createdAtBetween: [createdAt.startDate, createdAt.endDate],
            }),
        },
      },
    });
  };

  useEffect(() => {
    customTicket();
  }, [filter, getTickets, reloading]);

  return {
    data: get_tickets?.typetickets?.data?.map((data, index) => ({
      ...data,
      index: index + 1,
    })),
    total: get_tickets?.typetickets?.total,
    selectedRow,

    customTicket,
    setSelectedRow,
    getTickets,
    handleReloading,
  };
};

export default useManageMainTicket;
