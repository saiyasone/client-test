import React, { useEffect, useMemo, useRef, useState } from "react";
import * as MUI from "styles/pricingPlan.style";

import { useLazyQuery } from "@apollo/client";
import { useMediaQuery } from "@mui/material";
import { QUERY_PAYMENT } from "api/graphql/payment.graphql";
import DialogPricingCondition from "components/dialog/DialogPricingCondition";
import useManagePackages from "hooks/pricingPackage/useManagePricingPackage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  PACKAGE_TYPE,
  paymentState,
  setActivePaymentId,
  setActivePaymentType,
  setCalculatePrice,
} from "stores/features/paymentSlice";
import useAuth from "../../../hooks/useAuth";
import PricingPlan from "./PricingPlan";
import PricingPlanTable from "./PricingPlanTable";

function Pricing() {
  const { packageType } = useSelector(paymentState);
  const packages = useManagePackages({ filter: packageType });
  const isMobile = useMediaQuery("(max-width:600px)");
  const memorizedPackages = useRef<any>({});
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [packageId, setPackageId] = useState("");
  const [isDialogTermsAndConditionsOpen, setIsDialogTermsAndConditionsOpen] =
    useState(false);
  const packageData =
    packageType === PACKAGE_TYPE.annual
      ? memorizedPackages.current.filteredAnnualData || packages.annualData
      : memorizedPackages.current.filteredMonthlyData || packages.monthlyData;

  const [getPayment, { data: paymentData }] = useLazyQuery(QUERY_PAYMENT, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (user) {
      getPayment({
        variables: {
          where: {
            payerId: user?._id,
            packageId: user.packageId.packageId,
          },
        },
      });
    }
  }, [user]);

  const activePayment = useMemo(() => {
    if (paymentData?.getPayments?.data?.length > 0) {
      return paymentData?.getPayments?.data.reduce((a, b) => {
        return new Date(a.expiredAt) > new Date(b.expiredAt) ? a : b;
      });
    }
  }, [paymentData]);

  useEffect(() => {
    memorizedPackages.current = packages;
  }, [packages]);

  return (
    <React.Fragment>
      <MUI.PaperGlobal sx={{ margin: isMobile ? "2rem 0" : "2rem" }}>
        <PricingPlan
          activePayment={activePayment}
          data={packageData}
          onDialogTermsAndConditionsOpen={(id, data) => {
            setPackageId(id);
            dispatch(setActivePaymentType(data._type));
            dispatch(setActivePaymentId(data._id));
            dispatch(setCalculatePrice());
            navigate(`checkout/${id}`);
            /* setIsDialogTermsAndConditionsOpen(true); */
          }}
        />
        <PricingPlanTable
          activePayment={activePayment}
          data={packageData}
          onDialogTermsAndConditionsOpen={(id, data) => {
            setPackageId(id);
            dispatch(setActivePaymentType(data._type));
            dispatch(setActivePaymentId(data._id));
            dispatch(setCalculatePrice());
            navigate(`checkout/${id}`);
            /* setIsDialogTermsAndConditionsOpen(true); */
          }}
        />
      </MUI.PaperGlobal>
      <DialogPricingCondition
        isOpen={isDialogTermsAndConditionsOpen}
        onConfirm={() => navigate(`checkout/${packageId}`)}
        onClose={() => setIsDialogTermsAndConditionsOpen(false)}
      />
    </React.Fragment>
  );
}

export default Pricing;
