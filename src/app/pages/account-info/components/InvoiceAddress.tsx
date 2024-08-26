import {
  Box,
  Button,
  FormControl,
  Grid,
  OutlinedInput,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useContext } from "react";
import CustomInputLabel from "./InputLabel";
import useAuth from "hooks/useAuth";
import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_USER } from "api/graphql/user.graphql";
import { successMessage } from "utils/alert.util";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { ENV_KEYS } from "constants/env.constant";
import axios from "axios";

function InvoiceAddress() {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { user }: any = useAuth();
  const [updateUser] = useMutation(MUTATION_UPDATE_USER);
  const [errMessage, setErrMessage] = React.useState<any>(null);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [data, setData] = React.useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    zipCode: "",
    address: "",
  });
  React.useEffect(() => {
    setData(user);
  }, [user]);

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

  const handleUpdateUser = async () => {
    const userData = await updateUser({
      variables: {
        id: user?._id,
        body: {
          firstName: data?.firstName,
          lastName: data?.lastName,
          username: data.email,
          phone: data.phone,
          address: data.address,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
      },
    });

    if (userData?.data.updateUser) {
      const description = [
        {
          update_profile: "Update invoice address",
          status: "Success",
        },
      ];

      handleCreateLogs("Update invoice address", description, user?._id);
      successMessage("Update profile success", 2000);
      eventUploadTrigger.trigger();
    }
  };

  return (
    <Grid
      container
      rowSpacing={1}
      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
      mt={4}
    >
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">Name</CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Enter enter first name ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            autoComplete="firstName"
            name="firstName"
            value={data.firstName || ""}
            onChange={(e) =>
              setData({
                ...data,
                firstName: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">Name</CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Enter enter last name ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            autoComplete="lastName"
            name="lastName"
            value={data.lastName || ""}
            onChange={(e) =>
              setData({
                ...data,
                lastName: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">
          Email address
        </CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Please enter email address ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#4B465C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            name="email"
            autoComplete="email"
            value={data.email || ""}
            onChange={(e) =>
              setData({
                ...data,
                email: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">
          Mobile Number
        </CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Please enter phone number ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            autoComplete="phone"
            name="phone"
            value={data.phone || ""}
            onChange={(e) =>
              setData({
                ...data,
                phone: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">Country</CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Please select country ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            name="country"
            autoComplete="country"
            value={data?.countryId?.name || ""}
            onChange={(e) =>
              setData({
                ...data,
                country: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">State</CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Please enter state ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            autoComplete="state"
            name="state"
            value={data?.state || ""}
            onChange={(e) =>
              setData({
                ...data,
                state: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">Zip Code</CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            placeholder="Please enter zipcode ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            type="text"
            name="zipCode"
            autoComplete="zip-code"
            value={data?.zipCode || ""}
            onChange={(e) =>
              setData({
                ...data,
                zipCode: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <CustomInputLabel htmlFor="bootstrap-input">Address</CustomInputLabel>
        <FormControl fullWidth>
          <OutlinedInput
            type="text"
            placeholder="Please enter address ...."
            size="small"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: "#5D596C",
              padding: isMobile ? "0" : "0.2rem 0",
            }}
            name="address"
            autoComplete="address"
            value={data?.address || ""}
            onChange={(e) =>
              setData({
                ...data,
                address: e.target.value,
              })
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} mt={4}>
        <Button
          sx={{
            background: "#17766B",
            color: "#ffffff",
            padding: isMobile ? "0.3rem 0rem" : "0.5rem 2rem",
            fontSize: isMobile ? "0.8rem" : "",
            "&:hover": {
              color: "#17766B",
            },
          }}
          fullWidth={isMobile ? true : false}
          onClick={handleUpdateUser}
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
        >
          Cancel
        </Button>
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
  );
}

export default InvoiceAddress;
