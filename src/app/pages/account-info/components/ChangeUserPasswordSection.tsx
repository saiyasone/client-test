import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
  styled,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { MUTATION_CHANGE_USER_PASSWORD } from "api/graphql/user.graphql";
import useAuth from "hooks/useAuth";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { successMessage } from "utils/alert.util";
import * as MUI from "../styles/accountInfo.styles";

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 3,
  width: 12,
  height: 12,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgb(16 22 26 / 40%)"
      : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "#f5f8fa",
  backgroundImage:
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
      : "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
  ".Mui-focusVisible &": {
    outline: "2px auto rgba(19,124,189,.6)",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: theme.palette.mode === "dark" ? "#30404d" : "#ebf1f5",
  },
  "input:disabled ~ &": {
    boxShadow: "none",
    background:
      theme.palette.mode === "dark"
        ? "rgba(57,75,89,.5)"
        : "rgba(206,217,224,.5)",
  },
}));
const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#17766B",
  backgroundImage:
    "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
  "&:before": {
    display: "block",
    width: 12,
    height: 12,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: "''",
  },
  "input:hover ~ &": {
    backgroundColor: "#17766B",
  },
});
function ChangeUserPasswordSection() {
  const theme = useTheme();
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [showPassword, setShowPassword] = useState<any>(false);
  const [showConfirm, setShowConfirm] = useState<any>(false);
  const [showCurrent, setShowCurrent] = useState<any>(false);
  const [passwordLong, setPasswordLong] = useState<any>(null);
  const [upperPassword, setUpperPassword] = useState<any>(null);
  const [numberPassword, setNumberPassword] = useState<any>(null);
  const [chanagePassowrd] = useMutation(MUTATION_CHANGE_USER_PASSWORD);
  const [errMessage, setErrMessage] = useState<any>(null);
  const [data, setData] = useState<any>({
    currentPassword: "",
    confirmPassword: "",
    newPassword: "",
  });
  const handleShowNew = () => {
    setShowPassword(!showPassword);
  };
  const handleShowConfirm = () => {
    setShowConfirm(!showConfirm);
  };
  const handleCurrentConfirm = () => {
    setShowCurrent(!showCurrent);
  };

  const handleChange = (event) => {
    const name = event.target?.name;
    const value = event.target?.value;
    setData((values) => ({ ...values, [name]: value }));

    if (event.target.name === "newPassword") {
      const regex = /^.{8,}$/;
      const upperCaseRegex = /([A-Z])+/;
      const numberRegex = /[0-9]|[ -/:-@[-`{-~]/;

      const isMatch = regex.test(value);
      const isUpperMatch = upperCaseRegex.test(value);
      const isNumberMatch = numberRegex.test(value);
      if (isMatch && isUpperMatch && isNumberMatch) {
        setErrMessage("");
      }
      setPasswordLong(isMatch);
      setUpperPassword(isUpperMatch);
      setNumberPassword(isNumberMatch);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordLong && upperPassword && numberPassword) {
        if (data.confirmPassword !== data.newPassword) {
          setErrMessage("Password confirm not match");
        } else {
          const changeNew = await chanagePassowrd({
            variables: {
              body: {
                confirmPassword: data.confirmPassword,
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
              },
              id: user?._id,
            },
          });

          if (changeNew?.data?.changePassword) {
            setData({
              currentPassword: "",
              confirmPassword: "",
              newPassword: "",
            });
            successMessage("Change password successful!", 3000);
          }
        }
      } else {
        if (!upperPassword) {
          setErrMessage("Password leaste one uppercase charachter !");
        } else if (!numberPassword) {
          setErrMessage("Password least one number or symbol !");
        }
      }
    } catch (error: any) {
      setErrMessage(error.message);
    }
  };

  return (
    <div>
      <MUI.PaperGlobal elevation={5}>
        <Typography variant="h6" sx={{ color: "#5D596C", fontWeight: "600" }}>
          Reset Your Password
        </Typography>
        <Grid
          container
          rowSpacing={1}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          mt={4}
        >
          <Grid item xs={12}>
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
              Current Password
            </InputLabel>
            <FormControl fullWidth>
              <OutlinedInput
                type={showCurrent ? "text" : "password"}
                placeholder="Please enter text"
                size="small"
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: "500",
                  color: "#5D596C",
                  padding: isMobile ? "0" : "0.2rem 0",
                }}
                endAdornment={
                  <InputAdornment position="end" sx={{ mr: 3 }}>
                    <Box
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showCurrent ? (
                        <AiOutlineEye
                          size="22"
                          onClick={handleCurrentConfirm}
                        />
                      ) : (
                        <AiOutlineEyeInvisible
                          size="22"
                          onClick={handleCurrentConfirm}
                        />
                      )}
                    </Box>
                  </InputAdornment>
                }
                name="currentPassword"
                value={data.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
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
              New Password
            </InputLabel>
            <FormControl fullWidth>
              <OutlinedInput
                placeholder="Please enter text"
                size="small"
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: "500",
                  color: "#5D596C",
                  padding: isMobile ? "0" : "0.2rem 0",
                }}
                type={showPassword ? "text" : "password"}
                endAdornment={
                  <InputAdornment position="end" sx={{ mr: 3 }}>
                    <Box
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? (
                        <AiOutlineEye size="22" onClick={handleShowNew} />
                      ) : (
                        <AiOutlineEyeInvisible
                          size="22"
                          onClick={handleShowNew}
                        />
                      )}
                    </Box>
                  </InputAdornment>
                }
                autoComplete="new-password"
                name="newPassword"
                onChange={handleChange}
                value={data.newPassword}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <InputLabel
              shrink
              sx={{
                fontSize: "1.2rem",
                fontWeight: "500",
                color: "#5D596C",
                marginTop: "0.8rem",
              }}
            >
              Confirm New Password
            </InputLabel>
            <FormControl fullWidth>
              <OutlinedInput
                placeholder="Please enter text"
                size="small"
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: "500",
                  color: "#5D596C",
                  padding: isMobile ? "0" : "0.2rem 0",
                }}
                type={showConfirm ? "text" : "password"}
                endAdornment={
                  <InputAdornment position="end" sx={{ mr: 3 }}>
                    <Box
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showConfirm ? (
                        <AiOutlineEye size="22" onClick={handleShowConfirm} />
                      ) : (
                        <AiOutlineEyeInvisible
                          size="22"
                          onClick={handleShowConfirm}
                        />
                      )}
                    </Box>
                  </InputAdornment>
                }
                name="confirmPassword"
                value={data?.confirmPassword}
                onChange={handleChange}
                autoComplete="confirm-password"
              />
            </FormControl>
          </Grid>
          <Box>
            {errMessage && (
              <Typography
                fontSize={isMobile ? "11px" : "0.8rem"}
                sx={{
                  height: "30px",
                  color: theme.palette.error.main,
                  ml: isMobile ? 1 : 3,
                  p: 0,
                }}
              >
                {errMessage}
              </Typography>
            )}
          </Box>
        </Grid>
        <Typography variant="h6" sx={{ color: "#5D596C" }} mt={5}>
          Password Requirements:
        </Typography>

        <MUI.BoxShowPasswordRequirement>
          <FormGroup sx={{ fontSize: "10px" }}>
            <FormControlLabel
              control={
                <Checkbox
                  icon={<BpIcon />}
                  checkedIcon={<BpCheckedIcon />}
                  checked={passwordLong ? true : false}
                />
              }
              label="Minimum 8 character long-the more, the better"
            />
            <FormControlLabel
              control={
                <Checkbox
                  icon={<BpIcon />}
                  checkedIcon={<BpCheckedIcon />}
                  checked={upperPassword ? true : false}
                />
              }
              label="At least one lowercase character"
            />
            <FormControlLabel
              control={
                <Checkbox
                  icon={<BpIcon />}
                  checkedIcon={<BpCheckedIcon />}
                  checked={numberPassword ? true : false}
                />
              }
              label="At least one number, symbol, or whitespace character"
            />
          </FormGroup>
        </MUI.BoxShowPasswordRequirement>
        <MUI.BoxShowActionsButton>
          <Button
            sx={{
              background: "#17766B",
              color: "#ffffff",
              padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
              fontSize: isMobile ? "0.8rem" : "",
              border: "1px solid transparent",
              "&:hover": {
                color: "#17766B",
                borderColor: "#17766B",
              },
            }}
            fullWidth={isMobile ? true : false}
            onClick={handleChangePassword}
          >
            Save Change
          </Button>
          <Button
            sx={{
              marginLeft: isMobile ? "0.5rem" : "1.5rem",
              background: "#F1F1F2",
              color: "#5D596C",
              padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 4rem",
              fontSize: isMobile ? "0.8rem" : "",
              "&:hover": {
                color: "#17766B",
              },
            }}
            fullWidth={isMobile ? true : false}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
        </MUI.BoxShowActionsButton>
      </MUI.PaperGlobal>
    </div>
  );
}

export default ChangeUserPasswordSection;
