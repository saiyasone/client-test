import { gql } from "@apollo/client";

export const QUERY_PACKAGE = gql`
  query Data(
    $noLimit: Boolean
    $limit: Int
    $skip: Int
    $orderBy: OrderByInput
    $where: PackageWhereInput
  ) {
    getPackage(
      noLimit: $noLimit
      limit: $limit
      skip: $skip
      orderBy: $orderBy
      where: $where
    ) {
      data {
        _id
        packageId
        name
        category
        annualPrice
        monthlyPrice
        currencyId {
          _id
        }
        discount
        description
        storage
        ads
        captcha
        fileDrop
        multipleUpload
        numberOfFileUpload
        uploadPerDay
        fileUploadPerDay
        maxUploadSize
        multipleDownload
        downLoadOption
        support
        batchDownload
        unlimitedDownload
        customExpiredLink
        downloadFolder
        remoteUpload
        sort
        totalUsed
        status
        createdAt
        updatedAt
        createdBy {
          firstName
          lastName
        }
      }
      total
    }
  }
`;

export const QUERY_PUBLIC_PACKAGES = gql`
  query GetPublicPackages(
    $where: PackageWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
  ) {
    getPublicPackages(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
    ) {
      data {
        _id
        packageId
        name
        category
        annualPrice
        monthlyPrice
        currencyId {
          _id
        }
        discount
        description
        storage
        ads
        captcha
        fileDrop
        multipleUpload
        numberOfFileUpload
        uploadPerDay
        fileUploadPerDay
        maxUploadSize
        multipleDownload
        downLoadOption
        support
        batchDownload
        unlimitedDownload
        customExpiredLink
        downloadFolder
        remoteUpload
        iosApplication
        androidApplication
        sort
        totalUsed
        textColor
        bgColor
        status
        createdAt
        updatedAt
        createdBy {
          firstName
          lastName
        }
      }
      total
    }
  }
`;
