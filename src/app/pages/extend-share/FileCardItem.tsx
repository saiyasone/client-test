import React from "react";

// material ui components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FileIcon, defaultStyles } from "react-file-icon";
// material ui icons
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box } from "@mui/material";
// package
import { Base64 } from "js-base64";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// compontents
import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_FILE } from "api/graphql/file.graphql";
import { MUTATION_UPDATE_FOLDER } from "api/graphql/folder.graphql";
import { DialogDeleteFile } from "components/DialogDeleteFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import useAuth from "hooks/useAuth";
import { errorMessage, successMessage } from "utils/alert.util";
import { getFileType } from "utils/file.util";
import { cutStringWithEllipsis } from "utils/string.util";
import { DialogDelete } from "../../../components/dialog/DialogDelete";

function FileCardItem(props) {
  const { user }: any = useAuth();
  const {
    index,
    itemId,
    filename,
    fileUrl,
    folderId,
    folderName,
    folderType,
    folderUrl,
    checkFolder,
    refecthFolder,
  } = props;

  const { state } = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [updateFiles] = useMutation(MUTATION_UPDATE_FILE);
  const [deleteRecentFile] = useMutation(MUTATION_UPDATE_FILE);
  const [deletedFileOnpen, setDeletedFileOnpen] = useState(Boolean(false));
  const openDropdown = Boolean(anchorEl);
  const [_valueURL, setValueURL] = useState("");
  const [id, setId] = useState("");
  const [itemName, setItemName] = useState("");
  const permission = state?.permission;
  const idURL = state?.idURL;

  const handleClick = (event, id, url, title) => {
    const base64URL = Base64.encodeURI(url);
    const base64Id = Base64.encodeURI(id);
    const HTTP_URL = localStorage.getItem("share_with_me_http");

    setAnchorEl(event.currentTarget);
    setId(id);
    setItemName(title.split("/").slice(-1).join().split(".").shift());
    setValueURL(HTTP_URL + "/" + base64URL + "/" + base64Id);
  };

  const renameClose = () => {
    setRenameOpen(false);
  };

  const deletedFileClose = () => {
    setDeletedFileOnpen(false);
  };

  const typefile = filename;
  let typeItem = "";

  if (typefile) {
    typefile.split(".").pop();
  } else {
    typeItem = "";
  }

  const onDoubleSubFolder = (url) => {
    if (folderType === "folder") {
      const urlCode = Base64.encode(url);
      const id = Base64.encodeURI(folderId);
      navigate(`/myfile/share-with-me/${urlCode}/${id}`, {
        state: { url, permission, idURL },
      });
    } else {
      successMessage("Preview file", 2000);
    }
  };

  // rename
  const handleSubFolderRename = async () => {
    if (folderType === "folder") {
      const renameFolder = await updateFolder({
        variables: {
          data: {
            folder_name: itemName,
          },
          where: {
            _id: id,
            checkFolder: checkFolder,
          },
        },
      });

      if (renameFolder) {
        setRenameOpen(false);
        successMessage("Update folder success !", 3000);
        refecthFolder();
      }
    } else {
      const renameFile = await updateFiles({
        variables: {
          data: {
            filename: itemName + "." + typeItem,
          },
          where: {
            _id: id,
          },
        },
      });
      if (renameFile) {
        setRenameOpen(false);
        successMessage("Update file success !", 3000);
        refecthFolder();
      }
    }
  };

  // deleted file status
  const handleDeletedFileStatus = async () => {
    try {
      const deleteFile = await deleteRecentFile({
        variables: {
          where: {
            _id: id,
          },
          data: {
            status: "deleted",
            createdBy: user?._id,
          },
        },
      });

      if (deleteFile?.data?.updateFiles?._id) {
        successMessage("Delete file successful!!", 2000);
        setDeletedFileOnpen(false);
      }
      refecthFolder();
    } catch (err) {
      errorMessage("Sorry! Something went wrong. Please try again!",2000);
    }
  };

  return (
    <>
      <Card
        sx={{
          margin: "1rem 0",
          background: "#EEF7F6",
          border: "2px solid #CDE7E4",
        }}
      >
        <CardContent
          onDoubleClick={() =>
            onDoubleSubFolder(folderType == "folder" ? folderUrl : fileUrl)
          }
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {folderType === "folder" ? (
              <Typography variant="h6" mt={2} key={index}>
                {cutStringWithEllipsis(folderName, 15)}
              </Typography>
            ) : (
              <Typography variant="h6" mt={2} key={index}>
                {cutStringWithEllipsis(filename, 15)}
              </Typography>
            )}
            {folderType === "folder" ? (
              <MoreVertIcon
                id="basic-button"
                aria-controls={openDropdown ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openDropdown ? "true" : undefined}
                onClick={(e) => handleClick(e, folderId, folderUrl, folderName)}
                sx={{ cursor: "pointer" }}
              />
            ) : (
              <MoreVertIcon
                id="basic-button"
                aria-controls={openDropdown ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openDropdown ? "true" : undefined}
                onClick={(e) => handleClick(e, itemId, fileUrl, filename)}
                sx={{ cursor: "pointer" }}
              />
            )}
          </Box>
          <Box
            sx={{
              textAlign: "center",
              marginTop: "0.5rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {folderType == "folder" ? (
              <FolderIcon sx={{ fontSize: "7rem", color: "#2F998B" }} />
            ) : (
              <Box
                style={{
                  width: "100px",
                  display: "flex",
                  height: "90px",
                  margin: "10px",
                }}
              >
                <FileIcon
                  extension={getFileType(filename)}
                  {...defaultStyles[getFileType(filename) as string]}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* dialog update folder */}
      {folderType === "folder" ? (
        <DialogRenameFile
          open={renameOpen}
          onClose={renameClose}
          onClick={handleSubFolderRename}
          title="Change Folder Name"
          label="Rename Folder"
          id={id}
          name={itemName}
          setName={setItemName}
        />
      ) : (
        <DialogRenameFile
          open={renameOpen}
          onClose={renameClose}
          onClick={handleSubFolderRename}
          title="Change File Name"
          label="Rename File"
          id={id}
          name={itemName}
          setName={setItemName}
        />
      )}
      {/* Dialog delete folder */}
      {folderType === "folder" ? (
        deleteOpen ? (
          <DialogDelete
            onClose={() => {
              setDeleteOpen(false);
            }}
            open={() => {
              setDeleteOpen(true);
            }}
            title={itemName}
            id={id}
            refecthFolder={refecthFolder}
          />
        ) : null
      ) : (
        <DialogDeleteFile
          onClose={deletedFileClose}
          open={deletedFileOnpen}
          onClick={handleDeletedFileStatus}
          title="Do you want to delete file"
          name={filename}
        />
      )}
    </>
  );
}

export default FileCardItem;
