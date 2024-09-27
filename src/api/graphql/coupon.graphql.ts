import { gql } from "@apollo/client";

export const QUERY_COUPON = gql`
  query Data($where: CouponWhereInput) {
    coupons(where: $where) {
      data {
        _id
        verifyCustomerID {
          _id
        }
        code
        amount
        status
        createdAt
        updatedAt
        verifyDate
        typeCouponID {
          _id
          typeCoupon
          startDate
          expird
          actionCoupon
          unit
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const USE_COUPON = gql`
  mutation UseCouponEvent($input: IUseCouponEvent!) {
    useCouponEvent(input: $input) {
      info {
        bill
      }
      message
      result_code
      status
    }
  }
`;
