import CloseIcon from "@mui/icons-material/Close";
import { Dialog, styled, Typography, useTheme } from "@mui/material";
import FileRename from "components/file/FileRename";
import useAuth from "hooks/useAuth";
import React from "react";
import { IUserTypes } from "types/userType";
import SharePrevieFile from "../file/SharePreviewFile";
import FiledropExtend from "./FiledropExtend";

const HeadSearch = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "5rem 0.8rem 0.8rem 0.8rem",
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
      return event == "rename"
        ? "Rename folder"
        : event === "share"
        ? "Share folder"
        : "Create file drop";
    } else {
      return event == "rename"
        ? "Rename file"
        : event == "share"
        ? "Share file"
        : "Create file drop";
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
            {data && event == "share" ? (
              <SharePrevieFile
                overflow={true}
                user={user}
                data={data}
                propsStatus="extendFolder"
              />
            ) : data && event == "rename" ? (
              <FileRename
                data={data}
                filename={filename}
                setFilename={setFilename}
                user={user}
                setDataForEvent={setDataForEvent}
                propsStatus="extendFolder"
              />
            ) : (
              <FiledropExtend data={data}/>
            )}
          </Dialog>
        )}
      </div>
    </>
  );
}
