import IconReply from "@mui/icons-material/ForumSharp";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import heDecode from "he";
import useFilterTicket from "hooks/ticket/useFilterTicket";
import moment from "moment";
import { Fragment, useEffect } from "react";
import { GoPlus, GoSearch } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { calPaginationHardCoded } from "utils/other.util";
import { getColorStatus } from "utils/style.util";
import PaginationStyled from "../../../components/PaginationStyled";
import useAuth from "../../../hooks/useAuth";
import {
  FormLayoutField,
  HeaderLayout,
  HeaderTicketTitle,
  TickCardContent,
  TicketSectionContainer,
} from "./styles/ticket2.style";
import useManageMainTicket from "hooks/ticket/useManageMainTicket";

function Ticket() {
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 950px)");
  const filter = useFilterTicket();
  const dataTicket = useManageMainTicket({ filter: filter.data });

  const columns: any = [
    {
      field: "index",
      headerName: "ID",
      sortable: false,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      renderCell: function (params) {
        return (
          <Box>
            {calPaginationHardCoded({
              filter: filter?.state,
              index: params?.row?.index,
            })}
          </Box>
        );
      },
    },
    {
      field: "title",
      headerName: "Your Ticket",
      sortable: false,
      minWidth: 500,
      flex: 1,
      renderCell: (params) => {
        const row = params?.row;
        return (
          <Box sx={{ color: "#17766B", fontWeight: "600" }}>
            {heDecode.decode(row?.title || "")}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const status = params?.row?.status;
        return (
          <Chip
            label={status === "close" ? status + "d" : status}
            sx={getColorStatus(status)}
          />
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const updatedAt = params?.row?.updatedAt;
        return <>{moment(updatedAt).format("D MMM YYYY, h:mm A")}</>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      minWidth: 100,
      renderCell: (params) => {
        const row = params?.row;
        return (
          <IconButton onClick={() => handleShowChat(row?._id)}>
            <IconReply />
          </IconButton>
        );
      },
    },
  ];

  useEffect(() => {
    filter.dispatch({
      type: filter.ACTION_TYPE.CREATED_BY,
      payload: user?._id,
    });
  }, [user]);

  function handleAddTicket() {
    navigate("new", { relative: "path" });
  }

  function handleShowChat(id) {
    navigate(`reply/${id}`, { relative: "path" });
  }

  return (
    <Fragment>
      <TicketSectionContainer sx={{ mt: 4 }}>
        <HeaderLayout>
          <Typography variant="h3" fontWeight={400}>
            Support Ticket
          </Typography>
        </HeaderLayout>

        <Paper
          sx={{
            mt: (theme) => theme.spacing(3),
            boxShadow: (theme) => theme.baseShadow.secondary,
            flex: "1 1 0",
          }}
        >
          <Card>
            <TickCardContent>
              <HeaderTicketTitle>
                <Typography variant="h2">List all Tickets</Typography>
              </HeaderTicketTitle>
              <FormLayoutField>
                <OutlinedInput
                  placeholder="Search"
                  size="small"
                  endAdornment={
                    <InputAdornment position="end">
                      <GoSearch />
                    </InputAdornment>
                  }
                  onChange={(e) => {
                    filter.dispatch({
                      type: filter.ACTION_TYPE.SEARCH,
                      payload: e.target.value || "",
                    });
                  }}
                />
                <Button variant="contained" onClick={handleAddTicket}>
                  {isMobile ? (
                    <GoPlus style={{ fontSize: "1.5rem" }} />
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
              </FormLayoutField>
            </TickCardContent>
          </Card>

          <DataGrid
            sx={{
              height: "100% !important",
              borderRadius: 0,
              "& .MuiDataGrid-columnSeparator": { display: "none" },
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "scroll",
              },

              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                background: "#d33",
              },
            }}
            autoHeight
            rows={dataTicket.data || []}
            getRowId={(row) => row._id}
            columns={columns}
            disableSelectionOnClick
            disableColumnFilter
            disableColumnMenu
            hideFooter
          />

          {/* Pagination */}
          {dataTicket.total > 10 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
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
                  total={Math.ceil(dataTicket.total / filter.data.pageLimit)}
                  setCurrentPage={(e) =>
                    filter.dispatch({
                      type: filter.ACTION_TYPE.PAGINATION,
                      payload: e,
                    })
                  }
                />
              </Box>
            </Box>
          )}
        </Paper>
      </TicketSectionContainer>
    </Fragment>
  );
}

export default Ticket;
