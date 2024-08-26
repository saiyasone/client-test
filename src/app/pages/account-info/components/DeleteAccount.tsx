import { useMutation } from "@apollo/client";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MUTATION_UPDATE_USER } from "api/graphql/user.graphql";
import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import React from "react";
import { errorMessage, successMessage } from "utils/alert.util";

function DeleteAccount() {
  const { user, signOut }: any = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [checked, setChecked] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");
  const [updateUser] = useMutation(MUTATION_UPDATE_USER);
  const manageGraphqlError = useManageGraphqlError();

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleCreateLogs = (name, infor, _id) => {
    const data: any = JSON.stringify({
      name: name,
      description: infor,
      createdBy: _id,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: ENV_KEYS.VITE_APP_CREATE_LOG,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error;
      });
  };

  const handleDeactive = async () => {
    try {
      if (checked) {
        const userData = await updateUser({
          variables: {
            id: user?._id,
            body: {
              status: "deleted",
            },
          },
        });
        if (userData?.data?.updateUser) {
          successMessage("Your an account deactive", 3000);
          setMessage(
            "Your an account deactive please contact vshare.net support",
          );
          setTimeout(() => {
            signOut();
          }, 5000);
          const description = [
            {
              inactive_account: "Inactive Account",
              status: "Success",
            },
          ];
          handleCreateLogs("Update profile", description, user?._id);
        }
      } else {
        setMessage("Please confirm deactive an account");
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      const description = [
        {
          inactive_account: "Inactive Account",
          status: "Failed",
        },
      ];
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
      handleCreateLogs("Update profile", description, user?._id);
    }
  };
  return (
    <>
      <Typography
        variant="h4"
        sx={{
          color: "#5D596C",
          fontSize: isMobile ? "0.8rem" : "",
        }}
      >
        Delete Account
      </Typography>
      <Alert
        severity="warning"
        sx={{
          marginTop: "1rem",
        }}
      >
        <AlertTitle
          sx={{
            fontSize: isMobile ? "0.8rem" : "1rem",
            color: "#FF9F43",
          }}
        >
          Are you sure you want to delete your account?
        </AlertTitle>
        <Typography
          variant="h6"
          sx={{
            color: "#FF9F43",
            fontSize: isMobile ? "0.8rem" : "1rem",
          }}
        >
          Once you delete your account, there is no going back. Please be
          certain.
        </Typography>
      </Alert>
      <Box
        sx={{
          color: "#6F6B7D",
          margin: "1rem 0",
          fontSize: "0.8rem",
        }}
      >
        <FormControlLabel
          required
          sx={{ color: "#6F6B7D" }}
          control={<Checkbox checked={checked} onChange={handleChange} />}
          label="I confirm my account deactivation"
        />
      </Box>
      {message && (
        <Typography component="p" sx={{ color: theme.palette.error.main }}>
          {message}
        </Typography>
      )}
      <Box sx={{ margin: "1rem 0" }}>
        <Button
          color="error"
          variant="contained"
          sx={{
            padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
            fontSize: isMobile ? "0.8rem" : "",
          }}
          disabled={message ? true : false}
          fullWidth={isMobile ? true : false}
          onClick={handleDeactive}
        >
          Deactive Account
        </Button>
      </Box>
    </>
  );
}

export default DeleteAccount;
