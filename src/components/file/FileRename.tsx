import {
  Box,
  Button,
  createTheme,
  OutlinedInput,
  styled,
  useMediaQuery,
} from "@mui/material";
import { useRefreshState } from "contexts/RefreshProvider";
import useManageFile from "hooks/file/useManageFile";
import useFetchFolder from "hooks/folder/useFetchFolder";
import useManageFolder from "hooks/folder/useManageFolder";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { Base64 } from "js-base64";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
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
  data: any;
  filename?: string;
  propsStatus?: string;
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
  propsStatus,
}: RenameTypes) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const manageFile = useManageFile({ user });
  const manageFolder = useManageFolder({ user });
  const [newData, setNewData] = React.useState("");
  const defaultValueExtension = getFileNameExtension(data.filename);
  const { setRefreshAuto } = useRefreshState();
  const params: any = useParams();

  const parentFolderUrl = useMemo(() => {
    return Base64?.decode(params?.id);
  }, [params.id]);
  const { data: parentFolder } = useFetchFolder({
    folderUrl: parentFolderUrl,
    userId: user?._id,
  });

  const handleUpdateFile = async () => {
    if (data?.folder_type === "folder" && data?.folder_type !== undefined) {
      if (parentFolder) {
        await manageFolder.handleRenameFolder(
          {
            id: data._id,
            inputNewFolderName: newData,
            checkFolder: data.checkFolder,
            parentKey: parentFolder?._id,
            user: user,
          },
          {
            onSuccess: async () => {
              successMessage("Update Folder successful", 2000);
            },
            onFailed: async (_: any) => {
              
            },
            onClosure: () => {},
          },
        );
      }
    } else {
      await manageFile.handleRenameFile({ id: data._id }, filename, {
        onSuccess: () => {
          successMessage(RenameFileMessage.UpdateSuccess, 2000);
          setDataForEvent("");
          if (propsStatus) {
            setRefreshAuto({
              isAutoClose: true,
              isStatus: propsStatus || "recent",
            });
          }
        },
        onFailed: () => {
          errorMessage(RenameFileMessage.UpdateFailed, 2000);
        },
      });
    }
  };
  React.useEffect(() => {
    if (data?.folder_type !== "folder") {
      const extensionIndex = data.filename.lastIndexOf(".");
      setNewData(data.filename.substring(0, extensionIndex));
    } else {
      setNewData(data.folder_name);
    }
  }, []);

  React.useEffect(() => {
    if (data?.folder_type !== "folder") {
      setFilename(newData + defaultValueExtension);
    }
  }, [newData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    const _ = newData.substring(0, defaultValueExtension);
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
