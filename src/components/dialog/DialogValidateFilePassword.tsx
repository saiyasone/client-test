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
import CryptoJS from "crypto-js";
import { useState } from "react";
import { errorMessage } from "utils/alert.util";
import { combineOldAndNewFileNames, cutFileName } from "utils/file.util";

function DialogValidateFilePassword(props) {
  const [textPassword, setTextPassword] = useState("");
  const isMobile = useMediaQuery("(max-width: 600px)");
  const {
    isOpen,
    checkType,
    filePassword,
    filename,
    newFilename,
    onConfirm,
    onClose,
  } = props;

  function handleClose() {
    setTextPassword("");
    onClose();
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    if (textPassword) {
      const hashPassword = CryptoJS.MD5(textPassword).toString();
      if (hashPassword === filePassword) {
        setTextPassword("");
        onConfirm();
      } else {
        errorMessage("Password is incorrect", 3000);
      }
    }
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
              {checkType === "folder"
                ? filename
                : cutFileName(
                    combineOldAndNewFileNames(
                      filename || "",
                      newFilename || "",
                    ) as string,
                    10,
                  )}
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

export default DialogValidateFilePassword;
