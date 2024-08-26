import { useMutation } from "@apollo/client";
import { MUTATION_CREATE_QR_AND_SUBSCRIPTION } from "api/graphql/payment.graphql";
import { clientMockup } from "main";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { paymentState } from "stores/features/paymentSlice";
import {getOS} from '../../utils/os.indecator';

const useBcelSubscirption = () => {
  const {activePackageData, total, packageType, activePackageType } =
    useSelector(paymentState);
  const [createQrAndSubscription] = useMutation(
    MUTATION_CREATE_QR_AND_SUBSCRIPTION,
    {
      client: clientMockup,
    },
  );



  const [qrCode, setQrCode] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    createQrAndSubscription({
      variables: {
        data: {
          amount: total,
          card: "BCEL",
          category: 'package',
          description: activePackageData?.description?.substring(1, 25)+'...',
          packageId: activePackageData?.packageId,
          paymentMethod: "bcelone",
          service: "BCELONE_PAY",
          status: "success",
          type: activePackageType || packageType,
          platform: ['WINDOWS','OTHER'].includes(getOS()) ? 'ANDROID' : 'ios'
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
