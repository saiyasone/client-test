import * as MUI from "styles/pricingPlan.style";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";

import { Box, Button, Paper, Typography, useMediaQuery } from "@mui/material";
import svgStar from "assets/images/star.svg";
import NormalButton from "components/NormalButton";
import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";
import _ from "lodash";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { PACKAGE_TYPE, paymentState } from "stores/features/paymentSlice";
import { prettyNumberFormat } from "utils/number.util";
import { safeGetProperty } from "utils/object.util";
import { encryptId } from "utils/secure.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const PricingPlanTable: React.FC<any> = (props) => {
  const { user }: any = useAuth();
  const { activePackageData, ...paymentSelector }: any =
    useSelector(paymentState);
  /* const price =
    paymentSelector.packageType === PACKAGE_TYPE.annual
      ? props.annualPrice
      : props.monthlyPrice; */
  const isMobile = useMediaQuery("(max-width:600px)");
  const userPackage = safeGetProperty(user, "packageId");

  const featuresPattern = [
    {
      title: "Storage",
    },
    {
      title: "Uploads",
    },
    {
      title: "Uploads per day",
    },
    /* {
      title: "Downloads",
    }, */
    {
      title: "Max Upload Size",
    },
  ];

  const data = useMemo(() => {
    return props.data?.map((packageData) => {
      const price = packageData._price;
      const isCost = price > 0;
      const features = [
        {
          title: "Storage",
          context: `${convertBytetoMBandGB(packageData.storage)}`,
        },
        {
          title: "Uploads",
          context: `${packageData.uploadPerDay} uploads`,
        },
        {
          title: "Uploads per day",
          context: `${packageData.multipleUpload} uploads per day`,
        },
        /* {
          title: "Downloads",
          context: `${packageData.downLoadPerDay} downloads per day`,
        }, */
        {
          title: "Max Upload Size",
          context: `${prettyNumberFormat(
            convertBytetoMBandGB(packageData.maxUploadSize),
          )}`,
        },
      ];
      return {
        ...packageData,
        features,
        isCost,
      };
    });
  }, [props.data]);
  return (
    <>
      <MUI.BoxShowSection3>
        <Typography variant="h3">
          Still not convinced? Start with a 14-days FREE trial!
        </Typography>
        <Typography variant="h6">
          You will get full access to all the features for 14 days
        </Typography>
        <Button
          sx={{
            background: "#17766B",
            fontSize: isMobile ? "0.8rem" : "1rem",
            margin: "1rem 0",
          }}
          variant="contained"
        >
          Start 14-days Free Trial
        </Button>
      </MUI.BoxShowSection3>
      <MUI.BoxShowSection4>
        <Typography variant="h3">
          Pick a plan that works best for you
        </Typography>
        <Typography
          component="div"
          sx={{
            marginTop: 2,
          }}
        >
          Stay cool, we have a 48-hour money-back guarantee!
        </Typography>
        <Box sx={{ width: "100%" }}>
          <TableContainer component={Paper} sx={{ marginTop: "2rem" }}>
            <Table
              sx={{ minWidth: 650, border: "1px solid #DBDADE" }}
              aria-label="caption table"
            >
              <TableHead>
                <MUI.RowTableRow>
                  <MUI.CellTableCell>
                    <Typography variant="h5">features</Typography>
                    <Typography variant="h6">Native Front Features</Typography>
                  </MUI.CellTableCell>
                  {data?.map((packageData) => {
                    const { _type, isCost, _price, name, _id } = packageData;
                    return (
                      <MUI.CellTableCell
                        sx={{ textAlign: "center", verticalAlign: "bottom" }}
                        key={`id-${_id}`}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "end",
                            columnGap: 1,
                          }}
                        >
                          {_.toLower(name) === "free" ? "Starter" : name}
                          {_.toLower(name) === "pro" && <img src={svgStar} />}
                        </Typography>
                        <Typography component="div">
                          {isCost && paymentSelector.currencySymbol}
                          {
                            isCost
                              ? `${_price?.toLocaleString()}${
                                _type === PACKAGE_TYPE.annual
                                  ? "/year"
                                  : "/month"
                                }`
                              : "Free"
                          }
                        </Typography>
                      </MUI.CellTableCell>
                    );
                  })}
                </MUI.RowTableRow>
              </TableHead>
              <TableBody>
                <>
                  {featuresPattern.map((feature, index) => {
                    return (
                      <MUI.RowTableRow key={index}>
                        <MUI.CellTableCell component="td">
                          {feature.title}
                        </MUI.CellTableCell>
                        {data?.map((packageData) => {
                          const { _id } = packageData;
                          return (
                            <MUI.CellTableCell
                              key={`id-${_id}`}
                              component="td"
                              sx={{
                                textAlign: "center",
                              }}
                            >
                              <Typography component="span">
                                {packageData.features[index].context}
                              </Typography>
                            </MUI.CellTableCell>
                          );
                        })}
                      </MUI.RowTableRow>
                    );
                  })}
                </>
                <MUI.RowTableRow>
                  <MUI.CellTableCell component="td"></MUI.CellTableCell>
                  {data?.map((packageData, index) => {
                    const { _type, isCost, _price, _id } = packageData;
                    return (
                      <MUI.CellTableCell
                        key={index}
                        sx={{ textAlign: "center" }}
                        component="td"
                      >
                        {userPackage._id === _id &&
                          props.activePayment?.amount === _price && (
                            <NormalButton
                              onClick={() =>
                                props.onDialogTermsAndConditionsOpen(
                                  encryptId(
                                    packageData._id,
                                    ENV_KEYS.VITE_APP_ENCRYPTION_KEY,
                                  ),
                                  packageData,
                                )
                              }
                              sx={{
                                color: "rgba(40, 199, 111)",
                                marginTop: 3,
                                height: "35px",
                                borderRadius: 1,
                                backgroundColor: "rgba(40, 199, 111, 0.16)",
                                textAlign: "center",
                                display: "block",
                              }}
                              fullWidth
                            >
                              Renew
                            </NormalButton>
                          )}
                        {props.activePayment?.amount !== _price &&
                          activePackageData._id === _id && (
                            <NormalButton
                              sx={{
                                color: "rgba(40, 199, 111)",
                                marginTop: 3,
                                height: "35px",
                                borderRadius: 1,
                                backgroundColor: "rgba(40, 199, 111, 0.16)",
                                textAlign: "center",
                                display: "block",
                                cursor: "default",
                              }}
                              fullWidth
                            >
                              Your selected plan
                            </NormalButton>
                          )}
                        {activePackageData._id !== _id &&
                          props.activePayment?.amount !== _price && (
                            <NormalButton
                              {...{
                                ...(isCost
                                  ? {
                                      onClick: () =>
                                        props.onDialogTermsAndConditionsOpen(
                                          encryptId(
                                            packageData._id,
                                            ENV_KEYS.VITE_APP_ENCRYPTION_KEY,
                                          ),
                                          packageData,
                                        ),
                                    }
                                  : {
                                      disabled: true,
                                    }),
                              }}
                              sx={{
                                marginTop: 3,
                                height: "35px",
                                borderRadius: 1,
                                backgroundColor: "#DAE9E7",
                                textAlign: "center",
                                display: "block",
                                color: "#17766B",
                                ...(isCost
                                  ? {
                                      "&:hover": {
                                        backgroundColor: (theme) =>
                                          theme.palette.primaryTheme.main,
                                        color: "white !important",
                                      },
                                    }
                                  : {
                                      cursor: "default",
                                    }),
                              }}
                              fullWidth
                            >
                              {_price > props.activePayment?.amount
                                ? "Upgrade"
                                : isCost
                                ? "Choose Plan"
                                : "Free"}
                            </NormalButton>
                          )}
                      </MUI.CellTableCell>
                    );
                  })}
                </MUI.RowTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </MUI.BoxShowSection4>
    </>
  );
};

export default PricingPlanTable;
