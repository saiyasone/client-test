import { gql } from "@apollo/client";

export const MUTATION_FORGET_FILE_PASSWORD = gql`
  mutation ForgotPasswordFolderAndFile($data: FoldersForgotInput!) {
    forgotPasswordFolderAndFile(data: $data) {
      status
    }
  }
`;

export const MUTATION_REMOVE_FILE_PASSWORD = gql`
  mutation RemovePasswordFolderAndFile(
    $data: FoldersRemoveData!
    $where: FoldersForgotInput!
  ) {
    removePasswordFolderAndFile(data: $data, where: $where) {
      status
    }
  }
`;

export const QUERY_DELETED_SUB_FOLDER_FILE = gql`
  query QueryDeleteSubFolderAndFile(
    $orderBy: OrderByFolderAndFileInput
    $where: FolderAndFilesInput
  ) {
    queryDeleteSubFolderAndFile(orderBy: $orderBy, where: $where) {
      total
      data {
        _id
        check
        checkTypeItem
        detailFile
        parentKey
        status
        totalItems
        type
        type_idFile
        isPublicFile
        name
        newName
        path
        newPath
        access_passwordFolder
        expiredFile
        downloadByFile
        show_download_linkFolder
        size
        totalDownloadFile
        filePassword
        createdAt
        createdBy {
          _id
        }
        updatedAt
        updatedBy {
          _id
        }
        uploadByFile
      }
    }
  }
`;
