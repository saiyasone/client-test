import { gql } from "@apollo/client";

export const MUTATION_CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      _id
      paymentId
      packageId {
        packageId
      }
      paymentMethod
      amount
      description
      status
      createdAt
      updatedAt
      orderedAt
    }
  }
`;

export const QUERY_PAYMENT = gql`
  query GetPayments(
    $where: PaymentWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
    $noLimit: Boolean
  ) {
    getPayments(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
      noLimit: $noLimit
    ) {
      data {
        _id
        paymentId
        packageId {
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
        category
        paymentMethod
        amount
        description
        countPurchase
        status
        createdAt
        updatedAt
        orderedAt
        expiredAt
      }
    }
  }
`;

export const QUERY_ONEPAY_SUBSCRIPTION = gql`
  query OnePaySubscription($where: OnePaySubscriptionWhereInput) {
    onePaySubscription(where: $where) {
      endpoint
      params {
        profile_id
        access_key
        locale
        lang
        transaction_type
        transaction_uuid
        reference_number
        device_fingerprint_id
        amount
        currency
        signed_date_time
        bill_to_forename
        bill_to_surname
        bill_to_email
        bill_to_phone
        bill_to_address_city
        bill_to_address_state
        bill_to_address_line1
        bill_to_address_postal_code
        bill_to_address_line2
        bill_to_address_country
        merchant_defined_data1
        merchant_defined_data2
        signed_field_names
        signature
      }
    }
  }
`;

export const MUTATION_CREATE_CHECKOUT = gql`
  mutation Checkout($input: CreatePaymentInput!) {
    checkout(input: $input) {
      data {
        updatedAt
        type
        status
        paymentMethod
        paymentId
        payerId {
          _id
        }
        _id
        advertisementId {
          _id
        }
        amount
        category
        countPurchase
        createdAt
        description
        expiredAt
        orderedAt
        packageId {
          _id
        }
      }
      secret
    }
  }
`;

export const MUTATION_CREATE_QR_AND_SUBSCRIPTION = gql`
  mutation CreateQrAndSubscribeForPayment($data: PaymentInput!) {
    createQrAndSubscribeForPayment(data: $data) {
      qrCode
    }
  }
`;

export const SUBSCRIPTION_BCEL_ONE_SUBSCRIPTION = gql`
  subscription Subscription($transactionId: String) {
    subscribeBcelOneSubscriptionQr(transactionId: $transactionId) {
      message
      transactionId
    }
  }
`;
