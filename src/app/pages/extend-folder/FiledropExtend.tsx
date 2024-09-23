import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { MUTATION_CREATE_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import { ENV_KEYS } from "constants/env.constant";
import { Form, Formik } from "formik";
import useAuth from "hooks/useAuth";
import moment from "moment";
import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { IFolderTypes } from "types/mycloudFileType";
import { successMessage } from "utils/alert.util";
import { generateRandomUniqueNumber } from "utils/number.util";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import { convertObjectEmptyStringToNull } from "utils/object.util";
import * as Yup from "yup";
import { DatePicker } from "@mui/x-date-pickers";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  handleDownloadQRCode,
  handleShareQR,
} from "utils/image.share.download";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import ReplyAllSharpIcon from "@mui/icons-material/ReplyAllSharp";
import { ShareSocial } from "components/social-media";
import useOuterClick from "hooks/useOuterClick";
import { styled, useTheme } from "@mui/system";
import { isUserPackage } from "utils/checkPackageUser";

const createFileDropSchema = Yup.object().shape({
  title: Yup.string().min(2).max(50).trim().required(),
  description: Yup.string()
    .min(2)
    .trim()
    .transform((val) => (val ? val : null))
    .nullable(),
});
const DatePickerV1Lable = styled(Box)(({ theme }) => ({
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

const DatePickerV1Container = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "100%",
  position: "relative",
});

interface FormValues {
  title: string;
  description: string;
  allowDownload: boolean;
  allowMultiples: boolean;
  allowUpload: boolean;
}
interface IFolderProps {
  data: IFolderTypes;
}
export default function FiledropExtend({ data }: IFolderProps) {
  const { user }: any = useAuth();
  const theme = useTheme();
  const link = ENV_KEYS.VITE_APP_FILE_DROP_LINK || "";
  const [selectDay, setSelectDay] = React.useState(1);
  const [expiredDate, setExpiredDate] = React.useState<any>(null);
  const [newLink, setNewLink] = React.useState<string>("");
  const qrCodeRef = useRef<SVGSVGElement | any>(null);
  const shareRef = useRef(null);
  const [isCopy, setIsCopy] = React.useState(false);
  const [shareLoading, setShareLoading] = React.useState<boolean>(false);
  const [isShared, setIsShared] = React.useState(false);
  const [selectDate, setSelectDate] = React.useState<moment.Moment | null>(
    null,
  );

  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );
  const [activePrivateFileDrop, setActivePrivateFileDrop] = React.useState<any>(
    {
      title: "",
      description: "",
    },
  );

  const isOuterClicked = useOuterClick(shareRef);

  React.useEffect(() => {
    setIsShared(isOuterClicked);
  }, [isOuterClicked]);

  setTimeout(() => {
    setIsCopy(false);
  }, 2000);

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

  const calculateExpirationDate = (days: any) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + days);

    return expirationDate.toISOString();
  };
  const handleExpiredDateChange = (event: any) => {
    const selectedDays = event.target.value;
    setSelectDay(selectedDays);

    const expirationDateTime = calculateExpirationDate(selectedDays);
    setExpiredDate(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
  };

  const handleCopyLink = () => {
    setIsCopy(true);
    successMessage("You've copied link!!", 2000);
  };
  const handleSocialNetworkClicked = (str: string) => {
    console.log(`${str} is clicked`);
  };
  const allowPermission = [
    { value: "allowDownload", label: "Allow Download" },
    { value: "allowUpload", label: "Allow Upload" },
    { value: "allowMultiples", label: "Allow Multiples" },
  ];
  const expireredOption = [
    { value: 1, label: "1 day" },
    { value: 2, label: "2 days" },
    { value: 3, label: "3 days" },
  ];
  const initialValues: FormValues = {
    title: activePrivateFileDrop?.title || "",
    description: activePrivateFileDrop?.description || "",
    allowDownload: activePrivateFileDrop?.allowDownload ?? false,
    allowMultiples: activePrivateFileDrop?.allowMultiples ?? false,
    allowUpload: activePrivateFileDrop?.allowUpload ?? true,
  };

  const handleGenerateLink = async (values: {
    title: any;
    description: any;
    allowDownload: boolean;
    allowMultiples: boolean;
    allowUpload: boolean;
  }) => {
    const genLink = link + user?._id + "-" + generateRandomUniqueNumber();
    const fileDropLink = await createFileDropLink({
      variables: {
        input: convertObjectEmptyStringToNull({
          url: genLink,
          expiredAt: expiredDate,
          title: values?.title,
          description: values?.description || null,
          folderId: data?._id,
        }),
      },
    });

    if (fileDropLink?.data?.createPrivateFileDropUrl?._id) {
      setNewLink(genLink);
      successMessage("Created file-drop link successfully!", 2000);
    }
  };

  return (
    <>
      <Box sx={{ margin: "10px 20px 20px 20px" }}>
        <Box
          sx={{
            display: "flex",
            textAlign: "start",
            justifyContent: "start",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6">
            Select expired date to this link! Default: 24 hours
          </Typography>
          <Typography component="label" sx={{ fontSize: "0.8rem" }}>
            Please share this link with the intended recipient of the file.
          </Typography>
        </Box>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={createFileDropSchema}
          onSubmit={handleGenerateLink}
        >
          {({ values, handleChange }) => (
            <Form>
              {newLink ? (
                <Box>
                  <Box>
                    <div
                      ref={qrCodeRef}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "10px",
                        borderRadius: "7px",
                      }}
                    >
                      <QRCode
                        style={{ width: "100px", height: "100px" }}
                        value={newLink}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                    <Typography sx={{ fontSize: "0.8rem", color: "#4B465C" }}>
                      This link:{" "}
                      <span style={{ color: "#17766B" }}>{newLink}</span>{" "}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#4B465C" }}>
                      will be expired on:
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
                      value={newLink}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {isCopy ? (
                              <IconButton>
                                <DownloadDoneIcon sx={{ color: "#17766B" }} />
                              </IconButton>
                            ) : (
                              <CopyToClipboard
                                text={newLink}
                                onCopy={handleCopyLink}
                              >
                                <IconButton aria-label="copy">
                                  <ContentCopyIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </CopyToClipboard>
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 3,
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
                        onClick={async (e) => {
                          if (isShared) {
                            setIsShared(false);
                          } else {
                            setShareLoading(true);
                            const result = await handleShareQR(e, qrCodeRef, {
                              title: values.title,
                              description: values.description,
                            });

                            if (!result) {
                              setShareLoading(false);
                              setIsShared(!isShared);
                            }
                          }
                        }}
                        sx={{ ml: 5, width: "130px" }}
                      >
                        {shareLoading ? "Loading..." : "Share"}

                        <ReplyAllSharpIcon
                          sx={{
                            ml: 3,
                            transform: "rotate(180deg) scale(1,-1)",
                          }}
                        />
                      </Button>
                    </Box>
                    {isShared && (
                      <Typography
                        component={"div"}
                        ref={shareRef}
                        sx={{
                          maxWidth: "90vw",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ShareSocial
                          socialTypes={[
                            "copy",
                            "facebook",
                            "twitter",
                            "line",
                            "linkedin",
                            "whatsapp",
                            "viber",
                            "telegram",
                            "reddit",
                            "instapaper",
                            "livejournal",
                            "mailru",
                            "ok",
                            "hatena",
                            "email",
                            "workspace",
                          ]}
                          url={newLink}
                          onSocialButtonClicked={(buttonName: string) => {
                            handleSocialNetworkClicked(buttonName);
                          }}
                          title="Social Media"
                        />
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box>
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
                      id="title"
                      name="title"
                      autoFocus
                      size="small"
                      placeholder="title"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={values.title}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: false,
                      }}
                      sx={{ userSelect: "none" }}
                    />
                  </FormControl>
                  <FormControl
                    sx={{
                      display: "block",
                      py: 4,
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
                      id="description"
                      name="description"
                      autoFocus
                      size="small"
                      placeholder="description"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={values.description}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: false,
                      }}
                      sx={{ userSelect: "none" }}
                    />
                  </FormControl>
                  <FormControl sx={{ width: "40%" }} size="small">
                    <Typography
                      component="label"
                      sx={{
                        textAlign: "left",
                        display: "block",
                      }}
                    >
                      Expired date
                    </Typography>
                    {user?.packageId?.category === "free" ? (
                      <DatePickerV1Container>
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
                    ) : (
                      <Select
                        name="expireDate"
                        value={selectDay}
                        onChange={handleExpiredDateChange}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                              borderRadius: "10px",
                              mt: 1,
                            },
                          },
                        }}
                      >
                        {expireredOption.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </FormControl>
                  <Box sx={{ py: 3 }}>
                    <FormControl>
                      {allowPermission.map((permission) => (
                        <FormControlLabel
                          key={permission.value}
                          control={
                            <Checkbox
                              id={permission.value}
                              name={permission.value}
                              checked={
                                values[
                                  permission.value as keyof FormValues
                                ] as boolean
                              }
                              onChange={handleChange}
                            />
                          }
                          label={permission.label}
                        />
                      ))}
                    </FormControl>
                  </Box>
                  <Button variant="contained" type="submit" fullWidth>
                    Generate link now
                  </Button>
                </Box>
              )}
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}
