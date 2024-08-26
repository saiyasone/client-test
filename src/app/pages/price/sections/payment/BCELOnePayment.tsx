import { useSubscription } from "@apollo/client";
import { Box, Button, Skeleton, Typography, useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { SUBSCRIPTION_BCEL_ONE_SUBSCRIPTION } from "api/graphql/payment.graphql";
import { useRef } from "react";
import QRCode from "react-qr-code";
import { setActiveStep, setPaymentStatus, setRecentPayment } from "stores/features/paymentSlice";
import { useDispatch } from "react-redux";

const BCELOnePaymentContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: 12,
});

const BCELOnePayment: React.FC<any> = (props) => {
  const theme = useTheme();
  const qrCodeRef = useRef<any>(null);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:900px)");
  const _bcelOneSubscription = useSubscription(
    SUBSCRIPTION_BCEL_ONE_SUBSCRIPTION,
    {
      variables: { transactionId: props.transactionId },
      onComplete: () => {
        console.log("test");
      },
      onData: ({data}) => {
        // console.log("test der => ",data);
        if(data && data?.data?.subscribeBcelOneSubscriptionQr?.message === "SUCCESS")
        {
          dispatch(setPaymentStatus("Subscription is succeeded"));
          dispatch(setRecentPayment(data?.data?.subscribeBcelOneSubscriptionQr));
        }
        else
        {
          dispatch(setPaymentStatus("Subscription is failed!"));
        }
        // setActiveStep(3);
        dispatch(setActiveStep(3));
      },
    },
  );

  const handleDownloadQrCode = () => {
    const svgDocument = qrCodeRef.current;
    if (!svgDocument) return;
    const svgContent = new XMLSerializer().serializeToString(svgDocument);
    const svgBlob = new Blob([`${svgContent}`], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr_code.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BCELOnePaymentContainer>
      <Typography component="div">QR Code (BCEL One Subscription)</Typography>
      {isMobile ? (
        <>
          {props.link && (
            <Typography
              component="a"
              sx={{
                width: "max-content",
                fontSize: theme.spacing(4),
                fontWeight: 600,
              }}
              href={props.link}
            >
              Payment link
            </Typography>
          )}
        </>
      ) : (
        <>
          {props.qrCode ? (
            <Box sx={{width: "150px", height:"150px", ml: 4}}>
              {/* <Typography
                component="img"
                src={props.qrCode}
                width={"25%"}
                ref={qrCodeRef}
                sx={{
                  boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
                }}
              /> */}
              <QRCode
                ref={qrCodeRef}
                size={170}
                // style={{ float: "left" }}
                style={{ width: "100%", height:"100%", border: '1px solid gray', padding: '7px', borderRadius: '7px', marginTop: 3}}
                value={props.qrCode}
                viewBox={`0 0 256 256`}
              />
              <Button
                variant="outlined"
                onClick={handleDownloadQrCode}
                sx={{
                  height: "auto",
                  fontWeight: 600,
                  width: "100%",
                  margin: (theme) => `${theme.spacing(3)} ${theme.spacing(0)}`,
                  borderRadius: (theme) => theme.spacing(1),
                }}
              >
                Download QR
              </Button>
            </Box>
          ):
            <Box sx={{ position: 'relative', display: 'flex',height: 190, width: 190 }}>
              <Skeleton sx={{ height: '100%', width: '100%', position:'relative' }} animation="wave" variant="rounded" />
              <Typography
                variant="h4"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'rgba(0, 0, 0, 0.6)', // Adjust color as needed
                  fontWeight: 'bold',
                }}
              >
                Loading...
              </Typography>
            </Box>
          }
        </>
      )}
    </BCELOnePaymentContainer>
  );
};

export default BCELOnePayment;
