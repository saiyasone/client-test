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
// import UppyUpload from "components/UppyUpload";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import useAuth from "hooks/useAuth";
import * as React from "react";
import { successMessage } from "utils/alert.util";
import { decryptId } from "utils/secure.util";
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
  const [selectedFolderFiles, setSelectedFolderFiles] = React.useState<any[]>(
    [],
  );
  const [folderOpen, setFolderOpen] = React.useState(false);
  const [folder, setFolder] = React.useState("");
  const [resMessage, setResMessage] = React.useState<any>(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [getType, setGetType] = React.useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const eventUploadTrigger = React.useContext(EventUploadTriggerContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFolderClose = () => {
    setFolderOpen(false);
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
      const selectedFiles: any[] = event.target.files;
      const newFiles: any[] = [];
      if (input.directory === "true") {
        for (let i = 0; i < selectedFiles.length; i++) {
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

  const folderJson = localStorage.getItem(
    ENV_KEYS.VITE_APP_FOLDER_ID_LOCAL_KEY,
  );

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

  React.useEffect(() => {}, [globalFolderId]);

  React.useEffect(() => {
    setResMessage(false);
    if (
      // localStorage.getItem("folderId")
      folderJson
    ) {
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
        setFolder(strMsg);
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
              fileUpload("file");
              setGetType("file");
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

      {/* {open && <UppyUpload open={open} />} */}

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
    </React.Fragment>
  );
}
