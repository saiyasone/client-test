import { useMutation } from "@apollo/client";
import { MUTATION_CREATE_QR_AND_SUBSCRIPTION } from "api/graphql/payment.graphql";
import { clientMockup } from "main";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { paymentState } from "stores/features/paymentSlice";

const useBcelSubscirption = () => {
  const { addressData, activePackageData, total, activePaymentMethod } =
    useSelector(paymentState);
  const [createQrAndSubscription] = useMutation(
    MUTATION_CREATE_QR_AND_SUBSCRIPTION,
    {
      client: clientMockup,
    },
  );

  const [qrCode, setQrCode] = useState<string>("");
  const [platform, setPlatform] = useState("ANDROID");
  const [link, setLink] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const userAgent = navigator.userAgent;

  useEffect(() => {
    if (userAgent.match(/iPhone|iPad|iPod/i)) {
      setPlatform("IOS");
    }
  }, [userAgent]);

  useEffect(() => {
    console.log({
      bcelPaylaod: {
        amount: total,
        card: "BCEL",
        category: "package",
        description:
          activePackageData.description?.substring(0, 25)?.replace(/\s/g, "") +
          "...",
        packageId: activePackageData?.packageId,
        paymentMethod: "bcelone",
        service: "BCELONE_PAY",
        status: "success",
        type: "monthly",
        platform,
      },
    });

    createQrAndSubscription({
      variables: {
        data: {
          amount: total,
          card: "BCEL",
          category: "package",
          description: activePackageData?.description?.substring(1, 5),
          packageId: activePackageData?.packageId,
          paymentMethod: "bcelone",
          service: "BCELONE_PAY",
          status: "success",
          type: "monthly",
          platform,
        },
      },
    }).then((res) => {
      const { qrCode, transactionId } =
        res.data.createQrAndSubscribeForPayment || {};

      setTransactionId(`${transactionId}`);
      setQrCode(`${qrCode}`);
      setLink(`onepay://qr/${qrCode}`);
    });
  }, []);

  return {
    qrCode,
    link,
    transactionId,
  };
};

export default useBcelSubscirption;
