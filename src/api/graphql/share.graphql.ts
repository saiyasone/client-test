import { gql } from "@apollo/client";

export const QUERY_SHARE = gql`
  query GetShare(
    $where: ShareWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
  ) {
    getShare(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
    ) {
      data {
        _id
        isShare
        size
        item
        ownerId {
          _id
          email
          newName
          firstName
          lastName
        }
        fileId {
          _id
          filename
          isPublic
          favorite
          size
          url
          fileType
          totalDownload
          shortUrl
          newFilename
          path
          newPath
          updatedAt
          createdAt
          filePassword
          status
        }
        folderId {
          folder_name
          _id
          folder_type
          file_id {
            _id
            filename
            size
          }
          newFolder_name
          total_size
          is_public
          checkFolder
          status
          shortUrl
          path
          newPath
          url
          pin
          access_password
          updatedAt
        }
        createdAt
        fromAccount {
          _id
          username
          email
          newName
        }
        toAccount {
          _id
          email
          username
          firstName
          lastName
        }
        accessKey
        isPublic
        status
        permission
        accessedAt
        expiredAt
        createdBy {
          _id
          email
          username
        }
      }
      total
    }
  }
`;

export const MUTATION_CREATE_SHARE = gql`
  mutation CreateShare($body: ShareInput) {
    createShare(body: $body) {
      _id
    }
  }
`;

export const MUTATION_DELETE_SHARE = gql`
  mutation DeleteShare($id: ID!, $email: String!) {
    deleteShare(ID: $id, email: $email)
  }
`;

export const MUTATION_UPDATE_SHARE = gql`
  mutation UpdateShare($id: ID!, $body: UpdateShareInput) {
    updateShare(ID: $id, body: $body)
  }
`;

export const MUTATION_CREATE_SHARE_FROM_SHARING = gql`
  mutation HandleOnlyShare($body: OnlyShareInput) {
    handleOnlyShare(body: $body) {
      _id
    }
  }
`;
