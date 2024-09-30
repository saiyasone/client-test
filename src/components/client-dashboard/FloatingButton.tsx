import { useLazyQuery, useMutation } from "@apollo/client";
import CloseIcon from "@mui/icons-material/Close";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import { TransitionProps } from "@mui/material/transitions";
import {
  MUTATION_CREATE_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import ShowUpload from "components/ShowUpload";
import WasabiUpload from "components/WasabiUpload";
// import UppyUpload from "components/UppyUpload";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import useAuth from "hooks/useAuth";
import * as React from "react";
import { successMessage, warningMessage } from "utils/alert.util";
import { decryptId } from "utils/secure.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { v4 as uuidv4 } from "uuid";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FloatingButton() {
  const { user }: any = useAuth();
  const [selectFiles, setSelectFiles] = React.useState<any[]>([]);
  const [openUppy, setOpenUppy] = React.useState(false);
  const [selectedFolderFiles, setSelectedFolderFiles] = React.useState<any[]>(
    [],
  );
  const [folderOpen, setFolderOpen] = React.useState(false);
  const [folder, setFolder] = React.useState("");
  const [isRandomFolder, setIsRandomFolder] = React.useState<boolean>(false);
  const [resMessage, setResMessage] = React.useState<any>(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [getType, setGetType] = React.useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const eventUploadTrigger = React.useContext(EventUploadTriggerContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFolderClose = () => {
    setFolderOpen(false);
    setIsRandomFolder(false);
    setFolder("");
  };

  //Modal;
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const [todoFolder] = useMutation(MUTATION_CREATE_FOLDER);
  const [newFolderPath, { data: isNewPath }] = useLazyQuery(QUERY_FOLDER);

  const fileUpload = (type) => {
    const input: any = document.createElement("input");
    input.type = "file";
    input.multiple = "true";
    input.directory = type === "directory" ? "true" : "";
    input.webkitdirectory = type === "directory" ? "true" : "";
    input.addEventListener("change", (event) => {
      const selectedFiles: File[] = event.target.files;
      const newFiles: any[] = [];

      const limitImageUpload = user?.packageId?.totalImageUpload;
      const numberOfFileUpload = user?.packageId?.numberOfFileUpload || 15;
      const maxFileSize = user?.packageId?.maxUploadSize;

      let imageFileCount = 0;
      let fileCount = 0;
      let allFiles = 0;

      if (input.directory === "true") {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];

          if (file.size > maxFileSize) {
            warningMessage(
              `You cannot select files larger than ${convertBytetoMBandGB(
                maxFileSize,
              )}`,
              3000,
            );
            return;
          }

          if (file.type.startsWith("image/")) {
            imageFileCount++;
          } else {
            fileCount++;
          }

          if (imageFileCount > limitImageUpload) {
            warningMessage(
              `You cannot select more than ${limitImageUpload} image files.`,
              3000,
            );
            return;
          }

          allFiles = imageFileCount + fileCount;
          if (
            imageFileCount > 0 &&
            fileCount > 0 &&
            allFiles > numberOfFileUpload
          ) {
            warningMessage(
              `You can select up to ${numberOfFileUpload} files if including non-images.`,
              3000,
            );

            return;
          }

          newFiles.push(selectedFiles[i]);
        }
        setSelectedFolderFiles((prevFiles) => [...prevFiles, newFiles]);
        setSelectFiles([]);
      } else {
        for (let i = 0; i < selectedFiles.length; i++) {
          newFiles.push(selectedFiles[i]);
        }
        setSelectFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setSelectedFolderFiles([]);
      }
      setOpen(Boolean(selectedFiles));
    });
    input.click();
  };

  const handleDelete = (index) => {
    setSelectFiles(selectFiles.filter((_, i) => i !== index));
    setSelectedFolderFiles(selectedFolderFiles.filter((_, i) => i !== index));
  };

  const handleRemoveAll = () => {
    handleClose();
    setSelectFiles([]);
    setSelectedFolderFiles([]);
  };

  const handleOpenCreateFolderModal = () => {
    setFolderOpen(true);
  };

  const folderJson = localStorage.getItem(ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL);

  let globalFolderId = "";
  try {
    if (folderJson) {
      const decryptedData = decryptId(folderJson);
      if (decryptedData && decryptedData.trim() !== "") {
        const folderDecrypted = JSON.parse(decryptedData);
        globalFolderId = folderDecrypted;
      }
    }
  } catch (error) {
    console.log(error);
  }

  React.useEffect(() => {
    setResMessage(false);
    if (folderJson) {
      newFolderPath({
        variables: {
          where: {
            _id: globalFolderId,
          },
        },
      });
    }
  }, [globalFolderId, isNewPath]);

  const handleCreateFolder = async () => {
    const newFolderName = uuidv4();
    setIsLoading(true);

    try {
      const data = await todoFolder({
        variables: {
          data: {
            folder_name: folder,
            createdBy: user?._id,
            folder_type: "folder",
            destination: "",
            checkFolder: parseInt(globalFolderId) > 0 ? "sub" : "main",
            ...(parseInt(globalFolderId) > 0
              ? { parentkey: parseInt(globalFolderId) }
              : {}),
            newFolder_name: newFolderName,
            newPath:
              parseInt(globalFolderId) > 0
                ? isNewPath?.folders?.data[0]?.newPath + "/" + newFolderName
                : newFolderName,
          },
        },
      });
      if (data?.data?.createFolders?._id) {
        successMessage("Create Folder successful!!", 3000);
        setResMessage("");
        setFolderOpen(false);
        setFolder("");
        setIsLoading(false);
        setResMessage(false);
        eventUploadTrigger.trigger();
      }
    } catch (error: any) {
      if (error.message) {
        setFolder(error.message);
        setIsRandomFolder(true);
      }
      setIsLoading(false);
      const strMsg = error.message.split(": ")[1];
      if (strMsg) {
        setResMessage(true);
      }
      if (strMsg == "FOLDER_NAME_CONTAINS_A_SINGLE_QUOTE(')") {
        setErrorMessage(strMsg);
        setFolder("");
      } else if (strMsg == "LOGIN_IS_REQUIRED") {
        setFolder("");
        setErrorMessage("You're not authentication!");
      } else if (strMsg == "ຊື່ໂຟເດີ") {
        setFolder("");
        setErrorMessage("The folder name is already exist!!");
      } else if (strMsg == "FOLDER_MAIN_PARENTKEY_NOT_ZERO") {
        setFolder("");
        setErrorMessage("Please select a new folder!");
      } else {
        setErrorMessage(error);
      }
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ height: 320, transform: "translateZ(0px)", flexGrow: 1 }}>
        <SpeedDial
          ariaLabel="SpeedDial openIcon example"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
        >
          <SpeedDialAction
            icon={<UploadFileIcon />}
            tooltipTitle="Upload File"
            FabProps={{
              sx: {
                bgcolor: "#17766B",
                color: "#ffffff",
                "&:hover": {
                  bgcolor: "#17766B",
                },
              },
            }}
            onClick={() => {
              setOpenUppy(true);
              // fileUpload("file");
              // setGetType("file");
            }}
          />
          <SpeedDialAction
            icon={<DriveFolderUploadIcon />}
            tooltipTitle="Upload Folder"
            FabProps={{
              sx: {
                bgcolor: "#17766B",
                color: "#ffffff",
                "&:hover": {
                  bgcolor: "#17766B",
                },
              },
            }}
            onClick={() => {
              fileUpload("directory");
              setGetType("directory");
            }}
          />
          <SpeedDialAction
            icon={<CreateNewFolderIcon />}
            tooltipTitle="Create New Folder"
            FabProps={{
              sx: {
                bgcolor: "#17766B",
                color: "#ffffff",
                "&:hover": {
                  bgcolor: "#17766B",
                },
              },
            }}
            onClick={handleOpenCreateFolderModal}
          />
        </SpeedDial>
      </Box>

      {selectFiles && (
        <ShowUpload
          open={open}
          data={selectFiles}
          folderData={selectedFolderFiles}
          onClose={handleClose}
          onDeleteData={handleDelete}
          onRemoveAll={handleRemoveAll}
          onSelectMore={fileUpload}
          parentComponent="floatingButton"
          getType={getType}
        />
      )}

      <Dialog
        open={folderOpen}
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        onClose={handleFolderClose}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="sm"
      >
        <Box sx={{ padding: "10px" }}>
          <DialogTitle sx={{ mt: 4 }}>{"Create An New Folder ?"}</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText id="alert-dialog-slide-description"></DialogContentText>
            <TextField
              fullWidth
              id="outlined-error-helper-text"
              variant="outlined"
              value={folder || ""}
              onChange={(e) => {
                setFolder(e.target.value);
              }}
            />
            {isRandomFolder && folder && (
              <Typography
                component="p"
                sx={{ ml: 1 }}
                style={{ fontSize: "12px" }}
              >
                Folder rename to
                <strong style={{ fontSize: "12px", marginLeft: "4px" }}>
                  {folder}
                </strong>
              </Typography>
            )}
            {resMessage ? (
              <Typography
                component="p"
                style={{ color: "#ba000d", fontSize: "12px" }}
              >
                {errorMessage == "FOLDER_NAME_CONTAINS_A_SINGLE_QUOTE(')"
                  ? "We do not allow using (') with folder name."
                  : errorMessage == "LOGIN_IS_REQUIRED"
                  ? errorMessage
                  : "The name already exits rename it?"}
              </Typography>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ mb: 5 }}>
            <Box sx={{ mr: isMobile ? 0 : 5 }}>
              <Button
                color="secondaryTheme"
                variant="contained"
                sx={{
                  borderRadius: "18px",
                  padding: isMobile ? "5px 20px" : "8px 30px",
                  mr: isMobile ? 2 : 5,
                }}
                onClick={handleFolderClose}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primaryTheme"
                sx={{
                  borderRadius: "18px",
                  padding: isMobile ? "5px 20px" : "8px 30px",
                }}
                loading={isLoading}
                onClick={handleCreateFolder}
              >
                Save
              </LoadingButton>
            </Box>
          </DialogActions>
        </Box>
      </Dialog>

      <WasabiUpload
        open={openUppy}
        onClose={() => {
          setOpenUppy(false);
        }}
      />
    </React.Fragment>
  );
}
