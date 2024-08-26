import { useLazyQuery } from "@apollo/client";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { QUERY_LOG } from "api/graphql/log.graphql";
import Brave from "assets/images/browsers/brave.svg?react";
import Chrome from "assets/images/browsers/chrome.svg?react";
import Duckgo from "assets/images/browsers/duck-duck-go.svg?react";
import Edge from "assets/images/browsers/edge.svg?react";
import FireFox from "assets/images/browsers/firefox.svg?react";
import Opera from "assets/images/browsers/opera.svg?react";
import Safari from "assets/images/browsers/safari.svg?react";
import Vivalid from "assets/images/browsers/vivaldi.svg?react";
import useAuth from "hooks/useAuth";
import moment from "moment";
import { Fragment, useEffect, useState } from "react";
import * as MUI from "../styles/accountInfo.styles";

const Icons = [
  {
    icon: <Edge />,
    title: "Edge",
  },
  {
    icon: <Chrome />,
    title: "Chrome",
  },
  {
    icon: <FireFox />,
    title: "Firefox",
  },
  {
    icon: <Opera />,
    title: "Opera",
  },
  {
    icon: <Safari />,
    title: "Safari",
  },
  {
    icon: <Brave />,
    title: "Brave",
  },
  {
    icon: <Vivalid />,
    title: "Vivaldi",
  },
  {
    icon: <Duckgo />,
    title: "DuckDuckGo",
  },
];

function LoginDevice() {
  const { user }: any = useAuth();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [loginLog, setLoginLog] = useState<any[]>([]);
  const [dataLoggedIn] = useLazyQuery(QUERY_LOG, {
    fetchPolicy: "no-cache",
  });

  function convertLoggedDescription(data) {
    const cleanedStr = data.replace(/\\/g, "");
    const normalStr = JSON.parse(cleanedStr);

    return normalStr;
  }

  function filterUniqueBrowsers(dataArrays) {
    const uniqueArrays: any[] = [];

    return dataArrays.filter((item) => {
      const browser: any = convertLoggedDescription(item?.description)?.browser;
      if (uniqueArrays.indexOf(browser) === -1) {
        uniqueArrays.push(browser);
        return true;
      }

      return false;
    });
  }

  useEffect(() => {
    const getDataLoggedIn = async () => {
      try {
        const res = await dataLoggedIn({
          variables: {
            where: {
              createdBy: user?._id,
              name: "login",
            },
            orderBy: "createdAt_DESC",
            limit: 10,
          },
        });

        const data = (await res.data?.getLogs?.data) || [];
        const rows = filterUniqueBrowsers(data);
        if (rows?.length) {
          setLoginLog(rows);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getDataLoggedIn();
  }, []);

  return (
    <MUI.PaperGlobal sx={{ marginTop: "2rem" }}>
      <Typography
        variant="h6"
        sx={{ color: "#5D596C", fontWeight: isMobile ? "500" : "600" }}
      >
        Logged-in Devices
      </Typography>
      <Box sx={{ marginTop: "1rem" }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="caption table">
            <TableHead>
              <MUI.RowTableRow>
                <MUI.CellTableCell>NO</MUI.CellTableCell>
                <MUI.CellTableCell>BROWSER</MUI.CellTableCell>
                <MUI.CellTableCell>DEVICE</MUI.CellTableCell>
                <MUI.CellTableCell>LOCATION</MUI.CellTableCell>
                <MUI.CellTableCell>RECENT ACTIVITIES</MUI.CellTableCell>
              </MUI.RowTableRow>
            </TableHead>

            {loginLog?.length > 0 && (
              <TableBody>
                {loginLog?.map((row, index) => {
                  return (
                    <MUI.RowTableRow key={index}>
                      <MUI.CellTableCell>{index + 1}</MUI.CellTableCell>
                      <MUI.CellTableCell
                        component="th"
                        sx={{
                          display: "flex",
                          textAlign: "center",
                          justifyContent: "start",
                        }}
                      >
                        {Icons.map((icon, index) => (
                          <Fragment key={index}>
                            {icon.title ===
                            convertLoggedDescription(row?.description)?.browser
                              ? icon.icon
                              : ""}
                          </Fragment>
                        ))}
                        &nbsp;{" "}
                        {convertLoggedDescription(row?.description)?.browser}
                      </MUI.CellTableCell>
                      <MUI.CellTableCell>
                        {convertLoggedDescription(row?.description)?.os || "--"}
                      </MUI.CellTableCell>
                      <MUI.CellTableCell>
                        {"--"}
                        {/* {convertLoggedDescription(row?.description)?.from ||
                          "--"} */}
                      </MUI.CellTableCell>
                      <MUI.CellTableCell>
                        {/* {DateFormat(row?.createdAt)} */}
                        {moment(row?.createdAt).format("DD-MM-YYYY h:mm:ss")}
                      </MUI.CellTableCell>
                    </MUI.RowTableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>
    </MUI.PaperGlobal>
  );
}

export default LoginDevice;
