import React, { createRef, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// material ui icon and component
import { Box, Divider, useMediaQuery } from "@mui/material";

// componento
import * as MUI from "./styles/pricingCheckout.style";
import "./styles/step-animation.css";

// graphql
import { useLazyQuery } from "@apollo/client";
import { ChevronRight } from "@mui/icons-material";
import { QUERY_SETTING } from "api/graphql/setting.graphql";
import {
  AddressIcon,
  CartIcon,
  ConfirmationIcon,
  PaymentIcon,
} from "assets/icons/pricingIcon";
import Step from "components/Step";
import { ENV_KEYS } from "constants/env.constant";
import { PackageChecker } from "contexts/PackageCheckerProvider";
import useManagePackages from "hooks/pricingPackage/useManagePricingPackage";
import useFilter from "hooks/useFilter";
import { useDispatch, useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  PACKAGE_TYPE,
  PAYMENT_METHOD,
  paymentState,
  resetPayment,
  setActivePaymentId,
  setActivePaymentMethod,
  setActiveStep,
  setAddressData,
  setCalculatePrice,
  setPackageData,
  setPackageIdData,
  setPaymentId,
  setShowBcel,
  setShowStrip,
} from "stores/features/paymentSlice";
import { decryptId } from "utils/secure.util";
import BreadcrumbNavigate from "../../../components/BreadcrumbNavigate";
import useFirstRender from "../../../hooks/useFirstRender";
import Address from "./sections/Address";
import Cart from "./sections/Cart";
import Confirmation from "./sections/Confirmation";
import Payment from "./sections/Payment";

function PricingCheckout() {
  const isMobile = useMediaQuery("(max-width:950px)");
  const params = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const status = searchParams.get("status");

  const packageId = decryptId(
    params.packageId,
    ENV_KEYS.VITE_APP_ENCRYPTION_KEY,
  );

  const dispatch = useDispatch();
  const { activeStep, paymentSteps, packageType, ...paymentSelector } =
    useSelector(paymentState);
  const filter = useFilter();
  const packages = useManagePackages({ filter: filter.data });
  const memorizedPackages = useRef<any>({});
  const isFirstRender = useFirstRender();
  const navigate = useNavigate();
  const [_toggle, setToggle] = useState<any>(null);
  const [getSetting] = useLazyQuery(QUERY_SETTING, {
    fetchPolicy: "no-cache",
  });
  const transitonRef = createRef<any>();

  const packageData =
    packageType === PACKAGE_TYPE.annual
      ? memorizedPackages.current.filteredAnnualData || packages.annualData
      : memorizedPackages.current.filteredMonthlyData || packages.monthlyData;


  const settingKeys = {
    Strip: "SRIPETE",
    Bcel: "CELBENE",
  };


  useEffect(() => {
    memorizedPackages.current = packages;
  }, [packages]);

  const [dataForEvents, _setDataForEvents] = useState<any>({
    action: null,
    type: null,
    data: {},
  });

  useEffect(() => {
    if (id) {
      dispatch(setPaymentId({ id: id, status: status }));
    }
  }, [id]);

  useEffect(() => {
    async function fetchPaymentSetting() {
      try {
        const result = await getSetting({
          variables: {
            where: {
              groupName: "payment_setting",
            },
          },
        });

        if (result.data?.general_settings?.data) {
          const settings = result.data?.general_settings?.data;
          let dataBcel: any = null;
          let dataStrip: any = null;
          dispatch(setActivePaymentMethod(""));

          dataBcel = settings?.find((el) => el.productKey === settingKeys.Bcel);
          if (dataBcel) {
            if (dataBcel?.status === "on") {
              dispatch(setShowBcel(true));
              dispatch(setActivePaymentMethod(PAYMENT_METHOD.bcelOne));
            } else {
              dispatch(setShowBcel(false));
            }
          }

          dataStrip = settings?.find(
            (el) => el.productKey === settingKeys.Strip,
          );
          if (dataStrip) {
            if (dataStrip?.status === "on") {
              dispatch(setShowStrip(true));
              if (dataBcel?.status === "on") {
                dispatch(setActivePaymentMethod(PAYMENT_METHOD.bcelOne));
              } else {
                dispatch(setActivePaymentMethod(PAYMENT_METHOD.stripe));
              }
            } else {
              dispatch(setShowStrip(false));
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchPaymentSetting();
  }, []);

  useEffect(() => {
    if (packages.data) {
      dispatch(setPackageData(packages.data));
    }
  }, [packages.data, dispatch]);

  useEffect(() => {
    if (packageId) {
      dispatch(setActivePaymentId(packageId));

      if (packages.data) {
        const result = packages.data?.find((el) => el?._id === packageId);
        dispatch(setPackageIdData(result?.packageId));
      }
    }
  }, [packageId, dispatch, packages.data]);

  useEffect(() => {
    if (paymentSelector.packageData && paymentSelector.activePackageId) {
      dispatch(setCalculatePrice());
    }
  }, [paymentSelector.packageData, paymentSelector.activePackageId]);

  React.useEffect(() => {
    const localStorageToggled: any = localStorage.getItem("toggle");
    if (localStorageToggled) {
      setToggle(localStorageToggled === "list" ? "list" : "grid");
    }
  }, []);

  useEffect(() => {
    if (dataForEvents.action && dataForEvents.data) {
      menuOnClick();
    }
  }, [dataForEvents.action]);

  const menuOnClick = async () => {};

  const duration = 500;

  const PricingProcesses = () => {
    let step: any = null;
    switch (activeStep) {
      case 0:
        step = (
          <Cart
            onSubmit={() => {
              dispatch(setActiveStep(1));
            }}
            packageData={packageData}
          />
        );
        break;
      case 1:
        step = (
          <Address
            onSubmit={(values) => {
              dispatch(setAddressData(values));
              dispatch(setActiveStep(2));
            }}
          />
        );
        break;
      case 2:
        step = (
          <Payment
            onSubmit={(values) => {
              dispatch(setAddressData(values));
              dispatch(setActiveStep(2));
            }}
          />
        );
        break;
      case 3:
        step = (
          <Confirmation
            onSubmit={(values) => {
              dispatch(setAddressData(values));
              dispatch(setActiveStep(3));
              dispatch(resetPayment());
            }}
          />
        );
        break;
      default:
        step = null;
    }
    return (
      <TransitionGroup
        style={{
          position: "relative",
        }}
      >
        <CSSTransition
          key={activeStep}
          classNames="fade"
          timeout={duration}
          nodeRef={transitonRef}
        >
          <div
            ref={transitonRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
            >
              {step}
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    );
  };

  // useEffect(() => {
  //   return () => {
  //     dispatch(resetPayment());
  //   };
  // }, [dispatch]);

  if (isFirstRender) {
    return null;
  }

  if (!packageId) {
    navigate("/pricing");
    return null;
  }

  return (
    <PackageChecker>
      <React.Fragment>
        {/* <MUI.ExtendContainer> */}
        <MUI.TitleAndSwitch className="title-n-switch">
          <BreadcrumbNavigate
            titlePath="/pricing"
            title="Pricing"
            readablePath={["Pricing", "Checkout"]}
            path={["pricing"]}
          />
        </MUI.TitleAndSwitch>
        {!paymentSelector.isPaymentLoading && (
          <MUI.PricingCheckoutContainer>
            <MUI.PricingCheckoutHeader>
              <Box
                sx={{
                  width: "100%",
                  minHeight: "180px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(isMobile && {
                    padding: 5,
                    justifyContent: "flex-start",
                  }),
                }}
              >
                <Step
                  handleStep={(step) => dispatch(setActiveStep(step))}
                  activeStepState={[activeStep, setActiveStep]}
                  stepperProps={{
                    connector: (
                      <>
                        {!isMobile && (
                          <ChevronRight
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "calc(-35% + 20px)",
                              right: "calc(35% + 20px)",
                              transform: "translateY(-60%)",
                            }}
                          />
                        )}
                      </>
                    ),
                    steps: ["Cart", "Address", "Payment", "Confirmation"],
                    isCompletedSteps: [
                      paymentSteps[0],
                      paymentSteps[1],
                      paymentSteps[2],
                      paymentSteps[3],
                    ],
                    icons: {
                      1: <CartIcon />,
                      2: <AddressIcon />,
                      3: <PaymentIcon />,
                      4: <ConfirmationIcon />,
                    },
                  }}
                  stepProps={{
                    sx: {
                      width: "200px",
                    },
                  }}
                />
              </Box>
            </MUI.PricingCheckoutHeader>
            <Divider
              sx={{
                color: "black",
              }}
            />
            <MUI.PricingCheckoutBody
              sx={{
                minHeight:
                  paymentSelector.activePaymentMethod === "Credit card"
                    ? "1300px"
                    : "700px",
                ...(isMobile && {
                  minHeight:
                    paymentSelector.activePaymentMethod === "Credit card"
                      ? "1800px"
                      : "950px",
                }),
              }}
            >
              {PricingProcesses()}
            </MUI.PricingCheckoutBody>
          </MUI.PricingCheckoutContainer>
        )}
      </React.Fragment>
    </PackageChecker>
  );
}

export default PricingCheckout;
