import { gql } from "@apollo/client";

export const CREATE_ONE_TIME_LINK = gql`mutation CreateOneTimeLink($input: CreateOneTimeLinkInput!) {
    createOneTimeLink(input: $input) {
      _id
      shortLink
      longLink
      status
      createdBy
      password
      expiredAt
    }
  }`;

export const GET_ONE_TIME_LINK = gql`query GetOneTimeLink($where: OneTimeLinkWhereInput) {
  getOneTimeLink(where: $where) {
    code
    message
    data {
      _id
      shortLink
      longLink
      status
      createdAt
      password
    }
  }
}`;

export const BURN_ONE_TIME_LINK = gql`query GetOneTimeLinkDetails($where: OneTimeLinkDetailsWhereInput) {
  getOneTimeLinkDetails(where: $where) {
    code
    message
  }
}`;