import { gql } from "@apollo/client";

export const MUTATION_TOKEN_VALIDATION = gql`
  mutation TokenValidation($where: CheckTokenInput) {
    tokenValidation(where: $where) {
      status
      data
    }
  }
`;

export const MUTATION_REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

export const QUERY_PERMISSION = gql`
  query Permision($where: Role_staffWhereInput) {
    role_staffs(where: $where) {
      data {
        _id
        name
        permision {
          _id
          groupName
          name
          status
        }
      }
    }
  }
`;

export const ADMIN_LOGIN = gql`
  mutation StaffLogin($where: StaffLoginWhere!) {
    staffLogin(where: $where) {
      data {
        _id
        addProfile
        newName
        firstname
        lastname
        username
        gender
        email
        phone
        birthday
        position
        address
        country
        district
        village
        role {
          _id
          name
          status
        }
        status
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const USER_SIGNUP = gql`
  mutation Signup($input: UserInput!) {
    signup(input: $input) {
      _id
    }
  }
`;

export const USER_LOGIN = gql`
  mutation UserLogin($where: userLoginWhere!) {
    userLogin(where: $where) {
      token
      data {
        _id
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
          totalUsed
          textColor
          bgColor
          status
          createdAt
          updatedAt
          lockFile
          lockFolder
        }
        storage
        accountId
        provider
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
        companyID {
          _id
          companyName
        }
        profile
        currentDevice
        newDevice
        twoFactorIsVerified
        twoFactorIsEnabled
        twoFactorQrCode
        twoFactorSecret
        createdAt
        updatedAt
      }
    }
  }
`;

export const QUERY_SINGLE_USER = gql`
  query GetUser(
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
        packageId {
          _id
          packageId
          name
          annualPrice
          monthlyPrice
          category
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
          totalUsed
          textColor
          bgColor
          status
          createdAt
          updatedAt
        }
        accountId
        provider
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
        otpEnabled
        otpVerified
        zipCode
        createdAt
        updatedAt
        companyID {
          _id
          companyName
        }
      }
      total
    }
  }
`;

export const QUERY_STAFF_LOGIN = gql`
  query QueryStaffs($where: StaffWhereInput) {
    queryStaffs(where: $where) {
      total
      data {
        _id
        firstname
        lastname
        gender
        email
        username
        newName
        birthday
        status
        phone
        position
        createdAt
        addProfile
        village
        district
        role {
          _id
          name
          status
        }
        address
      }
    }
  }
`;

export const MUTATION_VERIFY_2FA = gql`
  mutation Validate2FA($input: TwoFactorInput!, $id: ID!) {
    validate2FA(input: $input, ID: $id) {
      _id
    }
  }
`;
export const MUATION_FORGOT_PASS = gql`
  mutation ForgotPassword($email: String!, $captcha: String!) {
    forgotPassword(email: $email, captcha: $captcha) {
      token
    }
  }
`;

export const MUTATION_RESET_PASS = gql`
  mutation ResetPassword(
    $token: String!
    $password: String
    $confirmPassword: String
  ) {
    resetPassword(
      token: $token
      password: $password
      confirmPassword: $confirmPassword
    ) {
      token
    }
  }
`;

export const MUTATION_RESET_FILE_PASSWORD = gql`
  mutation ChangePasswordFolderAndFile(
    $data: FoldersData!
    $where: FoldersForgotInput!
  ) {
    changePasswordFolderAndFile(data: $data, where: $where) {
      status
    }
  }
`;

export const CREATE_LOG = gql`
  mutation CreateLog($input: LogInput!) {
    createLog(input: $input) {
      _id
      refreshID
      name
    }
  }
`;
