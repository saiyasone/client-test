import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  TextField,
  InputLabel as label,
  styled,
} from "@mui/material";
import { MUTATION_RESET_FILE_PASSWORD } from "api/graphql/secure.graphql";
import { Formik } from "formik";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { Fragment } from "react";
import { errorMessage, successMessage } from "utils/alert.util";
import * as yup from "yup";

const FormContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const InputLabel = styled(label)({
  fontSize: "14px",
  display: "block",
  marginBottom: "4px",
});

const ButtonAction = styled("div")({
  textAlign: "center",
  marginTop: "1.5rem",
});

function ResetFilePasswordComponent(props) {
  const { dataValue, onPressDone } = props;
  const manageGraphqlError = useManageGraphqlError();
  // graph ql
  const [resetPasswordAction] = useMutation(MUTATION_RESET_FILE_PASSWORD);

  const schemaValidation = yup.object().shape({
    newPassword: yup.string().required("New password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword"), ""], "Passwords must match")
      .required("Confirm password is required"),
  });

  async function handleResetPassword(values, { resetForm }) {
    try {
      const result = await resetPasswordAction({
        variables: {
          data: {
            newpassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          },
          where: {
            _id: dataValue._id,
            type: dataValue.type,
          },
        },
      });

      if (result.data?.changePasswordFolderAndFile?.status === 200) {
        resetForm();
        onPressDone();
        successMessage("Your password has been successfully reset", 3000);
      }
    } catch (error: any) {
      const cutErr = error.message?.replace(/(ApolloError: )?Error: /, "");
      errorMessage(manageGraphqlError.handleErrorMessage(cutErr) || "", 3000);
    }
  }

  return (
    <Fragment>
      <Formik
        initialValues={{
          newPassword: "",
          confirmPassword: "",
        }}
        validationSchema={schemaValidation}
        onSubmit={handleResetPassword}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Box>
                <InputLabel>New password</InputLabel>
                <TextField
                  type="password"
                  name="newPassword"
                  size="small"
                  placeholder="New password"
                  error={Boolean(touched.newPassword && errors.newPassword)}
                  helperText={
                    touched.newPassword &&
                    typeof errors.newPassword === "string"
                      ? errors.newPassword
                      : undefined
                  }
                  onChange={handleChange}
                  value={values.newPassword}
                  fullWidth={true}
                />
              </Box>
              <Box>
                <InputLabel>Confirm password</InputLabel>
                <TextField
                  type="password"
                  size="small"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  error={Boolean(
                    touched.confirmPassword && errors.confirmPassword,
                  )}
                  helperText={
                    touched.confirmPassword &&
                    typeof errors.confirmPassword === "string"
                      ? errors.confirmPassword
                      : undefined
                  }
                  onChange={handleChange}
                  value={values.confirmPassword}
                  fullWidth={true}
                />
              </Box>
            </FormContainer>

            <ButtonAction>
              <Button variant="contained" type="submit">
                Reset password
              </Button>
            </ButtonAction>
          </form>
        )}
      </Formik>
    </Fragment>
  );
}

export default ResetFilePasswordComponent;
