import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    useMediaQuery,
  } from "@mui/material";
  import { useState } from "react";
  import { errorMessage } from "utils/alert.util";
  
  function DialogBackendVerifyPassword(props) {
    const [textPassword, setTextPassword] = useState("");
    const isMobile = useMediaQuery("(max-width: 600px)");
    const OneTimeUrl = props?.OneTimeUrl ? 
                        String(props?.OneTimeUrl).substring(0,10)+'...'+
                        String(props?.OneTimeUrl).substring(String(props?.OneTimeUrl).length - 5, String(props?.OneTimeUrl).length) : "";
    const {
      isOpen,
      onConfirm,
      onClose,
    } = props;
  
    function handleClose() {
      setTextPassword("");
      onClose();
    }
  
    function handleSubmit(evt) {
      evt.preventDefault();

      if(!textPassword)
      {
        errorMessage('Invalid password. Type your password again', 3000);
        return;
      }

      onConfirm(textPassword);
    }
  
    return (
      <Dialog open={isOpen}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: isMobile ? "0.9rem" : "1.2rem",
            }}
          >
            Confirm password
          </Typography>
        </DialogTitle>
  
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "10px 30px !important",
              maxWidth: "600px",
            }}
          >
            <Typography
              sx={{
                fontSize: isMobile ? "0.8rem" : "0.9rem",
                textAlign: "center",
              }}
            >
              Please enter your password for: <br />{" "}
              <span style={{ color: "#17766B" }}>
                {OneTimeUrl || "_ _ _ _ _"}
              </span>
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              size="small"
              type="password"
              label="Password"
              variant="standard"
              fullWidth={true}
              onChange={(e) => setTextPassword(e.target.value)}
              value={textPassword}
            />
  
            <Box
              sx={{
                marginTop: 5,
                display: "flex",
                justifyContent: "flex-end",
                gap: 3,
              }}
            >
              <Button
                type="button"
                variant="contained"
                color="error"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!textPassword ? true : false}
              >
                Save
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  
  export default DialogBackendVerifyPassword;
  