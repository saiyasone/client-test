import { Box, Checkbox, FormControl, FormControlLabel, styled, TextField, Typography } from "@mui/material";
import BaseDialogV1 from "components/BaseDialogV1";
import { styled as muiStyled } from "@mui/system";
import { Form, Formik } from "formik";
import moment from "moment";
import * as yup from 'yup';
import { DatePicker } from "@mui/x-date-pickers";
import NormalButton from "components/NormalButton";
import { MUTATION_UPDATE_FILE_DROP_URL } from "api/graphql/fileDrop.graphql";
import { useMutation } from "@apollo/client";
import { errorMessage, successMessage, warningMessage } from "utils/alert.util";
import { convertObjectEmptyStringToNull } from "utils/object.util";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { useState } from "react";


const DialogPreviewFileV1Boby = muiStyled("div")(({ theme }) => ({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    rowGap: theme.spacing(3),
    padding: '1.5rem',
    "& .MuiDialogActions-root": {
      display: "none",
    },
  }));
  
  const DatePickerV1Container = styled(Box)({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: "100%",
    position: 'relative'
  });
  
  const DatePickerV1Lable = styled(Box)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
    textAlign: 'start',
    color: 'rgb(0,0,0,0.75)',
    position: 'absolute',
    top:'-1rem',
    left: '2px'
  }));
  
  const DatePickerV1Content = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(1),
    width: "100%",
    position: 'relative'
  }));
  

  const DialogEditExpiryLinkFileDrop = (props) => {
    const [updateFileDrop] = useMutation(MUTATION_UPDATE_FILE_DROP_URL);
    const manageGraphqlError = useManageGraphqlError();
    const {data} = props;
    const [title, settitle] = useState<string>(data?.title);
    const [description, setDescription] = useState<string>(data?.description);
    const [permission, setPermission] = useState({
      allowDownload: data?.allowDownload,
      allowUpload: data?.allowUpload,
      allowMultiples: data?.allowMultiples,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setPermission(prevData => ({
          ...prevData,
          [name]: checked,
      }));
  };

    const handleSubmitChange = async() => {
      try {
        if(!data?._id || !data?.expiredAt){
          warningMessage('Invalid data');
          return;
        }
        
        const fileDropLink = await updateFileDrop({
          variables: {
            id: data?._id,
            input: convertObjectEmptyStringToNull({
              expiredAt: moment(data?.expiredAt).format("YYYY-MM-DD h:mm:ss"),
              allowDownload: permission?.allowDownload,
              allowUpload: permission?.allowUpload,
              allowMultiples: permission?.allowMultiples,
              ...(title && title !== data?.title && {
                title: title
              }),
              ...(description && description !== data?.description && {
                description: description
              })
            }),
          },
        });
        if (fileDropLink?.data?.updateFileDropUrl) {
          successMessage("Updated file-drop link successfully!", 2000);
          props.onClose();
        }
      } catch (error) {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(cutErr) as string,
          3000,
        );
      }
    }

    return(
      <BaseDialogV1
      {...props}
      dialogProps={{
        PaperProps: {
          sx: {
            overflowY: "initial",
            maxWidth: {
              xs:"100%",
              md:'50%',
              lg:'450px'
            },
          },
        },
      }}
      dialogContentProps={{
        sx: {
          backgroundColor: "white !important",
          borderRadius: "6px",
          padding: (theme) => `${theme.spacing(0)} ${theme.spacing(0)}`,
        },
      }}
    >
      
      <Typography variant="h4" component={'div'} sx={{
          mb: 5,
          borderBottom: 1,
          borderColor: '#ddd !important',
          color: 'rgb(0,0,0,0.8)',
          padding:'.7rem 1.5rem'
        }}>
          Modify Information
        </Typography>
      <DialogPreviewFileV1Boby>

        <Formik
          initialValues={{date: moment(data?.expiredAt).utc(true) || null}}
          validationSchema={yup.object().shape({
            date: yup.string().required('Date is required')
          })}
          enableReinitialize
          onSubmit={handleSubmitChange}
        >
            <Form>
              <DatePickerV1Container>
                <DatePickerV1Lable>Title</DatePickerV1Lable>
                <TextField
                    id="title"
                    name="title"
                    placeholder="Change title?"
                    value={title}
                    onChange={(e)=>{
                      settitle(e.target.value);
                    }}
                    size="small"
                    sx={{mt: 1}}
                />
              </DatePickerV1Container>
              <DatePickerV1Container sx={{mt: 7}}>
                <DatePickerV1Lable>Description</DatePickerV1Lable>
                <TextField
                    id="description"
                    name="description"
                    placeholder="Change description?"
                    value={description}
                    onChange={(e)=>{
                      setDescription(e.target.value);
                    }}
                    required
                    size="small"
                    sx={{mt: 1}}
                />
              </DatePickerV1Container>
              <DatePickerV1Container sx={{mt: 7}}>
                <DatePickerV1Lable>Expired Date</DatePickerV1Lable>
                <DatePickerV1Content sx={{
                  "& .MuiTextField-root": {
                    width: "100% !important",
                  },
                  "& .MuiInputBase-root": {},
                  "input::placeholder": {
                    opacity: "1 !important",
                    color: "#9F9F9F",
                  },
                }}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    name="date"
                    value={moment(data?.expiredAt).utc(true) || null}
                    sx={{
                      '.MuiInputBase-root': {
                        height: '35px',
                      },
                    }}
                    onChange={(date)=>{
                      data.expiredAt = moment(date).utc(true);
                    }}
                  />
                </DatePickerV1Content>
              </DatePickerV1Container>
              <FormControl sx={{display:'flex', flexDirection:{xs:'column', md:'row'}, justifyContent:'center !important', mt: 4}}>
                <FormControlLabel control={<Checkbox id="allow-download" name="allowDownload" checked={permission.allowDownload} onChange={handleChange} />} label="Allow Download" />
                <FormControlLabel control={<Checkbox id="allow-upload" name="allowUpload" checked={permission.allowUpload} onChange={handleChange} />} label="Allow Upload" />
                <FormControlLabel control={<Checkbox id="allow-multiple" name="allowMultiples" checked={permission.allowMultiples} onChange={handleChange} />} label="Allow Multiples" />
              </FormControl>
              <NormalButton
                type="submit"
                sx={{
                  width: {xs:'100%', md:"70%"},
                  height: "35px",
                  margin:'2rem auto 0',
                  padding: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
                  borderRadius: (theme) => theme.spacing(1),
                  backgroundColor: (theme) => theme.palette.primaryTheme.main,
                  textAlign: "center",
                  display: "block",
                  color: "white !important",
                }}
              >
                Submit Change
              </NormalButton>
          </Form>
        </Formik>
      </DialogPreviewFileV1Boby>
    </BaseDialogV1>
    )
  }

  export default DialogEditExpiryLinkFileDrop;