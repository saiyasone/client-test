import { Box, Card, CardContent } from "@mui/material";
import lockIcon from "assets/images/lock-icon.png";
import { IFileTypes } from "types/filesType";

type LockedFileIconTypes = {
  data: IFileTypes;
};
export default function LockedFilePreview({ data }: LockedFileIconTypes) {
  return (
    <>
      <Box
        sx={{
          minWidth: 275,
          height: 200,
        }}
      >
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              className="lock-icon-preview"
              src={lockIcon}
              alt={data.filename}
              style={{ width: "100px", height: "100px" }}
            />
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
