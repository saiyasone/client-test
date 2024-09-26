import { Box, Paper, Typography, styled } from "@mui/material";
 
import { Fragment, useEffect, useState } from "react";
import { FaCheckCircle, FaLock } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import vshareIcon from "assets/images/file-password-icon.png";
import ResetFilePasswordComponent from "components/reset-file-password/ResetFilePassword";
 
import { decryptDataLink } from "utils/secure.util";

const ResetPasswordContainer = styled("div")({
  width: "100%",
  height: "90vh",
  maxWidth: "560px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const Wrapper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(6)};

  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(8)};
  }
  ${(props) => props.theme.breakpoints.down("sm")} {
    padding: ${(props) => props.theme.spacing(4)};
    margin: ${(props) => props.theme.spacing(4)};
  }
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  flex-grow: 1;
`;
//components
const LogoBrand = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginBottom: "1rem",
});

function ResetFilePassword() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileURL = params.get("file");

  const [isDone, setIsDone] = useState(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    data: {},
    type: "",
  });

  function handleIsDone() {
    setIsDone(true);
  }

  useEffect(() => {
    try {
      const bytes = decryptDataLink(fileURL);
      setDataForEvent({
        data: bytes,
      });
    } catch (error) {
      console.error(error);
    }
  }, [fileURL]);

  return (
    <ResetPasswordContainer>
      <Wrapper>
        <LogoBrand>
          <img src={vshareIcon} alt="vshare-logo" width={130} />
        </LogoBrand>

        {isDone ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaCheckCircle
              color="#17766B"
              size={20}
              style={{ marginRight: 10 }}
            />
            <Typography mt={1} variant="h4" gutterBottom>
              Your password has been reset
            </Typography>
          </Box>
        ) : (
          <Fragment>
            <Typography
              sx={{ mb: 6 }}
              component="h1"
              variant="h4"
              align="center"
              gutterBottom
            >
              Reset file password
              <FaLock fill="#9e9d24" size="16" style={{ marginLeft: 10 }} />
            </Typography>

            <ResetFilePasswordComponent
              dataValue={dataForEvent.data}
              onPressDone={handleIsDone}
            />
          </Fragment>
        )}
      </Wrapper>
    </ResetPasswordContainer>
  );
}

export default ResetFilePassword;
