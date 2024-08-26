import { Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { COUNTRIES, PACKAGE_TYPE, PAYMENT_METHOD, paymentState } from "stores/features/paymentSlice";
import { func_exchange_calc } from "utils/exchange.calc";

const PackagePlan = () => {
  const { currencySymbol, country, exchangeRate, activePaymentMethod, ...paymentSelector }: any = useSelector(paymentState);
  const theme = useTheme();
  const [actualPrice, setActualPrice] = useState<string>('');

  const currentPackageType = paymentSelector.activePackageType;
  const packagePrice =
    (currentPackageType === PACKAGE_TYPE.annual
      ? paymentSelector.activePackageData.annualPrice
      : paymentSelector.activePackageData.monthlyPrice) || 0;

  useEffect(()=>{
    if(packagePrice && packagePrice > 0){
      const price  = `${currencySymbol}${(
        country === COUNTRIES.LAOS && activePaymentMethod === PAYMENT_METHOD.bcelOne ? 
        (func_exchange_calc(currencySymbol, paymentSelector.total, exchangeRate) -func_exchange_calc(currencySymbol, paymentSelector.couponAmount, exchangeRate))
        : 
        (paymentSelector.total - paymentSelector.couponAmount)
      ).toLocaleString()}`;


      setActualPrice(price ?? packagePrice);
    }
  },[actualPrice, country, exchangeRate, activePaymentMethod])

  return (
    <>
      <Typography
        className="package-plan-title"
        variant="h6"
        sx={{
          fontWeight: 600,
        }}
      >
        {currentPackageType === PACKAGE_TYPE.annual ? (
          <>
            Annual&nbsp;
            <span
              style={{
                color: theme.palette.primaryTheme!.main,
              }}
            >
              (Save up to 10%)
            </span>
          </>
        ) : (
          <>Manual</>
        )}
      </Typography>
      <Typography variant="body1">
        Standard - For small to medium businesses
      </Typography>
      <Typography variant="body1" fontSize={13}>
        {/* <span
          style={{
            color: theme.palette.primaryTheme.brown(0.5),
            textDecoration: "line-through",
            textDecorationColor: theme.palette.primaryTheme.brown(0.5),
          }}
        >
          $49
        </span> */}
        {actualPrice}
        {currentPackageType === PACKAGE_TYPE.annual ? " x 1 year" : " x 1 month"}
      </Typography>
    </>
  );
};

export default PackagePlan;
