import { Fragment, useEffect } from "react";
import { Box, Button, styled } from "@mui/material";
import PaymentIcon from "assets/images/wallet-checkout.png";
import IconAction from "@mui/icons-material/Payment";

import { ENV_KEYS } from "constants/env.constant";
import { useSubscription } from "@apollo/client";
import { SUBSCRIPTION_TWO_CHECKOUT } from "api/graphql/payment.graphql";
import useAuth from "hooks/useAuth";

const ImageIcon = styled("img")({
  width: "150px",
  height: "150px",
  objectFit: "cover",
});

type Prop = {
  packageId: string;
  handleSuccess?: () => void;
};

function TwoPaymentCheckout({ packageId, handleSuccess }: Prop) {
  const { user: userAuth }: any = useAuth();

  const { data: dataSubscription } = useSubscription(
    SUBSCRIPTION_TWO_CHECKOUT,
    {
      variables: {
        code: userAuth?.email,
      },
      onData: () => {},
    },
  );

  const handleTwoPaymentCheckout = async () => {
    window.open(
      `${ENV_KEYS.VITE_APP_API_URL}/payments/checkout?productCode=${packageId}`,
    );
  };

  useEffect(() => {
    if (dataSubscription) {
      const result = dataSubscription?.twoCheckoutSubscription?.message;
      if (result === "SUCCESS") {
        handleSuccess?.();
      }
    }
  }, [dataSubscription]);

  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ImageIcon src={PaymentIcon} alt="payment-icons" />

          <Box sx={{ marginTop: "2rem" }}>
            <Button variant="contained" onClick={handleTwoPaymentCheckout}>
              <IconAction sx={{ mr: 2 }} /> Payments
            </Button>
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
}

export default TwoPaymentCheckout;
