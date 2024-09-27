import { useMutation } from "@apollo/client";
import ErrorIcon from "@mui/icons-material/Error";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  InputLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { USE_COUPON } from "api/graphql/coupon.graphql";
import ProPackageIcon from "assets/images/3d/safe-box-with-golden-dollar-coins.svg";
import RedeemCouponSuccessIcon from "assets/images/redeem_coupon_success.png";
import useAuth from "hooks/useAuth";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ICouponBillTyps } from "types/couponType";
import { errorMessage } from "utils/alert.util";
import { DateOfNumber } from "utils/date.util";
import * as MUI from "../styles/accountInfo.styles";
export default function RedeemCoupon() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();
  const [createCoupon] = useMutation(USE_COUPON);
  const [error, setError] = React.useState<string>("");
  const [verifyCoupon, setVerifyCoupon] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [billData, setBillData] = React.useState<ICouponBillTyps | null>(null);
  const [isSubtting, setIsSubtting] = React.useState<boolean>(false);

  setTimeout(() => {
    setError("");
  }, 4000);

  const handleClose = () => {
    setIsOpen(false);
  };
  setTimeout(() => {
    setIsSubtting(false);
  }, 2000);
  const handleRedeemCoupon = async () => {
    if (!verifyCoupon || verifyCoupon.trim() === "") {
      setError("Invalid coupon code");
      return;
    }
    setIsSubtting(true);
    try {
      const response = await createCoupon({
        variables: {
          input: {
            coupon: verifyCoupon,
          },
        },
      });
      if (response?.data?.useCouponEvent.status == 1) {
        setBillData(response?.data?.useCouponEvent?.info?.bill);
        setTimeout(() => {
          setIsSubtting(false);
        }, 2000);
        setTimeout(() => {
          setIsOpen(true);
        }, 1000);
      } else if (
        response?.data?.useCouponEvent.status == 0 &&
        response?.data?.useCouponEvent.message == "coupon has already used"
      ) {
        errorMessage("This coupon already used", 2000);
      } else {
        errorMessage("This coupon is invalid", 2000);
      }
      setVerifyCoupon("");
    } catch (err) {
      errorMessage("This coupon is invalid", 2000);
    }
  };

  return (
    <>
      <Card>
        <MUI.PaperGlobal>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CardMedia
              sx={{
                width: 200,
                height: 200,
              }}
              component="img"
              alt="green iguana"
              height="200"
              image={ProPackageIcon}
            />
          </Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              textAlign: "center",
              color: theme.palette.grey[800],
              textTransform: "uppercase",
              fontSize: isMobile ? "1rem" : "1.8rem",
            }}
          >
            100% off redeem to pro
          </Typography>

          <Box>
            <InputLabel
              shrink
              htmlFor="bootstrap-input"
              sx={{
                fontSize: "1.2rem",
                fontWeight: "500",
                color: "#5D596C",
                marginTop: "0.8rem",
              }}
            >
              Redeem coupon
            </InputLabel>
            <TextField
              variant="outlined"
              fullWidth
              required
              InputProps={{
                sx: {
                  fontSize: "1.2rem", // Font size for the input
                  fontWeight: "500",
                  color: "#5D596C",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: "1.2rem", // Font size for the label
                  color: "#5D596C",
                },
              }}
              value={verifyCoupon}
              onChange={(e) => setVerifyCoupon(e.target.value)}
            />
            {error && (
              <Alert
                sx={{ mt: 2, fontSize: "1rem" }}
                severity="error"
                icon={<ErrorIcon sx={{ fontSize: "1.5rem" }} />}
              >
                {error}
              </Alert>
            )}
            <Box sx={{ my: 5 }}>
              <Button
                sx={{
                  px: 5,
                  py: 3,
                  fontSize: "1.2rem",
                  boxShadow: "rgba(0, 0, 0, 0.5) 0px 4px 12px",
                  textTransform: "uppercase",
                }}
                type="button"
                variant="contained"
                onClick={handleRedeemCoupon}
              >
                {isSubtting ? "Loading..." : "Redeem Now"}
              </Button>
            </Box>
          </Box>
        </MUI.PaperGlobal>

        {billData && (
          <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{ sx: { width: "100%" } }}
          >
            <DialogContent>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CardMedia
                  sx={{
                    width: 200,
                    height: 200,
                  }}
                  component="img"
                  alt="green iguana"
                  height="200"
                  image={RedeemCouponSuccessIcon}
                />
              </Box>
              <Box sx={{ py: 5, my: 5, textAlign: "center" }}>
                <Typography variant="h6">
                  {`${billData.discount}% Discount`}
                </Typography>
                <Typography variant="h2" sx={{ textAlign: "center" }}>
                  Reward activated
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "80%",
                    }}
                  >
                    <Typography variant="h6" sx={{ mt: 5 }}>
                      {`Credit received from "${billData?.couponEventName}" `}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {`Upgrade your plan from Free to Pro for just $${billData.price}`}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 5,
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {`Credit received on: ${DateOfNumber(billData.from)},`}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 1, fontSize: "1rem" }}
                      >
                        {`Expires on: ${DateOfNumber(billData.to)}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Button
                fullWidth
                sx={{ p: 2.2, mb: 2, fontSize: "1.2rem" }}
                variant="contained"
                onClick={() => navigate("/pricing")}
              >
                View current plan
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </>
  );
}
