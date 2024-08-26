import { useLazyQuery } from "@apollo/client";
import { QUERY_PAYMENT } from "api/graphql/payment.graphql";
import DialogPaymentPackage from "components/dialog/DialogPaymentPackage";
import DialogWarningPackage from "components/dialog/DialogWarningPackage";
import useAuth from "hooks/useAuth";
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentState } from "stores/features/paymentSlice";

export const PackageCheckerContext = createContext({});

const PackageCheckerProvider = ({ children }) => {
  const { user }: { user: any } = useAuth();
  const [isWarningPackage, setIsWarningPackage] = useState(false);
  const paymentSelector = useSelector(paymentState);
  const userPackage = user?.packageId;
  const activePackage: any = paymentSelector.activePackageData;
  const [canAccess, setCanAccess] = useState<any>("initial");
  const [isPackageExist, setIsPackageExist] = useState<boolean | null>(null);
  const [status, setStatus] = useState("initial");
  const [getPayments, { data: paymentData }] = useLazyQuery(QUERY_PAYMENT);
  const [_isDialogPaymentPackageOpen, setIsDialogPaymentPackageOpen] =
    useState(false);

  const onHandleDialogPaymentPackageClose = () => {
    setIsDialogPaymentPackageOpen(false);
  };

  const onHandleDialogWarningPackageClose = () => {
    setIsWarningPackage(false);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (!pathname.includes("pricing")) {
      if (user?._id) {
        getPayments({
          variables: {
            where: {
              payerId: user?._id,
            },
          },
        });
      }
    }
  }, [user, pathname]);

  useEffect(() => {
    if (!pathname.includes("pricing")) {
      const payments = paymentData?.getPayments?.data;
      if (payments !== undefined && payments?.length > 0) {
        const dateList = payments
          .filter((data) => data.expiredAt)
          .map((data) => new Date(data.expiredAt));
        const latestDate = new Date(Math.max(...dateList));
        latestDate.setSeconds(latestDate.getSeconds() - 3);
        const currentTime = new Date();
        const msTimeOut = latestDate.getTime() - currentTime.getTime();
        const timer = setTimeout(() => {
          setIsDialogPaymentPackageOpen(true);
          setIsPackageExist(true);
        }, msTimeOut);

        return () => clearTimeout(timer);
      }
    } else {
      setIsDialogPaymentPackageOpen(false);
      setIsPackageExist(false);
    }
  }, [paymentData, pathname]);

  useEffect(() => {
    const checkingPackage = new Promise((res) => {
      if (userPackage && activePackage) {
        if (pathname.includes("pricing/checkout")) {
          if (paymentSelector.paymentStatus === null) {
            res("allowed");
            /* if (activePackagePrice) {
              res("allowed");
            }
            if (!activePackagePrice) {
              res("disallowed");
            } */
          }
        }
      }
    });
    checkingPackage
      .then((data) => {
        setCanAccess(data);
      })
      .catch((data) => {
        setCanAccess(data);
      });
  }, [pathname, userPackage, activePackage]);

  useEffect(() => {
    setStatus(canAccess);
  }, [canAccess]);

  return (
    <PackageCheckerContext.Provider
      value={{
        status,
        setCanAccess,
        isWarningPackage,
        setIsWarningPackage,
        isPackageExist,
      }}
    >
      {children}
      <DialogPaymentPackage
        isOpen={false}
        onClose={onHandleDialogPaymentPackageClose}
        onConfirm={() => {
          onHandleDialogPaymentPackageClose();
          navigate("pricing");
        }}
      />
      <DialogWarningPackage
        isPackageExist={isPackageExist}
        isOpen={isWarningPackage}
        onClose={onHandleDialogWarningPackageClose}
        onConfirm={() => {
          onHandleDialogWarningPackageClose();
          navigate("pricing");
        }}
      />
    </PackageCheckerContext.Provider>
  );
};

export const PackageChecker = ({ children }) => {
  const { status, setCanAccess } = useContext<any>(PackageCheckerContext);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      setCanAccess("initial");
    };
  }, []);

  if (status === "initial") {
    return null;
  }

  if (status === "allowed") {
    return children;
  }

  if (status === "disallowed") {
    navigate("/pricing", { replace: true });
    return null;
  }
};

export default PackageCheckerProvider;
