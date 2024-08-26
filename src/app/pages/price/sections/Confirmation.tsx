import {useNavigate} from 'react-router-dom'
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import moment from "moment/moment";
import { useEffect } from "react";
import { BiTimeFive } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { paymentState, resetPayment, setPaymentSteps } from "stores/features/paymentSlice";
import PackagePlan from "../PackagePlan";
import NormalButton from "components/NormalButton";

const ConfirmationContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: 32,
});

const ContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  rowGap: 32,
  padding: theme.spacing(6),
  borderRadius: 4,
  border: "1px solid #DBDADE",
}));

const ContentWrapperRow = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: 'space-between',
  rowGap: 32,
  padding: theme.spacing(0),
}));

const Confirmation: React.FC<any> = (_props) => {
  const navigate = useNavigate();
  const { currencySymbol, addressData, ...paymentSelector }: any =
    useSelector(paymentState);
  const totalPrice = `${currencySymbol}${(
    paymentSelector.total - paymentSelector.couponAmount
  ).toLocaleString()}`;
  const dispatch = useDispatch();

  

  useEffect(() => {
    dispatch(
      setPaymentSteps({
        number: 3,
        value: true,
      }),
    );
  }, []);

  return (
    <ConfirmationContainer
      sx={{
        mx: 10,
        mb: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 4,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
          }}
        >
          Thank You! 😇
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            paddingY:2,
            paddingX: 5,
            marginY: 2,
            borderRadius: 10,
            backgroundColor: paymentSelector.paymentStatus.includes('succeeded') ? 'rgb(0, 128, 34,0.2)' : 'rgb(255,0,0,0.2)',
            color: paymentSelector.paymentStatus.includes('succeeded') ? 'rgb(0, 128, 34,1)' : 'rgb(255,0,0,1)'
          }}
        >
          {paymentSelector.paymentStatus}
          
        </Typography>
        <Typography variant="body1">
          Your order <b>#{paymentSelector.recentPayment?.paymentId || paymentSelector.recentPayment?.transactionId}</b> has been
          placed!
        </Typography>
        <div>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
            }}
          >
            Thank you for your purchase! Your package includes access to Vshare
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
            }}
          >
            detail: I have sent the payment slip and package details to your
            email. Please let me know if you have any questions or concerns.
          </Typography>
        </div>
        <Typography
          variant="body1"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <BiTimeFive />
          <span
            style={{
              fontWeight: 600,
            }}
          >
            Time placed
          </span>
          :{" "}
          {paymentSelector.recentPayment?.orderedAt &&
            moment(paymentSelector.recentPayment?.orderedAt).format(
              "DD-MM-YYYY h:mm A",
            )}
        </Typography>
      </Box>
      <ContentWrapper>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
          }}
        >
          Package Plans
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 2,
          }}
        >
          <PackagePlan />
        </Box>
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Typography
            variant="h6"
            className="title"
            sx={{
              mr: 20,
              fontWeight: 600,
            }}
          >
            Total
          </Typography>
          <Typography className="context" variant="h6">
            {totalPrice}
          </Typography>
        </Box>
      </ContentWrapper>
      <ContentWrapperRow>
        <ContentWrapper>
          <Typography
            variant="body1"
            sx={{ display: "flex", flexDirection: "column"}}
          >
            <span>
              {addressData.first_name} {addressData.last_name}
              {addressData.tel && `, ${addressData.tel}`}
            </span>
            <span>{addressData.email}</span>
          </Typography>
        </ContentWrapper>
        <NormalButton
          onClick={()=>{dispatch(resetPayment()); navigate('/pricing')}}
          sx={{
            marginTop: 3,
              width: "auto",
              height: "35px",
              padding: (theme) => `${theme.spacing(2)} ${theme.spacing(10)}`,
              borderRadius: (theme) => theme.spacing(1),
              backgroundColor: (theme) => theme.palette.primaryTheme.main,
              textAlign: "center",
              display: "block",
              color: "white !important",
              ml: 5,
              mb: 5,
              mt: 'auto'
            }}
        >
            Finish
        </NormalButton>
      </ContentWrapperRow>
    </ConfirmationContainer>
  );
};

export default Confirmation;
