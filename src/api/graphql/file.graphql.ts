import { gql } from "@apollo/client";

export const QUERY_FILE = gql`
  query GetFile(
    $where: FilesWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
  ) {
    files(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
    ) {
      data {
        _id
        folder_id {
          _id
        }
        filename
        newFilename
        filePassword
        passwordUrlAll
        fileType
        size
        totalDownload
        totalDownloadFaild
        downloadBy {
          _id
        }
        uploadBy {
          _id
        }
        status
        isPublic
        checkFile
        path
        newPath
        detail
        urlAll
        url
        restore
        permissionSharePublic
        aproveDownloadPublic
        ip
        favorite
        dropUrl
        dropLink
        dropStatus
        dropExpiredAt
        device
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
        updatedBy {
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

export const QUERY_FILE_CATEGORY = gql`
  query GetFileCategoryDetails(
    $where: FileCategoryDetailInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
    $request: Request
  ) {
    getFileCategoryDetails(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
      request: $request
    ) {
      total
      data {
        _id
        filename
        newFilename
        filePassword
        passwordUrlAll
        fileType
        size
        totalDownload
        totalDownloadFaild
        status
        isPublic
        checkFile
        path
        newPath
        detail
        urlAll
        url
        permissionSharePublic
        aproveDownloadPublic
        ip
        favorite
        actionStatus
        expired
        createdAt
        updatedAt
        actionDate
        shortUrl
        createdBy {
          _id
          email
          newName
        }
      }
    }
  }
`;

export const QUERY_RECENT_FILE = gql`
  query GetRecentFile(
    $orderBy: OrderByInput
    $where: FilesWhereInput
    $limit: Int
  ) {
    getRecentFile(orderBy: $orderBy, where: $where, limit: $limit) {
      data {
        _id
        filename
        totalDownload
        newFilename
        fileType
        detail
        size
        url
        actionStatus
        filePassword
        actionDate
        favorite
        expired
        path
        createdAt
        actionStatus
        actionDate
        updatedAt
        shortUrl
        path
        newPath
        createdBy {
          _id
          email
          username
          newName
        }
        folder_id {
          _id
          path
          folder_type
          folder_name
        }
      }
      total
    }
  }
`;

export const CREATE_FILE_PUBLIC = gql`
  mutation CreateFilesPublic($data: FilesInput!) {
    createFilesPublic(data: $data) {
      _id
      urlAll
      newFilename
    }
  }
`;

export const CREATE_FILE_PUBLIC_DROP = gql`
  mutation CreatePublicFileDrop($data: CreatePublicFileDropInput!) {
    createPublicFileDrop(data: $data) {
      _id
      urlAll
      newFilename
    }
  }
`;

export const MUTATION_UPDATE_FILE_PUBLIC = gql`
  mutation UpdateFilesPublic($data: FilesInput!, $where: FilesWhereInputOne!) {
    updateFilesPublic(data: $data, where: $where) {
      _id
    }
  }
`;

export const QUERY_FILE_PUBLIC = gql`
  query FilesPublic(
    $where: FilesWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
  ) {
    filesPublic(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
    ) {
      total
      data {
        _id
        filename
        newFilename
        filePassword
        passwordUrlAll
        fileType
        size
        newPath
        totalDownload
        status
        isPublic
        checkFile
        path
        detail
        urlAll
        url
        permissionSharePublic
        aproveDownloadPublic
        ip
        folder_id {
          _id
          path
          folder_name
        }
        shortUrl
        favorite
        actionStatus
        expired
        createdAt
        updatedAt
        actionDate
      }
    }
  }
`;

export const QUERY_FILE_PUBLIC_LINK = gql`
  query QueryFileGetLinks($where: FilesWhereInput) {
    queryFileGetLinks(where: $where) {
      data {
        _id
        filename
        filePassword
        newFilename
        passwordUrlAll
        checkFile
        expired
        size
        status
        path
        newPath
        url
        urlAll
        createdBy {
          _id
          newName
        }
      }
      total
    }
  }
`;

export const MUTATION_UPDATE_RECENT_FILE = gql`
  mutation UpdateFiles($data: FilesInput!, $where: FilesWhereInputOne!) {
    updateFiles(data: $data, where: $where) {
      _id
    }
  }
`;

export const MUTATION_COPY_FILE = gql`
  mutation CopyFiles($pathFile: PathFile!) {
    copyFiles(PathFile: $pathFile) {
      status
    }
  }
`;

export const MUTATION_CREATE_SHORT_LINK = gql`
  mutation CreateManageLink($input: [CreateManageLinkInput!]!) {
    createManageLink(input: $input) {
      _id
      shortLink
    }
  }
`;

export const MUTATION_ACTION_FILE = gql`
  mutation ActionFiles($fileInput: actionFileInput) {
    actionFiles(fileInput: $fileInput)
  }
`;

export const MUTATION_DELETE_FILE_FOREVER = gql`
  mutation DeleteFilesTrash($id: [ID!]) {
    deleteFilesTrash(ID: $id)
  }
`;

export const MUTATION_DELETE_FILE = gql`
  mutation DeleteFiles($id: [ID!]) {
    deleteFiles(ID: $id)
  }
`;

export const MUTATION_CREATE_FILE = gql`
  mutation CreateFiles($data: FilesInput!) {
    createFiles(data: $data) {
      _id
      path
    }
  }
`;

export const MUTATION_UPDATE_FILE = gql`
  mutation UpdateFiles($data: FilesInput!, $where: FilesWhereInputOne!) {
    updateFiles(data: $data, where: $where) {
      _id
      filename
      newFilename
      filePassword
      passwordUrlAll
      fileType
      size
      totalDownload
      status
      isPublic
      checkFile
      path
      detail
      urlAll
      url
      permissionSharePublic
      aproveDownloadPublic
      ip
      favorite
      actionStatus
      expired
      createdAt
      updatedAt
      actionDate
    }
  }
`;
