import { gql } from "@apollo/client";

export const QUERY_SEARCH_FOLDER_AND_FILE = gql`
  query SearchFolderAndFile($where: SearchFolderAndFilesInput) {
    searchFolderAndFile(where: $where) {
      data {
        _id
        url
        name
        newName
        size
        updatedAt
        createdAt
        type
        parentKey
        type_idFile
        checkTypeItem
        password
        shortUrl
        access_passwordFolder
        parentKey
        check
        path
        newPath
        pin
        favorite
        totalDownloadFile
        createdBy {
          _id
          newName
          newName
          lastName
          email
          firstName
        }
      }
    }
  }
`;
