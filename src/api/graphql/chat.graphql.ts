import { gql } from "@apollo/client";

export const QUERY_CHAT_MESSAGE = gql`
  query getChatMessage(
    $where: TicketsWhereInput
    $limit: Int
    $orderBy: OrderByFolderAndFileInput
    $skip: Int
    $request: Request
  ) {
    tickets(
      where: $where
      limit: $limit
      orderBy: $orderBy
      skip: $skip
      request: $request
    ) {
      total
      data {
        _id
        message
        status
        createdAt
        updatedAt
        typeTicketID {
          _id
          title
          email
          status
        }
        image {
          newNameImage
          image
        }
        createdByCustomer {
          _id
          newName
          firstName
          lastName
          email
        }
        createdByStaff {
          _id
          newName
        }
        replyMessage {
          _id
          message
        }
      }
    }
  }
`;
