import {
  Chip,
  Grid,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import svgCornerLeftDown from "assets/images/corner-left-down.svg";
import PricingCardClient from "components/PricingCardClient";
import { ENV_KEYS } from "constants/env.constant";
import { useDispatch, useSelector } from "react-redux";
import {
  PACKAGE_TYPE,
  paymentState,
  setPackageType,
} from "stores/features/paymentSlice";
import * as MUI from "styles/pricingPlan.style";
import { encryptId } from "utils/secure.util";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#17766B",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

const PricingPlan = (props) => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { packageType }: any = useSelector(paymentState);
  
  return (
    <>
      <MUI.BoxShowSection1>
        <Typography
          variant="h3"
          sx={{
            marginBottom: 2,
          }}
        >
          Pricing Plans
        </Typography>
        <Typography variant="h6">
          All plans inclue 40+ advanced tools and features to boost your
          product.
        </Typography>
        <Typography variant="h6">
          Choose the best plan to fit your needs
        </Typography>
        <MUI.BoxShowSwitchPlan>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              marginTop: 4,
            }}
          >
            <Typography variant="h6">Monthly</Typography>
            <AntSwitch
              checked={packageType === PACKAGE_TYPE.annual ? true : false}
              onChange={() => {
                dispatch(
                  setPackageType(
                    packageType !== PACKAGE_TYPE.annual
                      ? PACKAGE_TYPE.annual
                      : PACKAGE_TYPE.monthly,
                  ),
                );
              }}
              inputProps={{ "aria-label": "ant design" }}
            />
            <Typography
              variant="h6"
              sx={{
                marginLeft: "1rem !important",
                position: "relative",
              }}
            >
              <Typography
                component="div"
                sx={{
                  position: "absolute",
                  left: "100%",
                  top: "0%",
                  transform: "translate(-25%, -100%)",
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    display: "flex",
                  }}
                >
                  <img src={svgCornerLeftDown} />
                  <Chip
                    label="Save up to 10%"
                    sx={{
                      marginBottom: "10px",
                      padding: "3px",
                      height: "auto",
                      color: "#17766B",
                      background: "#DAE9E7",
                      fontWeight: "700",
                    }}
                  />
                </Typography>
              </Typography>
              Annual
            </Typography>
          </Stack>
        </MUI.BoxShowSwitchPlan>
      </MUI.BoxShowSection1>
      <MUI.BoxShowSection2>
        <Grid container spacing={isMobile ? 2 : 8}>
          {props.data?.map((packageData, index) => {
            return (
              <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
                <PricingCardClient
                  activePayment={props.activePayment}
                  {...packageData}
                  buttonProps={{
                    onClick: () => {
                      props.onDialogTermsAndConditionsOpen(
                        encryptId(
                          packageData._id,
                          ENV_KEYS.VITE_APP_ENCRYPTION_KEY,
                        ),
                        packageData,
                      );
                    },
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </MUI.BoxShowSection2>
    </>
  );
};

export default PricingPlan;
