import CloseIcon from "@mui/icons-material/Close";
import { Dialog, styled, Typography, useTheme } from "@mui/material";
import FileRename from "components/file/FileRename";
import useAuth from "hooks/useAuth";
import React from "react";
import { IUserTypes } from "types/userType";
import SharePrevieFile from "../file/SharePreviewFile";

const HeadSearch = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "1rem 0.8rem",
}));

interface ISharehProps {
  handleClose?: () => void;
  open?: boolean;
  data?: any | null;
  event?: string;
}
interface AuthContextType {
  user: ISharehProps | null;
}

export default function ShareExtend({
  handleClose,
  open,
  data,
  event,
}: ISharehProps) {
  const theme = useTheme();
  const user: IUserTypes = useAuth();
  const [dataForEvent, setDataForEvent] = React.useState<string>("");
  const [filename, setFilename] = React.useState<string>();


  const getActionTile = (type: string, event: string | null | undefined) => {
    if (type === "folder" && type !== null && type !== undefined) {
      return event !== "rename" ? "Share folder" : "Rename folder";
    } else {
      return event !== "rename" ? "Share file" : "Rename file";
    }
  };
  const actionText = getActionTile(data?.folder_type, event);

  return (
    <>
      <div>
        {open && (
          <Dialog
            onClose={handleClose}
            open={open}
            fullScreen
            sx={{
              "& .MuiDialog-paper": {
                height: "100vh",
                margin: 0,
                borderBottom: "0",
                position: "absolute",
                left: 0,
                bottom: 0,
                right: 0,
              },
            }}
          >
            <HeadSearch>
              <Typography component="h6" variant="h6">
                {actionText}
              </Typography>
              <CloseIcon
                sx={{ color: theme.palette.grey[600] }}
                onClick={handleClose}
              />
            </HeadSearch>
            {data && event !== "rename" ? (
              <SharePrevieFile
                overflow={true}
                user={user}
                data={data}
                propsStatus="extendFolder"
              />
            ) : (
              data && (
                <FileRename
                  data={data}
                  filename={filename}
                  setFilename={setFilename}
                  user={user}
                  setDataForEvent={setDataForEvent}
                  propsStatus="extendFolder"
                />
              )
            )}
          </Dialog>
        )}
      </div>
    </>
  );
}
