import { Box } from "@mui/material";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

import { useMutation } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  MUTATION_CREATE_CHECKOUT,
  MUTATION_CREATE_PAYMENT,
} from "api/graphql/payment.graphql";
import { useSettingKey } from "contexts/SettingKeyProvider";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PACKAGE_TYPE,
  paymentState,
  setActiveStep,
  setPaymentStatus,
  setRecentPayment,
} from "stores/features/paymentSlice";
import useAuth from "../../../../../hooks/useAuth";

const CheckoutForm = () => {
  const settingKey: any = useSettingKey();
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const dispatch = useDispatch();
  const paymentSelector: any = useSelector(paymentState);
  const { user, generateNewToken }: any = useAuth();
  const [createCheckout] = useMutation(MUTATION_CREATE_CHECKOUT, {
    fetchPolicy: "no-cache",
  });
  const [createPayment] = useMutation(MUTATION_CREATE_PAYMENT, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (settingKey.data.PUBLIC_KEY_STRIPE) {
      setStripePublicKey(settingKey.data.PUBLIC_KEY_STRIPE);
    }
  }, [settingKey.data]);

  const handleComplete = () => {
    setStripePublicKey("");
    setClientSecret("");
    createPayment({
      variables: {
        input: {
          category: "package",
          type: paymentSelector.activePackageType,
          packageId: paymentSelector.activePackageData.packageId,
          amount:
            paymentSelector.activePackageType === PACKAGE_TYPE.annual
              ? paymentSelector.activePackageData.annualPrice
              : paymentSelector.activePackageData.monthlyPrice,
          payerId: user?._id,
          paymentMethod: "credit_card",
          couponCode: null,
          status: "success",
        },
      },
      onCompleted: (data) => {
        dispatch(setPaymentStatus("success"));
        generateNewToken();
        dispatch(setRecentPayment(data.createPayment));
        dispatch(setActiveStep(3));
      },
    });
  };

  useEffect(() => {
    createCheckout({
      variables: {
        input: {
          category: "package",
          status: "success",
          packageId: paymentSelector.activePackageData.packageId,
          type: paymentSelector.activePackageType,
          payerId: user?._id,
        },
      },
      onCompleted: (data) => {
        setClientSecret(data.checkout.secret);
        dispatch(setPaymentStatus("processing"));
      },
    });
  }, []);

  return (
    <>
      {stripePublicKey && clientSecret && (
        <Box id="checkout">
          <EmbeddedCheckoutProvider
            stripe={loadStripe(stripePublicKey)}
            options={{
              clientSecret: clientSecret,
              onComplete: handleComplete,
            }}
          >
            <EmbeddedCheckout className="embedded-checkout" />
          </EmbeddedCheckoutProvider>
        </Box>
      )}
    </>
  );
};

const StripePayment = () => {
  return <CheckoutForm />;
};

export default StripePayment;
