import { gql } from "@apollo/client";

export const QUERY_FOLDER = gql`
  query GetFolder(
    $where: FoldersWhereInput
    $orderBy: OrderByInput
    $limit: Int
    $skip: Int
    $noLimit: Boolean
  ) {
    folders(
      where: $where
      orderBy: $orderBy
      limit: $limit
      skip: $skip
      noLimit: $noLimit
    ) {
      total
      data {
        _id
        folder_name
        total_size
        folder_type
        checkFolder
        newFolder_name
        access_password
        shortUrl
        url
        path
        newPath
        pin
        createdBy {
          _id
          email
          username
          newName
          firstName
          lastName
        }
        file_id {
          _id
          filename
          size
          status
        }
        parentkey {
          _id
        }
        updatedAt
      }
    }
  }
`;

export const QUERY_FILE_CSV = gql`
  query ExportMultipleShortUrl($id: ID!) {
    exportMultipleShortUrl(ID: $id) {
      total
      data {
        _id
        filename
        shortUrl
        size
        createdAt
        status
      }
    }
  }
`;

export const MUTATION_CREATE_FOLDER = gql`
  mutation CreateFolders($data: FoldersInput!) {
    createFolders(data: $data) {
      _id
    }
  }
`;

export const MUTATION_UPLOAD_FOLDER = gql`
  mutation UploadFolder($data: UploadFolderInput!) {
    uploadFolder(data: $data) {
      _id
      status
      path {
        newPath
        path
      }
    }
  }
`;

export const MUTATION_CANCEL_UPLOAD_FOLDER = gql`
  mutation DeleteFoldersOutStatus($where: FoldersWhereInputOne!) {
    deleteFoldersOutStatus(where: $where) {
      _id
    }
  }
`;

export const MUTATION_UPDATE_FOLDER = gql`
  mutation UpdateFolders($data: FoldersInput!, $where: FoldersWhereInputOne!) {
    updateFolders(data: $data, where: $where) {
      _id
    }
  }
`;

export const MUTATION_UPDATE_EXPORT_LINK = gql`
  mutation UpdateStatusFolderExportLink(
    $data: FoldersInput!
    $where: WhereExport!
  ) {
    updateStatusFolderExportLink(data: $data, where: $where) {
      status
    }
  }
`;

export const QUERY_FOLDER_PUBLIC = gql`
  query QueryFolderPublic($where: FoldersWhereInput) {
    queryFolderPublic(where: $where) {
      total
      data {
        _id
        folder_type
        folder_name
        newFolder_name
        total_size
        newPath
        is_public
        checkFolder
        restore
        access_password
        show_download_link
        status
        path
        url
        expired
        file_id {
          _id
          filename
          size
        }
        permissionSharePublic
        aproveDownloadPublic
        pin
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const MUTATION_DELETE_FOLDER_TRASH = gql`
  mutation DeleteFoldersTrash($where: FoldersWhereInputOne!) {
    deleteFoldersTrash(where: $where) {
      _id
    }
  }
`;

export const QUERY_FOLDER_PUBLIC_LINK = gql`
  query QueryfoldersGetLinks($where: FoldersWhereInput) {
    queryfoldersGetLinks(where: $where) {
      total
      data {
        _id
        folder_name
        total_size
        access_password
        folder_type
        checkFolder
        newFolder_name
        url
        status
        path
        newPath
        pin
        createdBy {
          _id
          email
          username
          newName
        }
        updatedAt
      }
    }
  }
`;
