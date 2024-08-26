import { useMutation } from "@apollo/client";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import * as Mui from "./styles/fileDrop.style";
import { BiEdit } from "react-icons/bi";

// components
import { AiOutlinePlus } from "react-icons/ai";
import NormalButton from "../../../components/NormalButton";
import PaginationStyled from "../../../components/PaginationStyled";
import useAuth from "../../../hooks/useAuth";

// material ui
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import ReplyAllSharpIcon from "@mui/icons-material/ReplyAllSharp";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  createTheme,
  styled,
  useMediaQuery,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import {
  MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  MUTATION_DELETE_FILE_DROP_URL,
} from "api/graphql/fileDrop.graphql";
import SelectV1 from "components/SelectV1";
import DialogDeleteV1 from "components/dialog/DialogDeleteV1";
import { ENV_KEYS } from "constants/env.constant";
import useManageFileDrop from "hooks/file/useManageFileDrop";
import useFilter from "hooks/useFilter";
import moment from "moment";
import { HiOutlineTrash } from "react-icons/hi";
import QRCode from "react-qr-code";
import { THEMES } from "theme/variant";
import { errorMessage, successMessage } from "utils/alert.util";
import { generateRandomUniqueNumber } from "utils/number.util";
import {
  handleDownloadQRCode,
  handleShareQR,
} from "utils/image.share.download";
import { decryptId, encryptDataLink } from "utils/secure.util";
import { DatePicker } from "@mui/x-date-pickers";
import DialogEditExpiryLinkFileDrop from "components/dialog/DialogEditExpiryLinkFileDrop";
import { NavLink } from "react-router-dom";
import DialogPreviewQRcode from "components/dialog/DialogPreviewQRCode";
import QrIcon from "@mui/icons-material/QrCode";

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
  color: "grey !important",
  position: "absolute",
  top: "-1rem",
  left: "2px",
}));

const DatePickerV1Content = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: "100%",
  position: "relative",
}));

function FileDrop() {
  const theme: any = createTheme();
  const { user }: any = useAuth();
  const isMobile = useMediaQuery("(max-width:767px)");
  const link = ENV_KEYS.VITE_APP_FILE_DROP_LINK;
  const qrCodeRef = useRef<SVGSVGElement | any>(null);
  const [value, setValue] = useState<any>(link);
  const [isEmptyTitle, setIsEmptyTitle] = useState("");
  const [isCopy, setIsCopy] = useState<any>(false);
  const [isCopied, setIsCopied] = useState<any>({});
  const [selectDay, setSelectDay] = useState<any>(1);
  const [expiredDate, setExpiredDate] = useState<any>(null);
  const [isShow, setIsShow] = useState<any>(false);
  const [showValid, setShowValid] = useState<boolean>(false);
  const [multiId, setMultiId] = useState<any>([]);
  const [openDelete, setOpenDelete] = useState<any>(false);
  const [showCreateform, setShowCreateForm] = useState<any>(false);
  const [packageType, setPackageType] = useState("Free");
  const [selectDate, setSelectDate] = useState<moment.Moment | null>(null);
  const [openEditExpiry, setOpenEditExpiry] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );
  const [deleteFiledropLink] = useMutation(MUTATION_DELETE_FILE_DROP_URL);
  const [dataForEvents, setDataForEvents] = useState<any>({
    action: null,
    type: null,
    data: {},
  });

  const [headerData, setHeaderData] = useState<any>({
    title: "",
    description: "",
    allowDownload: false,
    allowMultiples: false,
    allowUpload: true,
  });

  const filter = useFilter();
  const manageFileDrop = useManageFileDrop({ filter: filter.data });

  // checked file pagination
  const generateFileDropLink = async () => {
    if (!headerData.title) {
      setIsEmptyTitle("Title is required");
      return false;
    }
    setIsCopy(false);
    const genLink = link + user?._id + "-" + generateRandomUniqueNumber();
    setValue(genLink);
    try {
      const createfiledropLink = await createFileDropLink({
        variables: {
          input: {
            url: genLink,
            allowDownload: headerData.allowDownload || false,
            allowMultiples: headerData.allowMultiples || false,
            allowUpload: headerData.allowUpload || false,
            title: headerData?.title,
            description: headerData?.description,
            expiredAt:
              expiredDate == null
                ? moment(calculateExpirationDate(1)).format(
                    "YYYY-MM-DD h:mm:ss",
                  )
                : expiredDate,
          },
        },
      });
      if (createfiledropLink?.data?.createPrivateFileDropUrl?._id) {
        setSelectDay(1);
        setExpiredDate(null);
        manageFileDrop.customeFileDrop();
        setIsShow(true);
        setHeaderData({
          title: "",
          description: "",
          allowDownload: false,
          allowMultiples: false,
          allowUpload: true,
        });
        successMessage("Your new link is created!!", 3000);
      }
    } catch (error: any) {
      errorMessage(error?.message, 3000);
    }
  };

  const handleCopyLink = () => {
    setIsCopy(true);
    setShowValid(true);
  };

  const handleCopy = (url, id) => {
    successMessage("Link is copied!", 3000);
    setIsCopied((prev) => ({ ...prev, [id]: true }));
    navigator.clipboard.writeText(url);
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [id]: false }));
    }, 60000);
  };

  const calculateExpirationDate = (days) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + days);

    // Set a specific time (e.g., 12:00 PM)
    expirationDate.setHours(12, 0, 0, 0);
    return expirationDate.toISOString();
  };

  const handleExpiredDateChange = (event) => {
    const selectedDays = event.target.value;
    setSelectDay(selectedDays);

    const expirationDateTime = calculateExpirationDate(selectedDays);
    setExpiredDate(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
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

  const handleTitleChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      title: event.target.value,
    }));

    if (!headerData.title && !event.target.value) {
      setIsEmptyTitle("");
    }
  };

  const handleDescriptionChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      description: event.target.value,
    }));
  };

  const handleAllowDownloadChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      allowDownload: event.target.checked,
    }));
  };
  const handleAllowMultiplesChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      allowMultiples: event.target.checked,
    }));
  };
  const handleAllowUploadChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      allowUpload: event.target.checked,
    }));
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleMultipleDelete = async () => {
    try {
      let successCount = 0;
      const totalCount = multiId.length;
      for (let i = 0; i < totalCount; i++) {
        const result = await deleteFiledropLink({
          variables: {
            id: parseInt(multiId[i]),
          },
        });
        if (result?.data?.deleteFileDropUrl) {
          successCount++;
          if (successCount === totalCount) {
            handleDeleteClose();
            manageFileDrop.customeFileDrop();
          }
        }
      }
      successMessage("These items selected were deleted successful!", 2000);
      manageFileDrop.customeFileDrop();
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(cutErr, 3000);
    }
  };

  const handleSingleDelete = async () => {
    const id = await multiId[0];
    try {
      const { data } = await deleteFiledropLink({
        variables: {
          id: id,
        },
      });
      if (data && data?.deleteFileDropUrl) {
        successMessage("Item was deleted!", 2000);
        manageFileDrop.customeFileDrop();
      } else {
        errorMessage("Something went wrong during deletion!", 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(cutErr, 3000);
    }
  };

  const menuOnClick = async (action) => {
    switch (action) {
      case "edit_expiry":
        setOpenEditExpiry(true);
        break;

      case "preview-qrcode":
        setShowQrCode(true);
        break;
      default:
        return;
    }
  };

  const resetDataForEvent = () => {
    setDataForEvents({
      data: {},
      action: "",
    });
  };

  const handleCloseQrCode = () => {
    setShowQrCode(false);
    resetDataForEvent();
  };

  useEffect(() => {
    if (showValid) {
      setTimeout(() => {
        setShowValid(false);
      }, 5000);
    }
  }, [showValid, headerData.title]);

  React.useEffect(() => {
    if (
      dataForEvents.action &&
      (dataForEvents.data || dataForEvents.action === "edit_expiry")
    ) {
      menuOnClick(dataForEvents.action);
    }
  }, [dataForEvents.action]);

  const columns: any = [
    {
      field: "no",
      headerName: "ID",
      width: 70,
      headerAlign: "center",
      align: "center",
    },
    { field: "url", headerName: "URL", flex: 1 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "description", headerName: "description", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <div style={{ color: "green" }}>
            <Chip
              sx={{
                backgroundColor:
                  params?.row?.status && params?.row?.status === "expired"
                    ? "#FFEFE1"
                    : "#dcf6e8",
                color:
                  params?.row?.status && params?.row?.status === "expired"
                    ? "#FFA44F"
                    : "#29c770",
              }}
              label={params?.row?.status}
              size="small"
            />
          </div>
        );
      },
    },
    {
      field: "folderId",
      headerName: "Source",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const folder = params?.row?.folderId?.folder_name;
        return (
          <div style={{ color: "green" }}>
            <Chip
              sx={{
                backgroundColor: folder ? "#FFEFE1" : "#dcf6e8",
                color: folder ? "#FFA44F" : "#29c770",
              }}
              label={folder ? "/" + folder : "public"}
              size="small"
            />
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created date",
      flex: 1,
      renderCell: (params) => {
        return (
          <div>
            <span>
              {moment(params?.row?.createdAt).format("DD-MM-YYYY h:mm:ss")}
            </span>
          </div>
        );
      },
    },
    {
      field: "expiredAt",
      headerName: "Expired date",
      // flex: 1,
      renderCell: (params) => {
        return (
          <div>
            <span>
              {moment(params?.row?.expiredAt).format("DD-MM-YYYY h:mm:ss")}
            </span>
          </div>
        );
      },
    },
    {
      field: "Action",
      headerName: "Action",
      sortable: false,
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const url = String(params?.row?.url);

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "nowrap",
              minWidth: "auto",
            }}
          >
            <Tooltip title="Copy file drop link" placement="top">
              {isCopied[params?.row?._id] ? (
                <IconButton disabled>
                  <FileDownloadDoneIcon sx={{ color: "#17766B" }} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => handleCopy(params?.row?.url, params?.row?._id)}
                >
                  <ContentCopyIcon sx={{ fontSize: "16px" }} />
                </IconButton>
              )}
            </Tooltip>
            <Tooltip title="View details" placement="top">
              <IconButton
                onClick={() => {
                  setDataForEvents({
                    data: params?.row,
                    action: "preview-qrcode",
                  });
                }}
              >
                <QrIcon sx={{ fontSize: "18px" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="View details" placement="top">
              <IconButton
                component={NavLink}
                to={`/file-drop-detail/${encryptDataLink(url)}`}
              >
                <RemoveRedEyeIcon sx={{ fontSize: "18px" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit the expiry date-time" placement="top">
              <IconButton
                sx={{
                  cursor: "pointer",
                  opacity: 1,
                }}
                onClick={() => {
                  {
                    if (params?.row?._id) {
                      setDataForEvents({
                        action: "edit_expiry",
                        data: params.row,
                      });
                    }
                  }
                }}
              >
                <BiEdit
                  size="16px"
                  color={theme.name === THEMES.DARK ? "white" : "grey"}
                />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];
  ``;
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
    <Typography
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {showCreateform && (
        <Mui.PaperGlobal>
          <Mui.FiledropContainer>
            <Mui.ShowHeaderDetail>
              <Typography variant="h3">
                Select expired date to this link! Default: 24 hours
              </Typography>
              <Typography variant="h6">
                Please share this link with the intended recipient of the file.
              </Typography>
            </Mui.ShowHeaderDetail>
            <div style={{ textAlign: "start", marginTop: "1rem" }}>
              <Box>
                <InputLabel
                  sx={{
                    color: "grey !important",
                  }}
                >
                  <b style={{ color: "red" }}>*</b> Title
                </InputLabel>
                <TextField
                  sx={{
                    width: "100%",
                    fontSize: "18px !important",
                    color: "grey !important",
                  }}
                  size="small"
                  InputLabelProps={{
                    shrink: false,
                  }}
                  placeholder="Title...."
                  value={headerData.title}
                  onChange={handleTitleChange}
                />
                <Typography component={"p"} style={{ color: "red" }}>
                  {!headerData.title && isEmptyTitle}
                </Typography>
              </Box>
              <InputLabel
                sx={{
                  color: "grey !important",
                  marginTop: "1rem",
                }}
              >
                Description
              </InputLabel>
              <TextField
                sx={{
                  width: "100%",
                  fontSize: "18px !important",
                  color: "grey !important",
                }}
                size="small"
                InputLabelProps={{
                  shrink: false,
                }}
                placeholder="Description...."
                rows={3}
                multiline
                value={headerData.description}
                onChange={handleDescriptionChange}
              />
            </div>
            <Mui.GenerateLinkArea>
              <Grid container gap={6}>
                <Grid item xs={12} md={4}>
                  {packageType ? (
                    packageType.toLowerCase().indexOf("free") === 0 ||
                    packageType?.toLowerCase().indexOf("anonymous") === 0 ? (
                      <FormControl sx={{ width: "100%" }} size="small">
                        <InputLabel id="demo-simple-select-label">
                          Expired date
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={selectDay}
                          label="Expired date"
                          onChange={handleExpiredDateChange}
                          sx={{ textAlign: "start" }}
                        >
                          <MenuItem value={1}>1 day after created</MenuItem>
                          <MenuItem value={2}>2 days after created</MenuItem>
                          <MenuItem value={3}>3 days after created</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <DatePickerV1Container>
                        <DatePickerV1Lable>Expired date</DatePickerV1Lable>
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
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={7}
                  sx={{
                    display: "flex",
                    justifyContent: {
                      xs: "flex-end",
                      md: "center",
                      rowGap: 10,
                    },
                  }}
                >
                  <FormControl sx={{ display: "flex", flexDirection: "row" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="allow-download"
                          name="allow-download"
                          checked={headerData.allowDownload}
                          onChange={handleAllowDownloadChange}
                        />
                      }
                      label="Allow Download"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="allow-upload"
                          name="allow-upload"
                          checked={headerData.allowUpload}
                          onChange={handleAllowUploadChange}
                        />
                      }
                      label="Allow Upload"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="allow-multiple"
                          name="allow-multiple"
                          checked={headerData.allowMultiples}
                          onChange={handleAllowMultiplesChange}
                        />
                      }
                      label="Allow Multiples"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    onClick={generateFileDropLink}
                    sx={{ width: { xs: "100%" } }}
                  >
                    Generate link now
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    sx={{
                      width: "100%",
                      fontSize: "18px !important",
                      color: "grey !important",
                    }}
                    size="small"
                    InputLabelProps={{
                      shrink: false,
                    }}
                    disabled
                    value={value == link ? "Link to upload..." : value}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {isCopy && showValid ? (
                            <IconButton>
                              <DownloadDoneIcon sx={{ color: "#17766B" }} />
                            </IconButton>
                          ) : (
                            <CopyToClipboard
                              text={value}
                              onCopy={handleCopyLink}
                            >
                              <IconButton
                                aria-label="copy"
                                disabled={value == link ? true : false}
                              >
                                <ContentCopyIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </CopyToClipboard>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Mui.GenerateLinkArea>
            {/* <Box
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "start",
                flexDirection: "column",
              }}
            >
              {isShow && (
                <Typography sx={{ fontSize: "0.8rem", color: "#4B465C" }}>
                  This link: <span style={{ color: "#17766B" }}>{value}</span>{" "}
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
              )}
            </Box> */}
            {isShow && (
              <Grid container sx={{ mt: 10 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  {/* <div ref={qrRef}> */}
                  {/* <QRCode
                      style={{
                        width: "100px",
                        height: "100px",
                        border: "1px solid gray",
                        padding: "7px",
                        borderRadius: "7px",
                      }}
                      value={value}
                      ref={qrCodeRef}
                      viewBox={`0 0 256 256`}
                    /> */}
                  {/* </div> */}
                  <div
                    ref={qrCodeRef}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
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
                </Box>
                <Box sx={{ mt: { xs: 7, md: 2 }, ml: { xs: 0, md: 10 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "start",
                      flexDirection: "column",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem", color: "#4B465C" }}>
                      This link:{" "}
                      <span style={{ color: "#17766B" }}>{value}</span> will be
                      expired on: &nbsp;
                      <span style={{ color: "#17766B" }}>
                        {expiredDate
                          ? expiredDate
                          : moment(calculateExpirationDate(1)).format(
                              "YYYY-MM-DD h:mm:ss",
                            )}
                        .
                      </span>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: { xs: "center", md: "flex-start" },
                      mt: 7,
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={(e) =>
                        handleDownloadQRCode(e, qrCodeRef, headerData)
                      }
                      sx={{ width: "130px" }}
                    >
                      <DownloadSharpIcon sx={{ mr: 3 }} />
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      onClick={(e) => handleShareQR(e, qrCodeRef, headerData)}
                      sx={{ ml: 5, width: "130px" }}
                    >
                      Share
                      <ReplyAllSharpIcon
                        sx={{ ml: 3, transform: "rotate(180deg) scale(1,-1)" }}
                      />
                    </Button>
                  </Box>
                </Box>
              </Grid>
            )}
          </Mui.FiledropContainer>
        </Mui.PaperGlobal>
      )}

      <Mui.PaperGlobal sx={{ flex: 1 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "gray",
              fontSize: "14px",
            }}
          >
            List of all file drop links
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              marginTop: "1rem",
              justifyContent: "space-between",
              [theme.breakpoints.down("sm")]: {
                display: "block",
              },
            }}
          >
            <Box
              sx={{
                display: isMobile ? "block" : "flex",
                justifyContent: "space-between",
                mb: 4,
              }}
            >
              <Box>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                  <Grid
                    item
                    sm={12}
                    md={6}
                    lg={6}
                    sx={{
                      width: isMobile ? "100%" : "auto",
                    }}
                  >
                    <SelectV1
                      disableLabel
                      selectStyle={{
                        height: "35px",
                        minHeight: "35px",
                        marginRight: "0.5rem",
                        width: isMobile ? "100%" : "150px",
                        color: "#989898",
                      }}
                      selectProps={{
                        disableClear: true,
                        onChange: (e) =>
                          filter.dispatch({
                            type: filter.ACTION_TYPE.PAGE_ROW,
                            payload: e?.value || null,
                          }),
                        options: [
                          { label: 10, value: 10 },
                          { label: 15, value: 15 },
                          { label: 30, value: 30 },
                          { label: 50, value: 50 },
                        ],
                        defaultValue: [{ label: 10, value: 10 }],
                        sx: {
                          "& .MuiInputBase-root": {
                            height: "35px",
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box>
                <Grid container spacing={2}>
                  <Grid item sm={6} md={4} lg={4}>
                    <SelectV1
                      disableLabel
                      selectStyle={{
                        height: "35px",
                        minHeight: "35px",
                        marginTop: "0.3rem",
                      }}
                      selectProps={{
                        disableClear: true,
                        onChange: (e) =>
                          filter.dispatch({
                            type: filter.ACTION_TYPE.STATUS,
                            payload: e?.value || null,
                          }),
                        options: [
                          { label: "All links", value: "" },
                          { label: "Active", value: "opening" },
                          {
                            label: "Expired",
                            value: "expired",
                          },
                        ],
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} md={4} lg={4}>
                    <NormalButton
                      onClick={() => {
                        if (multiId.length > 0) {
                          setOpenDelete(true);
                        }
                      }}
                      sx={{
                        padding: "0 10px",
                        height: "35px",
                        alignItems: "center",
                        border: "1px solid",
                        marginTop: theme.spacing(1),
                        borderColor:
                          theme.name === THEMES.DARK
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(0,0,0,0.4)",
                        borderRadius: "4px",
                        ...(multiId?.length < 0
                          ? {
                              cursor: "",
                              opacity: 0.5,
                            }
                          : {
                              "&:hover": {
                                borderColor:
                                  theme.name === THEMES.DARK
                                    ? "rgb(255,255,255)"
                                    : "rgb(0,0,0)",
                              },
                            }),
                      }}
                    >
                      {!isMobile && (
                        <Box
                          sx={{
                            flex: "1 1 0%",
                            color:
                              theme.name === THEMES.DARK
                                ? "rgb(255,255,255)"
                                : "rgb(0,0,0)",
                          }}
                        >
                          Delete
                        </Box>
                      )}
                      <Box>
                        <HiOutlineTrash
                          style={{
                            fontSize: "1.25rem",
                            color:
                              theme.name === THEMES.DARK
                                ? "rgb(255,255,255)"
                                : "rgb(0,0,0,0.7)",
                          }}
                        />
                      </Box>
                    </NormalButton>
                  </Grid>
                  <Grid item sm={6} md={4} lg={4}>
                    <Button
                      color="primaryTheme"
                      variant="contained"
                      sx={{
                        padding: "0 12px",
                        height: "35px",
                        alignItems: "center",
                        border: "1px solid",
                        borderRadius: "6px",
                        marginTop: theme.spacing(1),
                      }}
                      onClick={() => {
                        setShowCreateForm(!showCreateform);
                      }}
                    >
                      {showCreateform ? (
                        <VisibilityOffIcon />
                      ) : (
                        <AiOutlinePlus />
                      )}
                      &nbsp; {showCreateform ? "Hide" : "Create"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
        <Card>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              paddingLeft: "0 !important",
              paddingRight: "0 !important",
            }}
          >
            <DataGrid
              sx={{
                borderRadius: 0,
                height: "100% !important",
                "& .MuiDataGrid-columnSeparator": { display: "none" },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
              }}
              autoHeight
              getRowId={(row) => row?._id}
              rows={manageFileDrop?.data || []}
              columns={columns}
              checkboxSelection
              disableSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              hideFooter
              onSelectionModelChange={(ids: any) => {
                manageFileDrop.setSelectedRow(ids);
                setMultiId(ids);
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  padding: (theme) => theme.spacing(4),
                }}
              >
                Showing 1 to 10 of {manageFileDrop.total} entries
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: (theme) => theme.spacing(4),
                  flex: "1 1 0%",
                }}
              >
                <PaginationStyled
                  currentPage={filter.data.currentPageNumber}
                  total={Math.ceil(
                    manageFileDrop.total / manageFileDrop.pageLimit,
                  )}
                  setCurrentPage={(e) =>
                    filter.dispatch({
                      type: filter.ACTION_TYPE.PAGINATION,
                      payload: e,
                    })
                  }
                />
              </Box>
            </Box>
            {/* )} */}
          </CardContent>
        </Card>
      </Mui.PaperGlobal>

      <DialogDeleteV1
        isOpen={openDelete}
        onClose={handleDeleteClose}
        onConfirm={
          multiId.length > 1 ? handleMultipleDelete : handleSingleDelete
        }
      />
      {openEditExpiry && (
        <DialogEditExpiryLinkFileDrop
          isOpen={openEditExpiry}
          onClose={() => {
            setOpenEditExpiry(false);
            resetDataForEvent();
            manageFileDrop.customeFileDrop();
          }}
          data={dataForEvents?.data}
        />
      )}

      <DialogPreviewQRcode
        isOpen={showQrCode}
        data={dataForEvents?.data?.url || ""}
        onClose={handleCloseQrCode}
      />
    </Typography>
  );
}

export default FileDrop;
