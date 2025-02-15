import * as MUI from "styles/pricingPlan.style";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";

import {
  Box,
  Button,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
import { IoMdCheckmark } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
const PricingPlanTable: React.FC<any> = (props) => {
  const { user }: any = useAuth();
  const theme = useTheme();
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

    {
      title: "Max Upload Size",
    },
    { title: "Download option" },
    { title: "Support" },
    { title: "Download" },
    { title: "Download folder" },
    { title: "Multiple download" },
    { title: "Lock files" },
    { title: "Lock folders" },

    { title: "File drop" },
    { title: "No chaptcha" },
    { title: "No ads" },
  ];

  const showButtonPlan = (packageOrigin: { storage: string }) => {
    switch (userPackage.category) {
      case "free":
      case "pro":
      case "premium":
        if (parseInt(packageOrigin.storage) === parseInt(userPackage.storage)) {
          return "Current Plan";
        } else if (
          parseInt(userPackage.storage) < parseInt(packageOrigin.storage)
        ) {
          return "Upgrade";
        } else if (
          parseInt(userPackage.storage) > parseInt(packageOrigin.storage)
        ) {
          return "Downgrade";
        }
        break;
      default:
        return null;
    }
  };

  const findNullOrUndefinedFields = (dataArray: any) => {
    return dataArray?.map((item: any, index: number) => {
      const nullFields = Object.keys(item).filter((key) => {
        const value = item[key];

        return value === null || value === undefined || value === 0;
      });

      return {
        index,
        nullFields,
      };
    });
  };

  const findCommonNullFields = (dataArray: any) => {
    if (!dataArray?.length) return [];
    let commonFields = dataArray[0].nullFields;

    for (let i = 1; i < dataArray?.length; i++) {
      commonFields = commonFields.filter((field: string) =>
        dataArray[i].nullFields.includes(field),
      );
    }

    return commonFields;
  };

  const result = findNullOrUndefinedFields(props.data);
  const commonNullFields = findCommonNullFields(result);

  const data = useMemo(() => {
    return props.data?.map((packageData: any) => {
      const price = packageData._price;
      const isCost = price > 0;

      const existingFields = commonNullFields?.filter((field: string) => {
        return field in packageData;
      });
      const features = [
        {
          title: "Storage",
          context: existingFields.includes("storage")
            ? "Coming soon"
            : `${convertBytetoMBandGB(packageData.storage)}`,
        },
        {
          title: "Uploads",
          context: existingFields.includes("uploadPerDay")
            ? "Coming soon"
            : `${packageData.uploadPerDay} uploads`,
        },
        {
          title: "Uploads per day",
          context: existingFields.includes("multipleUpload")
            ? "Coming soon"
            : `${packageData.multipleUpload} uploads per day`,
        },

        {
          title: "Max Upload Size",
          context: existingFields.includes("maxUploadSize")
            ? "Coming soon"
            : `${prettyNumberFormat(
                convertBytetoMBandGB(packageData.maxUploadSize),
              )}`,
        },
        {
          title: "Download option",
          context: existingFields.includes("downLoadOption")
            ? "Coming soon"
            : packageData.downLoadOption,
        },
        {
          title: "Support",
          context: existingFields.includes("support")
            ? "Coming soon"
            : packageData.support ?? "Normal",
        },
        {
          title: "Multiple download",
          context: existingFields.includes("multipleDownload")
            ? "Coming soon"
            : packageData.multipleDownload ?? 0,
        },
        {
          title: "Download",
          context: existingFields.includes("unlimitedDownload")
            ? "Coming soon"
            : packageData.unlimitedDownload ?? 0,
        },
        {
          title: "Download folder",
          context: existingFields.includes("downloadFolder")
            ? "Coming soon"
            : packageData.downloadFolder,
        },
        {
          title: "Lock files",
          context: existingFields.includes("lockFile")
            ? "Coming soon"
            : packageData.lockFile == "on"
            ? 1
            : 0,
        },
        {
          title: "Lock folder",
          context: existingFields.includes("lockFolder")
            ? "Coming soon"
            : packageData.lockFolder == "on"
            ? 1
            : 0,
        },

        {
          title: "File drop",
          context: existingFields.includes("fileDrop")
            ? "Coming soon"
            : packageData.fileDrop,
        },
        {
          title: "Captcha",
          context: existingFields.includes("captcha")
            ? "Coming soon"
            : packageData.captcha ?? 0,
        },
        {
          title: "No Ads",
          context: existingFields.includes("ads")
            ? "Coming soon"
            : packageData.ads ?? 0,
        },
      ];
      return {
        ...packageData,
        features,
        isCost,
      };
    });
  }, [props.data]);

  const packageCategories =
    props.data?.map((packageData: any) => {
      return packageData.category;
    }) || [];
  const packagges = ["free", "prop", "premium"];

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
                  {data?.map((packageData: any) => {
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
                          {isCost
                            ? `${_price?.toLocaleString()}${
                                _type === PACKAGE_TYPE.annual
                                  ? "/year"
                                  : "/month"
                              }`
                            : "Free"}
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
                        {data?.map((packageData: any) => {
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
                                {typeof packageData.features[index].context ===
                                  "string" &&
                                packageData.features[index].context.length >
                                  0 ? (
                                  `${packageData.features[index].context
                                    .charAt(0)
                                    .toUpperCase()}${packageData.features[
                                    index
                                  ].context.slice(1)}`
                                ) : typeof packageData.features[index]
                                    .context === "number" &&
                                  packageData.features[index].context > 0 ? (
                                  <IoMdCheckmark
                                    size={18}
                                    color={theme.palette.primaryTheme?.main}
                                  />
                                ) : (
                                  <IoMdClose size={18} color="red" />
                                )}
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
                  {data?.map((packageData: any, index: number) => {
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
                                    ENV_KEYS.VITE_APP_ENCRYPTION,
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
                            // <NormalButton
                            //   {...{
                            //     ...(isCost
                            //       ? {
                            //           onClick: () =>
                            //             props.onDialogTermsAndConditionsOpen(
                            //               encryptId(
                            //                 packageData._id,
                            //                 ENV_KEYS.VITE_APP_ENCRYPTION_KEY,
                            //               ),
                            //               packageData,
                            //             ),
                            //         }
                            //       : {
                            //           disabled: true,
                            //         }),
                            //   }}
                            //   sx={{
                            //     marginTop: 3,
                            //     height: "35px",
                            //     borderRadius: 1,
                            //     backgroundColor: `${
                            //       packageData.category == userPackage.category
                            //         ? theme.palette.primaryTheme?.main
                            //         : "#DAE9E7"
                            //     }`,

                            //     textAlign: "center",
                            //     display: "block",
                            //     color: `${
                            //       packageData.category == userPackage.category
                            //         ? "white !important"
                            //         : "#17766B"
                            //     }`,
                            //     ...(isCost
                            //       ? {
                            //           "&:hover": {
                            //             backgroundColor: (theme: {
                            //               palette: {
                            //                 primaryTheme: { main: any };
                            //               };
                            //             }) => theme.palette.primaryTheme.main,
                            //             color: "white !important",
                            //           },
                            //         }
                            //       : {
                            //           cursor: "default",
                            //         }),
                            //   }}
                            //   fullWidth
                            // >
                            //   {showButtonPlan(packageData)}
                            // </NormalButton>
                            <Button
                              {...{
                                ...(isCost
                                  ? {
                                      onClick: () =>
                                        props.onDialogTermsAndConditionsOpen(
                                          encryptId(
                                            packageData._id,
                                            ENV_KEYS.VITE_APP_ENCRYPTION,
                                          ),
                                          packageData,
                                        ),
                                    }
                                  : {
                                      disabled: true,
                                    }),
                              }}
                              fullWidth
                              sx={{
                                marginTop: 3,
                                height: "35px",
                                borderRadius: 1,
                                backgroundColor: `${
                                  packageData.category == userPackage.category
                                    ? theme.palette.primaryTheme?.main
                                    : "#DAE9E7"
                                }`,

                                textAlign: "center",
                                display: "block",
                                color: `${
                                  packageData.category == userPackage.category
                                    ? "white !important"
                                    : "#17766B"
                                }`,
                                ...(isCost
                                  ? {
                                      "&:hover": {
                                        backgroundColor: (theme: {
                                          palette: {
                                            primaryTheme: { main: any };
                                          };
                                        }) => theme.palette.primaryTheme.main,
                                        color: "white !important",
                                      },
                                    }
                                  : {
                                      cursor: "default",
                                    }),
                              }}
                            >
                              {showButtonPlan(packageData)}
                            </Button>
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
