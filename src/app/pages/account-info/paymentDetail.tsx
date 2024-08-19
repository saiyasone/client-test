import { useLazyQuery } from "@apollo/client";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import { QUERY_PAYMENT } from "api/graphql/payment.graphql";
import useAuth from "hooks/useAuth";
import React, { Fragment } from "react";
import { useParams } from "react-router-dom";
import VshareLogo from "../../../assets/images/vshare.png";
import { DateTimeFormate } from "utils/date.util";
import { prettyNumberFormat } from "utils/number.util";

const ContainerQRContent = styled(Paper)({
  padding: "1.5rem",
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
  marginTop: "2rem",
});

const BoxContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const LeftRightBox = styled(Box)({
  display: "flex",
  alignItems: "start",
  justifyContent: "start",
  flexDirection: "column",
  gap: 4,
  color: "#4B465C",
  padding: "2rem",
});

const BoxDivider = styled(Box)({
  borderBottom: "1px solid gray",
});

interface PackageDetails {
  _id: string;
  packageId: string;
  name: string;
  category: string;
  annualPrice: number;
  description: string;
  // Add any other fields that might be part of the package details
}

interface PayerDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface PaymentData {
  amount: number;
  category: string;
  countPurchase: number;
  createdAt: string;
  description: string;
  expiredAt: string;
  orderedAt: string;
  packageId: PackageDetails;
  payerId: PayerDetails;
  paymentId: string;
  paymentMethod: string;
  status: string;
  updatedAt: string;
  _id: string;
}

function PaymentDetail() {
  const params = useParams();
  const { user }: any = useAuth();
  const [paymentData, setPaymentData] = React.useState<PaymentData>({
    amount: 0,
    category: "",
    countPurchase: 0,
    createdAt: "",
    description: "",
    expiredAt: "",
    orderedAt: "",
    packageId: {
      _id: "",
      packageId: "",
      description: "",
      name: "",
      category: "",
      annualPrice: 0,
    },
    payerId: {
      _id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
    paymentId: "",
    paymentMethod: "",
    status: "",
    updatedAt: "",
    _id: "",
  });
  const [querySinglePayment] = useLazyQuery(QUERY_PAYMENT, {
    fetchPolicy: "no-cache",
  });

  const handleQueryPayment = async () => {
    await querySinglePayment({
      variables: {
        where: {
          _id: params?.paymentId,
          payerId: user?.id,
        },
      },
      onCompleted: (data) => {
        setPaymentData(data?.getPayments.data[0]);
      },
    });
  };

  const discont = 1;
  const tax = 1;

  React.useEffect(() => {
    handleQueryPayment();
  }, []);

  return (
    <Fragment>
      <ContainerQRContent elevation={5}>
        <BoxContent>
          <LeftRightBox>
            <Box>
              <img src={VshareLogo} alt="" style={{ width: "150px" }} />
            </Box>
            <Typography sx={{ fontWeight: 500 }}>
              NongNieng, Saysettha, Vientiane Capital{" "}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              Tel: +856 20 55315558
            </Typography>
          </LeftRightBox>
          <LeftRightBox>
            <Typography variant="h5">
              Payment Id: {paymentData?.paymentId}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              Issues Date: {DateTimeFormate(paymentData?.createdAt)}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              Due Date:{DateTimeFormate(paymentData?.expiredAt)}
            </Typography>
          </LeftRightBox>
        </BoxContent>
        <BoxDivider />
        <BoxContent>
          <LeftRightBox>
            <Typography variant="h4">Payment Details</Typography>
            <Typography>
              Name: {paymentData?.payerId?.firstName}&nbsp;
              {paymentData?.payerId?.lastName}
            </Typography>
            <Typography>Address: {paymentData?.payerId?.address}</Typography>
            <Typography>Tel: {paymentData?.payerId?.phone}</Typography>
            <Typography>Email: {paymentData?.payerId?.email}</Typography>
          </LeftRightBox>
          <LeftRightBox></LeftRightBox>
        </BoxContent>
        <BoxContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ borderTop: "1px solid gray" }}>
                  <TableCell>ITEM</TableCell>
                  <TableCell>PAYMENT METHOD</TableCell>
                  <TableCell>DESCRIPTION</TableCell>
                  <TableCell>COST</TableCell>
                  <TableCell>QTY</TableCell>
                  <TableCell>PAYMENT DATE</TableCell>
                  <TableCell>TOTAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {paymentData?.packageId?.name} Plan
                  </TableCell>
                  <TableCell>{paymentData?.paymentMethod}</TableCell>
                  <TableCell>{paymentData?.description}</TableCell>
                  <TableCell>
                    ${prettyNumberFormat(paymentData?.amount)}
                  </TableCell>
                  <TableCell>{paymentData?.countPurchase}</TableCell>
                  <TableCell>
                    {DateTimeFormate(paymentData?.createdAt)}
                  </TableCell>
                  <TableCell>
                    $
                    {prettyNumberFormat(
                      paymentData?.amount * paymentData?.countPurchase,
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </BoxContent>
        <BoxDivider sx={{ marginTop: "3rem" }} />
        <BoxContent>
          <LeftRightBox>
            <Typography sx={{ fontWeight: 500 }}>
              Thank you for you purchase.
            </Typography>
          </LeftRightBox>
          <LeftRightBox>
            <Typography sx={{ fontWeight: 500 }}>
              Subtotal: $
              {prettyNumberFormat(
                paymentData?.amount * paymentData?.countPurchase,
              )}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              Discount: ${prettyNumberFormat(discont)}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              Tax: ${prettyNumberFormat(tax)}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              Total: $
              {prettyNumberFormat(
                paymentData?.amount * paymentData?.countPurchase +
                  discont +
                  tax,
              )}
            </Typography>
          </LeftRightBox>
        </BoxContent>
        <BoxDivider />
        <BoxContent sx={{ marginTop: "1rem 2rem", padding: "2rem" }}>
          <Typography sx={{ fontWeight: 500 }}>
            <strong>Note:</strong> It was a pleasure working with you and your
            team. We hope you will keep us in mind for future freelance
            projects. Thank You!
          </Typography>
        </BoxContent>
      </ContainerQRContent>
    </Fragment>
  );
}

export default PaymentDetail;
