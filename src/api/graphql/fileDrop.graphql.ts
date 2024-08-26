import { gql } from "@apollo/client";

export const MUTATION_CREATE_FILEDROP_URL = gql`
  mutation CreatePublicFileDropUrl($input: PublicFileDropUrlInput) {
    createPublicFileDropUrl(input: $input) {
      _id
    }
  }
`;

export const MUTATION_UPDATE_FILE_DROP_URL = gql`
  mutation UpdateFileDropUrl($id: ID!, $input: UpdateFileDropUrlInput) {
    updateFileDropUrl(ID: $id, input: $input)
  }
`;

export const QUERY_FILE_DROP_PUBLIC = gql`
  query GetFileDrop($where: FilesWhereInput) {
    getFileDrop(where: $where) {
      total
      data {
        _id
        isPublic
        filename
        newFilename
        filePassword
        passwordUrlAll
        fileType
        size
        totalDownload
        totalDownloadFaild
        status
        checkFile
        path
        newPath
        detail
        urlAll
        url
        ip
        favorite
        dropUrl
        dropLink
        dropStatus
        dropExpiredAt
        source
        actionStatus
        expired
        createdAt
        updatedAt
        actionDate
        createdBy {
          _id
          newName
          lastName
          email
          firstName
        }
        getLinkBy
        isDeleted
        uploadStatus
        downloadStatus
        shortUrl
        longUrl
      }
      total
    }
  }
`;

export const QUERY_FILE_DROP_URL_PRIVATE = gql`
  query GetPrivateFileDropUrl(
    $skip: Int
    $limit: Int
    $orderBy: OrderByInput
    $where: PrivateFileDropUrlWhereInput
  ) {
    getPrivateFileDropUrl(
      skip: $skip
      limit: $limit
      orderBy: $orderBy
      where: $where
    ) {
      data {
        _id
        url
        createdAt
        expiredAt
        status
        isPublic
        title
        allowDownload
        allowMultiples
        allowUpload
        description
        folderId {
          _id
          folder_name
        }
      }
      total
    }
  }
`;

export const QUERY_USER_BY_FILE_DROP_URL = gql`
  query GetPublicFileDropUrl($where: PublicFileDropUrlWhereInput) {
    getPublicFileDropUrl(where: $where) {
      total
      data {
        _id
        status
        createdBy {
          _id
          newName
        }
        folderId {
          _id
          newFolder_name
          path
          newPath
        }
        allowDownload
        allowMultiples
        allowUpload
        title
        description
        expiredAt
      }
    }
  }
`;
export const QUERY_GENERAL_BUTTON_DOWNLOADS = gql`
  query Data($where: General_settingsWhereInput) {
    general_settings(where: $where) {
      data {
        action
      }
    }
  }
`;

export const MUTATION_CREATE_FILE_DROP_URL_PRIVATE = gql`
  mutation CreatePrivateFileDropUrl($input: PrivateFileDropUrlInput) {
    createPrivateFileDropUrl(input: $input) {
      _id
      allowDownload
      allowMultiples
      allowUpload
    }
  }
`;

export const MUTATION_DELETE_FILE_DROP_URL = gql`
  mutation DeleteFileDropUrl($id: ID!) {
    deleteFileDropUrl(ID: $id)
  }
`;
