import { useMutation } from "@apollo/client";
import { MUTATION_CREATE_PAYMENT } from "api/graphql/payment.graphql";
import useAuth from "hooks/useAuth";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PACKAGE_TYPE,
  paymentState,
  setActiveStep,
  setPaymentStatus,
  setRecentPayment,
} from "stores/features/paymentSlice";
import { generateUniqueId } from "utils/secure.util";
import useOnePay from "./useOnePay";

const useBcelOnePay = () => {
  const { user, generateNewToken }: any = useAuth();
  const paymentSelector: any = useSelector(paymentState);
  const [createPayment] = useMutation(MUTATION_CREATE_PAYMENT);
  const dispatch = useDispatch();
  const transactionId = generateUniqueId("SBD");
  const [qrCode, setQrCode] = useState("");
  const [link, setLink] = useState("");
  const [_bcelUUID, setBcelUUID] = useState("");
  const onePay = useOnePay();
  const expireTime = 15;
  const aMinute = 60;

  const handleGeneratQrCode = () => {
    if (paymentSelector.activePackageData) {
      const bcelPayDetails = {
        transactionId,
        amount: 1,
        description: "package",
        expireTime,
      };

      const subParams = {
        uuid: transactionId,
        shopcode: null,
        tid: null,
      };

      onePay.subscribe(subParams, (result) => {
        dispatch(setPaymentStatus("processing"));
        if (result.uuid === subParams.uuid) {
          createPayment({
            variables: {
              input: {
                type: paymentSelector.activePackageType,
                packageId: paymentSelector.activePackageData.packageId,
                amount:
                  paymentSelector.activePackageType === PACKAGE_TYPE.annual
                    ? paymentSelector.activePackageData.annualPrice
                    : paymentSelector.activePackageData.monthlyPrice,
                payerId: user?._id,
                paymentMethod: "bcelone",
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
        }
      });
      const generateQrCode = async () => {
        return onePay.getCode(bcelPayDetails, async (code) => {
          setBcelUUID(transactionId);
          setQrCode(
            `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${code}&choe=UTF-8`,
          );
          setLink(`onepay://qr/${code}`);
        });
      };
      generateQrCode();
    }
  };

  useEffect(() => {
    handleGeneratQrCode();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      onePay.stop();
      handleGeneratQrCode();
    }, expireTime * aMinute * 1000 + 1);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return {
    qrCode,
    link,
  };
};

export default useBcelOnePay;
