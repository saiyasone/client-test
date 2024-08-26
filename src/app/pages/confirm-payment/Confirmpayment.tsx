import Typography from "@mui/material/Typography";
import VerifyIcon from "assets/images/check-upload.png";
import CheckIcon from "assets/images/confirm-payment.png";
import * as MUI from "./styles/Confirmpayment.style";

const ConfirmPayment = () => {
  return (
    <MUI.ConfirmPaymentContainer>
      <MUI.HeaderContainer>
        <MUI.HeaderContainerWrapper>
          <MUI.HeaderCircleContainer>
            <MUI.ConfirmImage src={CheckIcon} />
          </MUI.HeaderCircleContainer>
        </MUI.HeaderContainerWrapper>
      </MUI.HeaderContainer>

      <MUI.BodyContainer>
        <MUI.BodyContainerWrap>
          <Typography variant="h2">Thank you !</Typography>

          <MUI.BodyInline>
            <img src={VerifyIcon} alt="verify-icon" />
            <Typography component={`p`}>Payment Successfully</Typography>
          </MUI.BodyInline>

          <MUI.BodyBox>
            <Typography component={`span`}>
              Thank you for your payment! Your transaction has been successfully
              processed.
            </Typography>
          </MUI.BodyBox>

          <MUI.BodyAction>
            <MUI.ActionButton>Take me to vshare.net</MUI.ActionButton>
          </MUI.BodyAction>
        </MUI.BodyContainerWrap>
      </MUI.BodyContainer>
    </MUI.ConfirmPaymentContainer>
  );
};

export default ConfirmPayment;
