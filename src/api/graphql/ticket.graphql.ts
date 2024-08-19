import { gql } from "@apollo/client";

export const QUERY_TICKET = gql`
  query getTicketTYPEByID(
    $where: TicketsWhereInput
    $limit: Int
    $orderBy: OrderByFolderAndFileInput
    $noLimit: Boolean
  ) {
    tickets(
      where: $where
      limit: $limit
      orderBy: $orderBy
      noLimit: $noLimit
    ) {
      total
      data {
        _id
        message
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
        }
        replyMessage {
          _id
          message
        }
      }
    }
  }
`;

export const QUERY_TICKET_TYPE = gql`
  query Typetickets(
    $limit: Int
    $skip: Int
    $orderBy: OrderByFolderAndFileInput
    $where: TypeticketsWhereInput
  ) {
    typetickets(limit: $limit, skip: $skip, orderBy: $orderBy, where: $where) {
      total
      data {
        _id
        title
        email
        expired
        status
        code
        updatedAt
        createdAt
        createdBy {
          _id
          firstName
          lastName
          profile
          phone
          email
          newName
        }
      }
    }
  }
`;

export const MUTATION_CREATE_TICKET = gql`
  mutation CreateTickets($data: TicketsInput!) {
    createTickets(data: $data) {
      _id
      image {
        _id
        image
        newNameImage
      }
    }
  }
`;

export const MUTATION_CREATE_TICKET_TYPE = gql`
  mutation CreateTypetickets($data: TypeticketsInput!) {
    createTypetickets(data: $data) {
      _id
    }
  }
`;

export const MUTATION_UPDATE_TICKET_TYPE = gql`
  mutation UpdateTypetickets(
    $data: TypeticketsInput!
    $where: TypeticketsWhereOneInput!
  ) {
    updateTypetickets(data: $data, where: $where) {
      _id
    }
  }
`;

export const MUTATION_DELETE_TICKET_TYPE = gql`
  mutation DeleteTypetickets($where: TypeticketsWhereOneInput!) {
    deleteTypetickets(where: $where) {
      _id
    }
  }
`;
