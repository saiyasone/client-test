import {
  Box,
  Button,
  createTheme,
  OutlinedInput,
  styled,
  Tooltip,
  tooltipClasses,
  useMediaQuery,
} from "@mui/material";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import React, { useMemo, useRef } from "react";
import { IFileTypes } from "types/filesType";
import { IUserTypes } from "types/userType";
import { errorMessage, successMessage } from "utils/alert.util";
import { getFileNameExtension } from "utils/file.util";
import { RenameFileMessage } from "utils/message";
const theme = createTheme();

const FormLabel = styled("label")({
  display: "block",
  marginBottom: 2,
  fontSize: "0.85rem",
});

interface RenameTypes {
  data: IFileTypes;
  filename?: string;
  setFilename: (value: string) => void;
  user: IUserTypes;
  setDataForEvent: (value: string) => void;
}

export default function FileRname({
  data,
  filename,
  setFilename,
  user,
  setDataForEvent,
}: RenameTypes) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { setIsAutoClose } = useMenuDropdownState();
  const manageFile = useManageFile({ user });
  const [newData, setNewData] = React.useState("");
  const defaultValueExtension = getFileNameExtension(data.filename);

  const handleUpdateFile = async () => {
    await manageFile.handleRenameFile({ id: data._id }, filename, {
      onSuccess: () => {
        setIsAutoClose(true);
        successMessage(RenameFileMessage.UpdateSuccess, 2000);
        setDataForEvent("");
      },
      onFailed: () => {
        errorMessage(RenameFileMessage.UpdateFailed, 2000);
      },
    });
  };
  React.useEffect(() => {
    const extensionIndex = data.filename.lastIndexOf(".");

    setNewData(data.filename.substring(0, extensionIndex));
  }, []);

  React.useEffect(() => {
    setFilename(newData + defaultValueExtension);
  }, [newData]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    const newFilename = newData.substring(0, defaultValueExtension);
    if (!/[\\/:*?"'<>]/.test(newName)) {
      setNewData(newName);
    }
  };

  return (
    <>
      <Box sx={{ py: 4, margin: "30px 20px 20px 20px" }}>
        <FormLabel htmlFor="text">Rename file</FormLabel>
        <OutlinedInput
          type="text"
          fullWidth
          required
          value={newData}
          onChange={handleChange}
          sx={{ bgcolor: theme.palette.grey[200] }}
        />
        <Box sx={{ mt: 5 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth={isMobile ? true : false}
            onClick={handleUpdateFile}
          >
            Rename
          </Button>
        </Box>
      </Box>
    </>
  );
}
