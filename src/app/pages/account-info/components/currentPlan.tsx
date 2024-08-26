import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  Typography,
  linearProgressClasses,
  styled,
  useMediaQuery,
} from "@mui/material";
import * as MUI from "../styles/accountInfo.styles";
import useAuth from "hooks/useAuth";
import { DateTimeFormate } from "utils/date.util";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#17766B",
  },
}));

interface PaymentState {
  currentPlanInfo: any;
  availableDays: number;
  overdueDays: number;
  totalDays: number;
  usedDays: number;
}

interface CurrentPlanProps {
  paymentState: PaymentState;
}

const CurrentPlan: React.FC<CurrentPlanProps> = ({ paymentState }) => {
  const { user }: any = useAuth();
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <div>
      <Typography variant={isMobile ? "h6" : "h4"} sx={{ color: "#5D596C" }}>
        Current Plan
      </Typography>
      <MUI.BoxShowPlanDetail>
        <MUI.BoxLeftShowPlanDetail>
          <Typography variant="h5">
            Your Current Paln is &nbsp;
            <span style={{ color: "#17766B" }}>{user?.packageId?.name}</span>
          </Typography>
          <Typography variant="h6">A simple start for everyone</Typography>
          <Typography variant="h5">
            Active until:{" "}
            <span style={{ color: "#17766B" }}>
              {DateTimeFormate(paymentState?.currentPlanInfo?.expiredAt) ?? ""}
            </span>
          </Typography>
          <Typography variant="h6">
            We will send you a notification upon Subscription expiration
          </Typography>
        </MUI.BoxLeftShowPlanDetail>
        <MUI.BoxRightShowPlanDetail>
          {paymentState?.overdueDays > 7 && (
            <Alert
              severity="warning"
              sx={{
                marginTop: "1rem",
                borderRadius: "10px",
              }}
            >
              <AlertTitle
                sx={{
                  fontSize: "0.8rem",
                  color: "#FF9F43",
                  fontWeight: "800",
                }}
              >
                We need your attention!
              </AlertTitle>
              <Typography
                variant="h6"
                sx={{
                  color: "#FF9F43",
                  fontSize: "0.8rem",
                }}
              >
                Your plan requires update,
                {paymentState?.overdueDays}
                Days over
              </Typography>
            </Alert>
          )}

          <MUI.BoxShowRemainDay>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "0.5rem 0",
              }}
            >
              <Typography variant="h6">
                {paymentState?.usedDays} Days
              </Typography>
              <Typography variant="h6">
                {paymentState?.totalDays} Days
              </Typography>
            </Box>
            <BorderLinearProgress
              variant="determinate"
              value={(paymentState?.usedDays / paymentState?.totalDays) * 100}
            />
            <Typography variant="h6">
              {paymentState?.availableDays} days remaining until your plan
              requires update
            </Typography>
          </MUI.BoxShowRemainDay>
        </MUI.BoxRightShowPlanDetail>
      </MUI.BoxShowPlanDetail>
    </div>
  );
};

export default CurrentPlan;
