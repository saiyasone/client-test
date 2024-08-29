import { Box, Typography } from "@mui/material";
import moment from "moment";
import { IFileTypes } from "types/filesType";
import { useTheme } from "@mui/material/styles";
import { convertBytetoMBandGB } from "utils/storage.util";
type DetailsTypes = {
  data: IFileTypes;
};
function FileDetails(props: DetailsTypes) {
  const theme = useTheme();
  const { data } = props;
  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography component="p" fontSize={14}>
          File Details
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            Type
          </Typography>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            {data.fileType}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            Size
          </Typography>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            {convertBytetoMBandGB(parseInt(data.size))}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            Date added
          </Typography>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            {moment(data.updatedAt).format("YYYY-MM-DD h:mm:ss")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            Last modified
          </Typography>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            {moment(data.actionDate).format("YYYY-MM-DD h:mm:ss")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            Total download
          </Typography>
          <Typography
            component="p"
            fontSize={12}
            sx={{ color: theme.palette.grey[400] }}
          >
            {data.totalDownload > 1
              ? data.totalDownload + " times"
              : data.totalDownload + " time"}
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default FileDetails;
