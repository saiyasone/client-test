import { useLazyQuery } from "@apollo/client";
import { QUERY_TICKET_TYPE } from "api/graphql/ticket.graphql";
import { useEffect } from "react";

const useManageTypeTicket = ({ typeID }) => {
  const [getUserTicket, { data: get_user_ticket }] = useLazyQuery(
    QUERY_TICKET_TYPE,
    {
      fetchPolicy: "no-cache",
    },
  );

  const customeTypeTicket = async () => {
    try {
      await getUserTicket({
        variables: {
          where: {
            _id: typeID,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    customeTypeTicket();
  }, [typeID]);

  return {
    data: get_user_ticket?.typetickets?.data,
  };
};

export default useManageTypeTicket;
