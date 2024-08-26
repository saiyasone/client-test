import { gql } from "@apollo/client";

export const QUERY_USER = gql`
  query QUERY_USER(
    $where: UserWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
  ) {
    getUser(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
    ) {
      data {
        _id
        accountId
        provider
        packageId {
          _id
          packageId
          name
          category
          annualPrice
          monthlyPrice
          discount
          description
          storage
          ads
          captcha
          multipleUpload
          numberOfFileUpload
          uploadPerDay
          fileUploadPerDay
          maxUploadSize
          multipleDownload
          downLoadOption
          support
          sort
          type
          totalUsed
          textColor
          bgColor
          status
          createdAt
          updatedAt
          lockFile
          lockFolder
        }
        firstName
        lastName
        gender
        phone
        email
        username
        newName
        address
        state
        zipCode
        country
        ip
        device
        browser
        status
        profile
        currentDevice
        newDevice
        twoFactorSecret
        twoFactorQrCode
        twoFactorIsEnabled
        twoFactorIsVerified
        createdAt
        updatedAt
        lastLoggedInAt
        codeAnonymous
        anonymousExpired
        storage
        countryId {
          _id
          name
        }
      }
      total
    }
  }
`;

export const MUTATION_CHANGE_USER_PASSWORD = gql`
  mutation ChangePassword($id: ID!, $body: ChangePasswordInput!) {
    changePassword(ID: $id, body: $body)
  }
`;

export const MUTATION_UPDATE_USER = gql`
  mutation UpdateUser($body: UpdateUserInput!, $id: ID!) {
    updateUser(body: $body, ID: $id) {
      _id
    }
  }
`;
