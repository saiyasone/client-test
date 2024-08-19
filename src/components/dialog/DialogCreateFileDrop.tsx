import * as Mui from "styles/dialog/dialogCreateFileDrop.style";

// component and functions
import { useLazyQuery } from "@apollo/client";
//mui component and style
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  styled,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { styled as muiStyled } from "@mui/system";
import { QUERY_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import BaseDialogV1 from "components/BaseDialogV1";
import { ENV_KEYS } from "constants/env.constant";
import { Form, Formik } from "formik";
import useAuth from "hooks/useAuth";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { successMessage } from "utils/alert.util";
import { generateRandomUniqueNumber } from "utils/number.util";
import * as Yup from "yup";
import ReplyAllSharpIcon from "@mui/icons-material/ReplyAllSharp";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import QRCode from "react-qr-code";
import {
  handleDownloadQRCode,
  handleShareQR,
} from "utils/image.share.download";
import { decryptId } from "utils/secure.util";
import { DatePicker } from "@mui/x-date-pickers";

const DialogPreviewFileV1Boby = muiStyled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  rowGap: theme.spacing(3),
  "& .MuiDialogActions-root": {
    display: "none",
  },
}));

const createFileDropSchema = Yup.object().shape({
  title: Yup.string().min(2).max(50).trim().required(),
  description: Yup.string()
    .min(2)
    .trim()
    .transform((val) => (val ? val : null))
    .nullable(),
});

const DatePickerV1Container = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "100%",
  position: "relative",
});

const DatePickerV1Lable = styled(Box)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  textAlign: "start",
  color: "rgb(0,0,0,0.75)",
  position: "absolute",
  top: "-1rem",
  left: "2px",
}));

const DatePickerV1Content = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: "100%",
  position: "relative",
}));

const DialogCreateFileDrop = (props) => {
  const { user }: any = useAuth();
  const link = ENV_KEYS.VITE_APP_FILE_DROP_LINK || "";
  const qrCodeRef = useRef<SVGSVGElement | any>(null);
  const [value, setValue] = useState(link);
  const [isCopy, setIsCopy] = useState(false);
  const [showValid, setShowValid] = useState<boolean>(false);
  const [isShow, setIsShow] = useState(false);
  const [selectDay, setSelectDay] = useState(1);
  const [expiredDate, setExpiredDate] = useState<any>(null);
  const [latestUrl, setLatestUrl] = useState("");
  const [activePrivateFileDrop, setActivePrivateFileDrop] = useState<any>({
    title: "",
    description: "",
  });
  const mMobileScreen = useMediaQuery("(max-width:320px)");
  const [packageType, setPackageType] = useState("Free");
  const [selectDate, setSelectDate] = useState<moment.Moment | null>(null);

  const [queryFileDropLinks] = useLazyQuery(QUERY_FILE_DROP_URL_PRIVATE, {
    fetchPolicy: "no-cache",
  });

  const handleCopyLink = () => {
    setIsCopy(true);
    setShowValid(true);
    successMessage("You've copied link!!", 3000);
  };

  const calculateExpirationDate = (days) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + days);

    return expirationDate.toISOString();
  };

  const handleExpiredDateChange = (event) => {
    const selectedDays = event.target.value;
    setSelectDay(selectedDays);

    const expirationDateTime = calculateExpirationDate(selectedDays);
    setExpiredDate(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
  };

  const handleGenerateLink = (values) => {
    successMessage("Create file drop link successful!", 3000);
    setIsCopy(false);

    handleExpiredDateChange({
      target: {
        value: selectDay || 1,
      },
    });

    const genLink = link + user?._id + "-" + generateRandomUniqueNumber();
    setValue(genLink);
    setIsShow(true);
    props.handleChange(genLink, expiredDate, values, activePrivateFileDrop);
  };

  const handleDateChange = (date: moment.Moment | null) => {
    if (date) {
      const currentDate = moment().startOf("day").utc();
      const totalDays = date.startOf("day").utc().diff(currentDate, "days");
      setSelectDate(currentDate);

      if (totalDays > 0) {
        const expirationDateTime = calculateExpirationDate(totalDays);
        setExpiredDate(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
      }
    }
  };

  const queryFileDropLink = async () => {
    try {
      const result = (
        await queryFileDropLinks({
          variables: {
            where: {
              folderId: props?.folderId,
              createdBy: user?._id,
              status: "opening",
            },
            orderBy: "createdAt_DESC",
          },
        })
      ).data?.getPrivateFileDropUrl?.data;
      if (result) {
        const lastRecord = result[result.length - 1];
        setLatestUrl(lastRecord?.url);
        setActivePrivateFileDrop(lastRecord);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (props?.folderId && user) {
      queryFileDropLink();
    }
  }, [props?.folderId, user]);

  useEffect(() => {
    if (expiredDate) {
      setExpiredDate(null);
    }
  }, [props?.isOpen]);

  useEffect(() => {
    if (showValid) {
      setTimeout(() => {
        setShowValid(false);
      }, 5000);
    }
  }, [showValid]);

  useEffect(() => {
    const data: any = localStorage[ENV_KEYS.VITE_APP_USER_DATA_KEY]
      ? localStorage.getItem(ENV_KEYS.VITE_APP_USER_DATA_KEY)
      : null;

    if (data) {
      const plainData = decryptId(
        data,
        ENV_KEYS.VITE_APP_LOCAL_STORAGE_SECRET_KEY,
      );

      if (plainData) {
        const jsonPlain = JSON.parse(plainData);
        if (
          jsonPlain &&
          jsonPlain?.packageId &&
          jsonPlain?.packageId?.category
        ) {
          const category = jsonPlain?.packageId?.category;
          if (category) {
            setPackageType(category);
          }
        }
      }
    }
  }, [packageType]);

  return (
    <BaseDialogV1
      {...props}
      dialogProps={{
        PaperProps: {
          sx: {
            overflowY: "initial",
            maxWidth: "500px",
          },
        },
        sx: {
          columnGap: "20px",
        },
      }}
      dialogContentProps={{
        sx: {
          backgroundColor: "white !important",
          borderRadius: "6px",
          padding: (theme) => `${theme.spacing(5)}`,
        },
      }}
    >
      <DialogPreviewFileV1Boby>
        <Mui.FiledropContainer>
          <Formik
            initialValues={{
              title: activePrivateFileDrop?.title || "",
              description: activePrivateFileDrop?.description || "",
              allowDownload: false,
              allowMultiples: false,
              allowUpload: true,
            }}
            enableReinitialize
            validationSchema={createFileDropSchema}
            onSubmit={handleGenerateLink}
          >
            {({ /* errors, touched */ values, handleChange }) => (
              <Form>
                <Mui.ShowHeaderDetail>
                  <Typography variant="h3">
                    Select expired date to this link! Default: 24 hours
                  </Typography>
                  <Typography variant="h6">
                    Please share this link with the intended recipient of the
                    file.
                  </Typography>
                </Mui.ShowHeaderDetail>

                <FormControl
                  sx={{
                    mt: "0.5rem",
                    display: "block",
                  }}
                >
                  <Typography
                    component="label"
                    sx={{
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    Title
                  </Typography>
                  <TextField
                    /* {...{
                      ...(errors.title &&
                        touched.title && {
                          error: true,
                          helperText: errors.title || "",
                        }),
                    }}
                    FormHelperTextProps={{
                      sx: {
                        ml: 0,
                      },
                    }} */
                    id="title"
                    name="title"
                    autoFocus
                    size="small"
                    placeholder="title"
                    type="text"
                    fullWidth
                    value={values.title}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: false,
                    }}
                    sx={{ userSelect: "none" }}
                  />
                </FormControl>
                <FormControl
                  sx={{
                    mt: "0.5rem",
                    display: "block",
                  }}
                >
                  <Typography
                    component="label"
                    sx={{
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    Description
                  </Typography>
                  <TextField
                    /* {...{
                      ...(errors.description &&
                        touched.description && {
                          error: true,
                          helperText: errors.description,
                        }),
                    }}
                    FormHelperTextProps={{
                      sx: {
                        ml: 0,
                      },
                    }} */
                    id="description"
                    name="description"
                    autoFocus
                    size="small"
                    placeholder="description"
                    type="text"
                    fullWidth
                    value={values.description}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: false,
                    }}
                    sx={{ userSelect: "none" }}
                  />
                </FormControl>

                <Mui.GenerateLinkArea>
                  <Grid container gap={6}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 5,
                        }}
                      >
                        {packageType ? (
                          packageType.toLowerCase().indexOf("free") === 0 ||
                          packageType?.toLowerCase().indexOf("anonymous") ===
                            0 ? (
                            <FormControl sx={{ width: "40%" }} size="small">
                              <InputLabel id="expireDate">
                                Expired date
                              </InputLabel>
                              <Select
                                labelId="expireDate"
                                id="expireDate"
                                name="expireDate"
                                value={selectDay}
                                label="Expired date"
                                onChange={handleExpiredDateChange}
                              >
                                <MenuItem value={1}>
                                  1 {mMobileScreen ? "d" : "day"}
                                </MenuItem>
                                <MenuItem value={2}>
                                  2 {mMobileScreen ? "d" : "day"}
                                </MenuItem>
                                <MenuItem value={3}>
                                  3 {mMobileScreen ? "d" : "day"}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <DatePickerV1Container sx={{ width: "40%" }}>
                              <DatePickerV1Lable>
                                Expired date
                              </DatePickerV1Lable>
                              <DatePickerV1Content
                                sx={{
                                  "& .MuiTextField-root": {
                                    width: "100% !important",
                                  },
                                  "& .MuiInputBase-root": {},
                                  "input::placeholder": {
                                    opacity: "1 !important",
                                    color: "#9F9F9F",
                                  },
                                }}
                              >
                                <DatePicker
                                  format="DD/MM/YYYY"
                                  name="demo-simple-select"
                                  value={selectDate}
                                  sx={{
                                    ".MuiInputBase-root": {
                                      height: "35px",
                                    },
                                  }}
                                  onChange={(date) => handleDateChange(date)}
                                />
                              </DatePickerV1Content>
                            </DatePickerV1Container>
                          )
                        ) : null}
                        <FormControl sx={{ width: "40%" }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                id="allowDownload"
                                name="allowDownload"
                                checked={values.allowDownload}
                                onChange={handleChange}
                              />
                            }
                            label="Allow Download"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                id="allowUpload"
                                name="allowUpload"
                                checked={values.allowUpload}
                                onChange={handleChange}
                              />
                            }
                            label="Allow Upload"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                id="allowMultiples"
                                name="allowMultiples"
                                checked={values.allowMultiples}
                                onChange={handleChange}
                              />
                            }
                            label="Allow Multiples"
                          />
                        </FormControl>
                      </Box>
                    </Grid>
                    {/* <Grid item xs={12} md={4}>
                <Button
                      variant="contained"
                      onClick={generateFileDropLink}
                      sx={{ width: { xs: "100%" }, }}
                    >
                      Generate link now
                    </Button>
                </Grid> */}
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "flex-end", md: "flex-start" },
                        ml: "auto",
                      }}
                    >
                      <Button variant="contained" type="submit" fullWidth>
                        Generate link now
                      </Button>
                    </Grid>
                  </Grid>
                </Mui.GenerateLinkArea>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "start",
                    flexDirection: "column",
                  }}
                >
                  {isShow && (
                    <Grid container sx={{ mt: 10 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: { xs: "center", md: "flex-start" },
                        }}
                      >
                        <div
                          ref={qrCodeRef}
                          style={{
                            display: "flex",
                            padding: "7px",
                            border: "1px solid gray",
                            borderRadius: "7px",
                          }}
                        >
                          <QRCode
                            style={{ width: "100px", height: "100px" }}
                            value={value}
                            viewBox={`0 0 256 256`}
                          />
                        </div>

                        <Box
                          sx={{ mt: { xs: 7, md: 2 }, ml: { xs: 0, md: 10 } }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "start",
                              justifyContent: "start",
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "0.8rem", color: "#4B465C" }}
                            >
                              This link:{" "}
                              <span style={{ color: "#17766B" }}>{value}</span>{" "}
                              will be expired on: &nbsp;
                              <span style={{ color: "#17766B" }}>
                                {expiredDate
                                  ? expiredDate
                                  : moment(calculateExpirationDate(1)).format(
                                      "YYYY-MM-DD h:mm:ss",
                                    )}
                                .
                              </span>
                            </Typography>
                            <TextField
                              sx={{
                                width: "100%",
                                fontSize: "18px !important",
                                color: "grey !important",
                                marginTop: 4,
                              }}
                              size="small"
                              InputLabelProps={{
                                shrink: false,
                              }}
                              disabled
                              value={value !== link ? value : latestUrl || ""}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {isCopy && showValid ? (
                                      <IconButton>
                                        <DownloadDoneIcon
                                          sx={{ color: "#17766B" }}
                                        />
                                      </IconButton>
                                    ) : (
                                      <CopyToClipboard
                                        text={
                                          value !== link
                                            ? value
                                            : latestUrl || ""
                                        }
                                        onCopy={handleCopyLink}
                                      >
                                        <IconButton
                                          aria-label="copy"
                                          disabled={
                                            latestUrl
                                              ? false
                                              : value == link
                                              ? true
                                              : false
                                          }
                                        >
                                          <ContentCopyIcon
                                            sx={{ fontSize: "1rem" }}
                                          />
                                        </IconButton>
                                      </CopyToClipboard>
                                    )}
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: {
                                xs: "center",
                                md: "space-between",
                              },
                              mt: 7,
                            }}
                          >
                            <Button
                              variant="contained"
                              onClick={(e) =>
                                handleDownloadQRCode(e, qrCodeRef, {
                                  title: values.title,
                                  description: values.description,
                                })
                              }
                              sx={{ width: "130px" }}
                            >
                              <DownloadSharpIcon sx={{ mr: 3 }} />
                              Download
                            </Button>
                            <Button
                              variant="contained"
                              onClick={(e) =>
                                handleShareQR(e, qrCodeRef, {
                                  title: values.title,
                                  description: values.description,
                                })
                              }
                              sx={{ ml: 5, width: "130px" }}
                            >
                              Share
                              <ReplyAllSharpIcon
                                sx={{
                                  ml: 3,
                                  transform: "rotate(180deg) scale(1,-1)",
                                }}
                              />
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Box>
              </Form>
            )}
          </Formik>
        </Mui.FiledropContainer>
      </DialogPreviewFileV1Boby>
    </BaseDialogV1>
  );
};

export default DialogCreateFileDrop;
