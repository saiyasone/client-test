import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { paymentState, PAYMENT_METHOD, COUNTRIES } from "stores/features/paymentSlice";
import PackagePlan from "./PackagePlan";
import PricingDetail from "./PricingDetail";
import { func_exchange_calc } from "utils/exchange.calc";

const PackageDetailsContainer = styled("div")({
  borderRadius: "4px",
  border: "1px solid #DBDADE",
});

const PackageDetailsItem = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(4),
  rowGap: "16px",
}));

const PackageDetailsContentItem = styled("div")(({ theme }) => ({
  display: "flex",
  rowGap: 0.5,
  padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
}));

const PackageDetails = (props) => {
  const { currencySymbol, exchangeRate, country, activePaymentMethod, addressData, ...paymentSelector }: any =
    useSelector(paymentState);

  const totalPrice = `${currencySymbol}${(
    country === COUNTRIES.LAOS && activePaymentMethod === PAYMENT_METHOD.bcelOne ? 
      (func_exchange_calc(currencySymbol,paymentSelector.total, exchangeRate) - func_exchange_calc(currencySymbol,paymentSelector.couponAmount, exchangeRate))
    : 
    (paymentSelector.total - paymentSelector.couponAmount)
  ).toLocaleString()}`;

  return (
    <PackageDetailsContainer>
      <PackageDetailsItem>
        <Typography
          component="div"
          sx={{
            fontWeight: 600,
          }}
        >
          Package Plans
        </Typography>
        <PackageDetailsContentItem
          sx={{
            flexDirection: "column",
          }}
        >
          <PackagePlan />
        </PackageDetailsContentItem>
        {props.isPayment && (
          <>
            <PackageDetailsContentItem sx={{justifyContent: 'space-between !important', gap: "5px !important"}}>
              <Typography
                variant="h6"
                className="title"
                sx={{
                  fontWeight: 600,
                }}
              >
                Total
              </Typography>
              <Typography component="div" className="context" variant="h6" >
                {totalPrice}
              </Typography>
            </PackageDetailsContentItem>
            <PackageDetailsContentItem>
              <Typography
                variant="body1"
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <span>
                  {addressData.first_name} {addressData.last_name}
                  {addressData.tel && `, ${addressData.tel}`}
                </span>
                <span>{addressData.email}</span>
              </Typography>
            </PackageDetailsContentItem>
          </>
        )}
        {props.isAddress && <PricingDetail />}
      </PackageDetailsItem>
    </PackageDetailsContainer>
  );
};

export default PackageDetails;
