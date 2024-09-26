import { gql } from "@apollo/client";

export const CREATE_MANAGE_LINK = gql`mutation CreateManageLink($input: [CreateManageLinkInput!]!) {
    createManageLink(input: $input) {
      _id
      shortLink
      longLink
      status
      createdAt
      updatedAt
      createdBy
      expiredAt
    }
  }`;
