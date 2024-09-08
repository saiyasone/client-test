// components
import SelectV1 from "components/SelectV1";
import * as MUI from "../styles/accountInfo.styles";

// material ui
import { DataGrid } from "@mui/x-data-grid";
import PaginationStyled from "components/PaginationStyled";
import AddIcon from "@mui/icons-material/Add";
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

// hooks
import useFilter from "hooks/payment/useFilter";
import useManagePayment from "hooks/payment/useManage";
import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";
import { useState } from "react";

const ImageIcon = styled("img")({
  width: "35px",
  height: "35px",
  objectFit: "cover",
  borderRadius: "100%",
});

function PaymentHistory() {
  const [isPreview, setIsPreview] = useState(true);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");

  const filterPayment = useFilter();
  const { user }: any = useAuth();
  const managePayment: any = useManagePayment({
    filter: filterPayment.data,
  });
  const newUrl = ENV_KEYS.VITE_APP_LOAD_URL + "preview?path=";
  const sourcePath =
    user?.newName + "-" + user?._id + `/${ENV_KEYS.VITE_APP_ZONE_PROFILE}/`;

  const columns: any = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ color: "#6F6B7D", fontSize: "0.9rem", fontWeight: "400" }}
            >
              {params?.row?.no}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "firstName",
      headerName: "CLIENT",
      flex: 1,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            {isPreview ? (
              <ImageIcon
                src={newUrl + sourcePath + user?.profile}
                onError={() => {
                  setIsPreview(false);
                }}
              />
            ) : (
              <Avatar sx={{ width: 35, height: 35 }} />
            )}
            <Box sx={{ marginLeft: "0.5rem" }}>
              <Typography
                variant="h5"
                sx={{ color: "#6F6B7D", fontSize: "1rem", fontWeight: "500" }}
              >
                {params?.row?.payerId?.firstName || ""}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#A5A3AE", fontSize: "0.8rem", fontWeight: "400" }}
              >
                {params?.row?.payerId?.lastName || ""}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "paymentMethod",
      headerName: "PaymentMethod",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ color: "#6F6B7D", fontSize: "0.9rem", fontWeight: "400" }}
            >
              {params?.row?.paymentMethod}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "amount",
      headerName: "TOTAL",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            variant="h5"
            sx={{ color: "#6F6B7D", fontSize: "0.9rem", fontWeight: "400" }}
          >
            ${params?.row?.amount}
          </Typography>
        );
      },
    },
    {
      field: "expiredAt",
      headerName: "ISSUED DATE",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            variant="h5"
            sx={{ color: "#6F6B7D", fontSize: "0.9rem", fontWeight: "400" }}
          >
            {params?.row?.expiredAt}
          </Typography>
        );
      },
    },
    {
      field: "fullName",
      headerName: "BALANCE",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params?.row?.status;
        return (
          <Chip
            label={status}
            sx={{
              background:
                status === "refunded"
                  ? "#FFD9B4"
                  : status === "failed" ||
                    status === "cancelled" ||
                    status === "expired"
                  ? "#FBDDDD"
                  : status === "success"
                  ? "#D4F4E2"
                  : "",
              color:
                status === "refunded"
                  ? "#FF9F43"
                  : status === "failed" ||
                    status === "cancelled" ||
                    status === "expired"
                  ? "#EA5455"
                  : status === "success"
                  ? "#209F59"
                  : "",
              fontWeight: "600",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: () => {
        return (
          <Box>
            <IconButton>
              <EmailOutlinedIcon />
            </IconButton>
            <IconButton>
              <RemoveRedEyeOutlinedIcon />
            </IconButton>
            <IconButton>
              <MoreVertOutlinedIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Typography variant="h5" sx={{ color: "#4B465C" }}>
        Payment History
      </Typography>
      <MUI.BoxShowPaymentHistoryHeader>
        <MUI.BoxShowLeftPaymentHistory>
          <Box sx={{ width: "50%" }}>
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
                  filterPayment.dispatch({
                    type: filterPayment.ACTION_TYPE.PAGE_ROW,
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
          </Box>
          <Button
            startIcon={<AddIcon />}
            sx={{
              background: "#17766B",
              color: "#ffffff",
              fontSize: isMobile ? "0.8rem" : "",
              "&:hover": {
                color: "#17766B",
              },
              padding: isTablet
                ? "0.4rem 0.2rem"
                : isMobile
                ? "0.4rem 0.6rem"
                : "0.4rem 2rem",
              width: isMobile ? "45%" : "auto",
            }}
            size="small"
          >
            Create Invoice
          </Button>
        </MUI.BoxShowLeftPaymentHistory>
        <MUI.BoxShowRightPaymentHistory>
          <FormControl
            sx={{
              width: isMobile ? "45%" : "50%",
              marginLeft: isTablet ? "0.5rem" : isMobile ? "0" : "2rem",
            }}
            size="small"
          >
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
                  filterPayment.dispatch({
                    type: filterPayment.ACTION_TYPE.STATUS,
                    payload: e?.value || null,
                  }),
                options: [
                  { label: "Success", value: "success" },
                  { label: "Failed", value: "failed" },
                  { label: "Cancelled", value: "cancelled" },
                  { label: "Refunded", value: "refunded" },
                  { label: "Expired", value: "expired" },
                ],
              }}
            />
          </FormControl>
        </MUI.BoxShowRightPaymentHistory>
      </MUI.BoxShowPaymentHistoryHeader>
      <Box sx={{ marginTop: isMobile ? "1rem" : "2rem" }}>
        <DataGrid
          sx={{
            borderRadius: 0,
            height: "100% !important",
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "hidden",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
          autoHeight
          getRowId={(row) => row._id}
          rows={managePayment.data || []}
          columns={columns}
          initialState={{
            pagination: {
              page: 0,
              pageSize: 5,
            },
          }}
          checkboxSelection
          disableSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          hideFooter
          onSelectionModelChange={(ids) => {
            managePayment.setSelectedRow(ids);
            // setMultiId(ids);
          }}
        />
        {managePayment?.data?.length > filterPayment.state.pageSize && (
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
              Showing 1 to 10 of {managePayment.total} entries
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
                currentPage={filterPayment.data.currentPageNumber}
                total={Math.ceil(
                  managePayment.total / filterPayment.data.pageLimit,
                )}
                setCurrentPage={(e) =>
                  filterPayment.dispatch({
                    type: filterPayment.ACTION_TYPE.PAGINATION,
                    payload: e,
                  })
                }
              />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}

export default PaymentHistory;
