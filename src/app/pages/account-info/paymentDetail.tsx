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

function PaymentDetail() {
  const params = useParams();
  const { user }: any = useAuth();
  const [querySinglePayment] = useLazyQuery(QUERY_PAYMENT, {
    fetchPolicy: "no-cache",
  });

  const handleQueryPayment = async () => {
    console.log(typeof params?.paymentId, typeof user?._id);
    await querySinglePayment({
      variables: {
        where: {
          _id: params?.paymentId,
          payerId: user?.id,
        },
      },
      onCompleted: (data) => {
        console.log(data?.getPayments.data[0]);
      },
    });
  };

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
            <Typography variant="h5">Payment Id:</Typography>
            <Typography sx={{ fontWeight: 500 }}>Issues Date:</Typography>
            <Typography sx={{ fontWeight: 500 }}>Due Date:</Typography>
          </LeftRightBox>
        </BoxContent>
        <BoxDivider />
        <BoxContent>
          <LeftRightBox>
            <Typography variant="h4">Payment Details</Typography>
            <Typography>Name:</Typography>
            <Typography>Address:</Typography>
            <Typography>Tel:</Typography>
            <Typography>Email:</Typography>
          </LeftRightBox>
          <LeftRightBox></LeftRightBox>
        </BoxContent>
        <BoxContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ borderTop: "1px solid gray" }}>
                  <TableCell>ITEM</TableCell>
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
                    Premium Package
                  </TableCell>
                  <TableCell>Upgrad to premium</TableCell>
                  <TableCell>$32</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>$32</TableCell>
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
            <Typography sx={{ fontWeight: 500 }}>Subtotal:</Typography>
            <Typography sx={{ fontWeight: 500 }}>Discount:</Typography>
            <Typography sx={{ fontWeight: 500 }}>Tax:</Typography>
            <Typography sx={{ fontWeight: 500 }}>Total:</Typography>
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
