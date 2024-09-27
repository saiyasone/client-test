import * as MUI from "styles/pricingPlan.style";

// material ui components and icons
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import { Box, Chip, Link, Typography, useTheme } from "@mui/material";
import svgDollarCoinsFlyingPinkPiggy3D from "assets/images/3d/dollar-coins-flying-pink-piggy.svg";
import svgSafeBoxWithGoldenDollarCoins from "assets/images/3d/safe-box-with-golden-dollar-coins.svg";
import svgSpaceRocketWithSmoke from "assets/images/3d/space-rocket-wih-smoke.svg";
import useAuth from "hooks/useAuth";
import _ from "lodash";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { PACKAGE_TYPE, paymentState } from "stores/features/paymentSlice";
import { prettyNumberFormat } from "utils/number.util";
import { safeGetProperty } from "utils/object.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import NormalButton from "./NormalButton";

function PricingCardClient(props: any) {
  const theme = useTheme();
  const { user } = useAuth();
  const { activePackageData, ...paymentSelector }: any =
    useSelector(paymentState);
  const isCost = props._price > 0;
  const userPackage = safeGetProperty(user, "packageId");
  const { onClick: buttonPropsOnClick, ...buttonProps } =
    props?.buttonProps || {};

  const features = useMemo(
    () => [
      {
        title: "Storage:",
        context: `${convertBytetoMBandGB(props.storage)}`,
      },
      {
        title: "Uploads:",
        context: `${props.uploadPerDay} uploads`,
      },
      {
        title: "Uploads per day:",
        context: `${props.multipleUpload} uploads per day`,
      },

      {
        title: "Max Download Size:",
        context: `${prettyNumberFormat(
          convertBytetoMBandGB(props.maxUploadSize),
        )}`,
      },

      {
        title: "Download option:",
        context: props.downLoadOption,
      },
      {
        title: "Support:",
        context: props.support ?? "Normal",
      },
    ],
    [props],
  );
  const packageOrigin = props;
  const showButtonPlan = () => {
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
  const pricingIcon = useMemo(() => {
    switch (_.toLower(props.name)) {
      case "free": {
        return <img src={svgDollarCoinsFlyingPinkPiggy3D} />;
      }
      case "pro": {
        return <img src={svgSafeBoxWithGoldenDollarCoins} />;
      }
      case "premium": {
        return <img src={svgSpaceRocketWithSmoke} />;
      }
      default: {
        return (
          <img
            src="https://cdn-icons-png.flaticon.com/512/5893/5893015.png"
            alt="currentPackagePrice icon"
          />
        );
      }
    }
  }, [props.name]);

  return (
    <MUI.BoxShowPriceCard
      sx={{
        ...(userPackage._id === props._id && {
          borderColor: theme.palette.primaryTheme!.main,
        }),
        paddingTop: 20,
      }}
    >
      {props.name?.toLowerCase() === "pro" && (
        <MUI.BoxShowChip
          sx={{
            position: "absolute",
            top: 0,
            mt: 6,
            mr: 15,
          }}
        >
          <Chip
            label="Popular"
            sx={{ color: "#17766B", background: "#DAE9E7", fontWeight: "700" }}
          />
        </MUI.BoxShowChip>
      )}

      <MUI.BoxShowPriceIcon
        sx={{
          "& > img": {
            width: 150,
            height: 150,
          },
        }}
      >
        {pricingIcon}
      </MUI.BoxShowPriceIcon>
      <Typography variant="h3">{props.name}</Typography>
      <Typography variant="h6">A simple start for everyone</Typography>
      <Typography
        variant="h6"
        sx={{
          position: "relative",
          p: 5,
        }}
      >
        <strong
          style={{ fontSize: "3rem", color: "#17766B", position: "relative" }}
        >
          <Typography
            component="span"
            className="currency"
            sx={{
              fontWeight: 600,
              position: "absolute",
              top: "40%",
              left: 0,
              transform: "translate(-10px, -50%)",
            }}
          >
            {isCost && paymentSelector.currencySymbol}
          </Typography>
          {isCost ? props._price?.toLocaleString() : "Free"}
        </strong>
        {isCost && (
          <>
            {paymentSelector.packageType === PACKAGE_TYPE.annual
              ? "/year"
              : "/month"}
          </>
        )}
      </Typography>
      <MUI.BoxShowFeatureList>
        {features.map((feature, index) => {
          return (
            <Typography
              component="div"
              key={index}
              sx={{
                display: "flex",
                justifyContent: "start",
                margin: "0.5rem 0",
                fontSize: "0.95rem",
              }}
            >
              <Typography
                component="span"
                sx={{
                  lineHeight: 1,
                  pt: 1,
                  pr: 1,
                }}
              >
                <CircleOutlinedIcon
                  sx={{ fontSize: "0.8rem" }}
                  className="circle"
                />
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  lineHeight: "1.25rem",
                  marginLeft: "5px",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "inherit",
                    marginRight: 1,
                  }}
                >
                  {feature.title} {feature.context}
                </Typography>
              </Typography>
            </Typography>
          );
        })}
      </MUI.BoxShowFeatureList>
      <Box sx={{ py: 5 }}>
        <Link
          underline="always"
          sx={{
            fontSize: "1rem",
            cursor: "pointer",
            color: `${
              props.category === "pro" ? theme.palette.primary.main : ""
            }`,
            textDecoration: `${props.category === "pro" ? "underline" : ""}`,
          }}
          variant="h6"
          component="p"
          onClick={() => {
            if ("scrollBehavior" in document.documentElement.style) {
              window.scrollTo({
                top: (document.body.scrollHeight - window.innerHeight) / 1.6,
                behavior: "smooth",
              });
            } else {
              window.scrollTo(
                0,
                (document.body.scrollHeight - window.innerHeight) / 1.6,
              );
            }
          }}
        >
          View all features
        </Link>
      </Box>
      {userPackage._id === props._id &&
        props.activePayment?.amount === props._price && (
          <NormalButton
            onClick={buttonPropsOnClick}
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
      {props.activePayment?.amount !== props._price &&
        activePackageData._id === props._id && (
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
      {activePackageData._id !== props._id &&
        props.activePayment?.amount !== props._price && (
          <NormalButton
            {...{
              ...(isCost
                ? {
                    onClick: buttonPropsOnClick,
                    ...buttonProps,
                  }
                : {
                    ...buttonProps,
                    disabled: true,
                  }),
            }}
            sx={{
              marginTop: 3,
              height: "35px",
              borderRadius: 1,
              backgroundColor: `${
                props.category == "pro"
                  ? theme.palette.primaryTheme?.main
                  : "#DAE9E7"
              }`,
              textAlign: "center",
              display: "block",
              color: `${
                props.category == "pro" ? "white !important" : "#17766B"
              }`,
              ...(isCost
                ? {
                    "&:hover": {
                      backgroundColor: (theme: {
                        palette: { primaryTheme: { main: any } };
                      }) => theme.palette.primaryTheme.main,
                      color: "white !important",
                    },
                  }
                : {
                    cursor: "default",
                  }),
            }}
            fullWidth
          >
            {showButtonPlan()}
          </NormalButton>
        )}
    </MUI.BoxShowPriceCard>
  );
}

export default PricingCardClient;
