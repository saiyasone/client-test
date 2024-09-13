import { useMutation } from "@apollo/client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  createTheme,
  IconButton,
  InputAdornment,
  OutlinedInput,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { MUTATION_UPDATE_FILE } from "api/graphql/file.graphql";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import { useLockedFile } from "hooks/file/useLockedFile";
import React from "react";
import { IFileTypes } from "types/filesType";
import { errorMessage, successMessage } from "utils/alert.util";
const theme = createTheme();

const FormLabel = styled("label")({
  display: "block",
  marginBottom: 2,
  fontSize: "0.85rem",
});

interface fileTypes {
  data: IFileTypes;
  handleClose: () => void;
}

export default function FileLock ({ data, handleClose }: fileTypes) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [lockPassword, setLockPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const { createLockFile } = useLockedFile();
  const { setIsAutoClose } = useMenuDropdownState();
  const generateMainPassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setLockPassword(password);
  };

  const handleUpdateFile = async () => {
    const response = await createLockFile({
      data,
      password: lockPassword,
    });
    if (response.success) {
      successMessage(response.message, 2000);
      setIsAutoClose(true);
      setTimeout(() => {
        handleClose();
      }, 200);
    } else {
      errorMessage(response.message, 2000);
    }
  };

  return (
    <>
      <Box sx={{ py: 4, margin:"30px 20px 20px 20px" }}>
        <FormLabel htmlFor="passwordLink">Enter password</FormLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          type={showPassword ? "text" : "password"}
          fullWidth
          defaultValue="Normal"
          required
          onChange={(e) => setLockPassword(e.target.value)}
          value={lockPassword}
          sx={{ bgcolor: theme.palette.grey[200] }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                edge="end"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
        <Typography
          component="p"
          sx={{
            fontSize: "12px",
            display: "flex",
            justifyContent: "end",
            cursor: "pointer",
            "&:hover": {
              color: theme.palette.primary.main,
            },
          }}
          onClick={generateMainPassword}
        >
          Random password
        </Typography>

        <Box sx={{ mt: 5 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth={isMobile ? true : false}
            onClick={handleUpdateFile}
          >
            Create password
          </Button>
        </Box>
      </Box>
    </>
  );
}
