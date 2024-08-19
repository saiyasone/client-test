import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  paymentState, 
  setCountry, 
  setPaymentSteps, 
  setExchangeRate, 
  COUNTRIES, 
  setCurencySymbol, 
  CURRENCIES, 
  PAYMENT_METHOD 
} from "stores/features/paymentSlice";
import Offer from "../Offer";
import PackageDetail from "../PackageDetail";
import PaymentMethod from "./payment/PaymentMethod";
import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import { BCEL_EXCHANGE_RATE } from "api/graphql/payment.graphql";
import { useLazyQuery } from "@apollo/client";


const PaymentContainer = styled("div")({});

const PaymentFormWrapper = styled("div")({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  rowGap: 16,
});

const PackageDetailsWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const Payment: React.FC<any> = () => {
  const dispatch = useDispatch();
  const paymentSelector = useSelector(paymentState);
  const [XChangeRate] = useLazyQuery(BCEL_EXCHANGE_RATE);

  useEffect(() => {
    dispatch(
      setPaymentSteps({
        number: 2,
        value: true,
      }),
    );
  }, []);

  useEffect(()=>{
    const getClientAddress = async() => {
      try {
          const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);
          const ip = responseIp?.data;
          if(ip === '202.137.134.195' && paymentSelector.activePaymentMethod === PAYMENT_METHOD.bcelOne){
            dispatch(
              setCountry(COUNTRIES.LAOS),
            );

            dispatch(
              setCurencySymbol(CURRENCIES.KIP)
            );
          }
      } catch (error) {
        return false;
      }
    }

    getClientAddress();

  }, [paymentSelector.country, paymentSelector.currencySymbol, paymentSelector.activePaymentMethod])

  useEffect(()=>{
    const getExchangeRate = async() => {
      await XChangeRate().then((data: any)=>{
        if(data?.data && data?.data?.bceloneLoadExchangeRate?.result_code === 200){
          const rate = data?.data?.bceloneLoadExchangeRate?.info?.rows[0]?.Sell_Rates;
          if(rate> 0){
            dispatch(
              setExchangeRate(rate)
            );
          }
        }
      })
    };

    getExchangeRate();
  }, [paymentSelector.exchangeRate])
  
  return (
    <PaymentContainer>
      <Grid container spacing={5}>
        <Grid item md={9} sm={12}>
          <PaymentFormWrapper>
            <Offer
              title="Bank Offer"
              context={
                <>
                  <div>
                    - 10% Instant Discount on Bank of America Corp Bank Debit
                    and Credit cards
                  </div>
                </>
              }
            />

            {!paymentSelector.paymentSteps[3] ? (
              <>
                {paymentSelector?.activePaymentMethod === "" ? (
                  <></>
                ) : (
                  <Fragment>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      You can choose a payment method
                    </Typography>
                    <PaymentMethod />
                  </Fragment>
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  Expired session
                </Typography>
                <div>Your payment has already been processed.</div>
              </Box>
            )}
          </PaymentFormWrapper>
        </Grid>
        <Grid item md={3} sm={12}>
          <PackageDetailsWrapper>
            <PackageDetail isPayment />
          </PackageDetailsWrapper>
        </Grid>
      </Grid>
    </PaymentContainer>
  );
};

export default Payment;
