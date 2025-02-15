import { useMutation } from "@apollo/client";
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  styled,
  useMediaQuery,
} from "@mui/material";
import {
  MUTATION_DELETE_FILE_FOREVER,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import {
  MUTATION_DELETE_FOLDER_TRASH,
  MUTATION_UPDATE_FOLDER,
} from "api/graphql/folder.graphql";
import {
  multipleFileDropFolderAndFileItems,
  multipleSelectionFileItems,
  multipleSelectionFolderAndFileItems,
  multipleSelectionFolderItems,
  multipleShareFolderAndFileItems,
  multipleTrashFolderAndFileItems,
} from "constants/menuItem.constant";
import { FolderContext } from "contexts/FolderProvider";
import useManageFile from "hooks/file/useManageFile";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import {
  Fragment,
  KeyboardEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import {
  toggleFolderSelected,
  toggleSelected,
} from "stores/features/useEventSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import DialogAlert from "./dialog/DialogAlert";

const SelectContainer = styled("div")({
  width: "100%",
  padding: "0 16px",
  borderRadius: "6px",
  // backgroundColor: "gray",
  backgroundColor: "#E9EDEF",
  paddingBottom: "8px",
  paddingTop: "6px",
});

const SelectWrapper = styled("div")({
  display: "flex",
  alignItems: "center",

  button: {
    marginTop: "4px",
  },
});

const SelectBoxContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "1rem",

  h2: {
    fontSize: "13px",
    color: "#4B465C",
    marginTop: "3px",
  },
});

const SelectBoxLeft = styled("div")({
  marginRight: "3rem",
});

const SelectBoxRight = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

function MenuMultipleSelectionFolderAndFile(props) {
  const {
    isTrash,
    isShare,
    isFileDrop,
    onPressShare,
    onPressDeleteDrop,
    onPressLockData,
    onPressSuccess,
    onPressDeleteShare,
    onOneTimeLinks,
    onManageLink,
    country,
    device,
  } = props;
  const manageGraphqlError = useManageGraphqlError();
  const { handleTriggerFolder }: any = useContext(FolderContext);
  const [multipleTab, setMultipleTab] = useState("0");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userPackage, setUserPackage] = useState<any>(null);
  const { user }: any = useAuth();

  // Graph ql
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [restoreFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [restoreFile] = useMutation(MUTATION_UPDATE_FILE);
  const [deleteFolder] = useMutation(MUTATION_DELETE_FOLDER_TRASH);
  const [deleteFile] = useMutation(MUTATION_DELETE_FILE_FOREVER);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  // use manage file and folder
  const manageFileAction = useManageFile({
    user,
  });

  const handleMenuAction = (action) => {
    switch (action) {
      case "file-download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetLinkAnother();
        } else {
          handleDownloadFile();
        }
        break;

      case "share-download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetLinkShareAnother();
        } else {
          handleDownloadShare();
        }
        break;

      case "folder-download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetLinkAnother();
        } else {
          handleDownloadFileAndFolder();
        }
        break;

      case "filedrop-download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetLinkAnother();
        } else {
          handleDownloadFileDrop();
        }
        break;

      case "cloud-download":
        handleSaveToCloud();
        break;

      case "multiple-download":
        if (
          userPackage?.downLoadOption === "another" ||
          userPackage?.category === "free"
        ) {
          handleGetLinkAnother();
        } else {
          handleDownloadFileAndFolder();
        }
        break;

      case "share":
        handleShare();
        break;

      case "password":
        handleMultipleLockData();
        break;

      case "favourite":
        handleFavorite();
        break;

      case "pin":
        handlePin();
        break;

      case "get link":
        // handleGetLink();
        handleGetLink();
        break;

      case "restore":
        handleRestore();
        break;

      case "delete forever":
        setIsDeleteOpen(true);
        break;

      case "delete":
        handleDeleteData();
        break;

      case "delete-share":
        handleDeleteShare();
        break;

      case "delete-drop":
        handleDeleteFileDrop();
        break;
      case "one-time-link":
        onOneTimeLinks();
        break;
    }
  };

  // const copyTextToClipboard = async (text) => {
  //   if ("clipboard" in navigator) {
  //     return await navigator.clipboard.writeText(text);
  //   } else {
  //     return document.execCommand("copy", true, text);
  //   }
  // };

  const handleCheckData = () => {
    if (dataSelector?.selectionFileAndFolderData?.length) {
      return true;
    }
    handleClearFile();
  };

  const handleDownloadFile = () => {
    dispatch(checkboxAction.setIsLoading(true));
    manageFileAction.handleMultipleDownloadFile(
      {
        multipleData: dataSelector?.selectionFileAndFolderData,
      },
      {
        onSuccess: () => {
          dispatch(checkboxAction.setIsLoading(false));
        },
        onFailed: () => {
          dispatch(checkboxAction.setIsLoading(false));
        },
      },
    );
  };

  const handleDownloadShare = () => {
    dispatch(checkboxAction.setIsLoading(true));
    manageFileAction.handleMultipleDownloadFileAndFolder(
      {
        multipleData: dataSelector?.selectionFileAndFolderData,
        isShare: true,
      },
      {
        onSuccess: () => {
          dispatch(checkboxAction.setIsLoading(false));
        },
        onFailed: (error) => {
          dispatch(checkboxAction.setIsLoading(false));
          console.error(error);
        },
      },
    );
  };

  const handleDownloadFileDrop = () => {
    dispatch(checkboxAction.setIsLoading(true));
    manageFileAction.handleMultipleFileDropDownloadFile(
      {
        multipleData: dataSelector?.selectionFileAndFolderData,
      },
      {
        onSuccess: () => {
          dispatch(checkboxAction.setIsLoading(false));
        },
        onFailed: (error) => {
          dispatch(checkboxAction.setIsLoading(false));
          console.error(error);
        },
      },
    );
  };

  const handleDownloadFileAndFolder = () => {
    dispatch(checkboxAction.setIsLoading(true));
    manageFileAction.handleMultipleDownloadFileAndFolder(
      {
        multipleData: dataSelector?.selectionFileAndFolderData,
        isShare: false,
      },
      {
        onSuccess: () => {
          dispatch(checkboxAction.setIsLoading(false));
        },
        onFailed: (error) => {
          dispatch(checkboxAction.setIsLoading(false));
          console.error(error);
        },
      },
    );
  };

  const handleClearFile = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
    dispatch(toggleSelected(false));
    dispatch(toggleFolderSelected(false));
  };

  const handleGetLink = () => {
    onManageLink();
    // alert('gggg')
    // dispatch(checkboxAction.setIsGetLinkLoading(true));
    // manageFileAction.handleMultipleGetLinks(
    //   {
    //     dataMultiple: dataSelector?.selectionFileAndFolderData,
    //   },
    //   {
    //     onSuccess: async (result) => {
    //       dispatch(checkboxAction.setIsGetLinkLoading(false));
    //       await copyTextToClipboard(result.shortLink);
    //       successMessage("Link is copied", 3000);
    //       handleClearFile();
    //     },
    //     onFailed: (error) => {
    //       dispatch(checkboxAction.setIsGetLinkLoading(false));
    //       const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
    //       errorMessage(
    //         manageGraphqlError.handleErrorMessage(cutErr) as string,
    //         3000,
    //       );
    //     },
    //   },
    // );
  };

  const handleGetLinkAnother = () => {
    dispatch(checkboxAction.setIsLoading(true));
    manageFileAction.handleMultipleGetLinks(
      {
        dataMultiple: dataSelector?.selectionFileAndFolderData,
      },
      {
        onSuccess: async (result) => {
          dispatch(checkboxAction.setIsLoading(false));
          window.open(result.shortLink, "_blank");
          handleClearFile();
        },
        onFailed: (error) => {
          dispatch(checkboxAction.setIsLoading(false));
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            manageGraphqlError.handleErrorMessage(cutErr) as string,
            3000,
          );
        },
      },
    );
  };

  const handleGetLinkShareAnother = () => {
    dispatch(checkboxAction.setIsLoading(true));
    manageFileAction.handleMultipleShareGetLinks(
      {
        dataMultiple: dataSelector?.selectionFileAndFolderData,
      },
      {
        onSuccess: async (result) => {
          dispatch(checkboxAction.setIsLoading(false));
          window.open(result.shortLink, "_blank");
          handleClearFile();
        },
        onFailed: (error) => {
          dispatch(checkboxAction.setIsLoading(false));
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            manageGraphqlError.handleErrorMessage(cutErr) as string,
            3000,
          );
        },
      },
    );
  };

  const handleMultipleLockData = () => {
    onPressLockData();
  };

  const handleDeleteShare = async () => {
    onPressDeleteShare();
  };

  const handleFavorite = async () => {
    try {
      if (handleCheckData()) {
        await dataSelector?.selectionFileAndFolderData?.map(async (item) => {
          await updateFile({
            variables: {
              data: {
                favorite: item.favorite ? 0 : 1,
              },
              where: {
                _id: item.id,
              },
            },
            onCompleted: () => {
              onPressSuccess();
            },
          });
        });
        handleClearFile();
        successMessage("Data have added to favorite successfully", 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handlePin = async () => {
    try {
      if (handleCheckData()) {
        await dataSelector?.selectionFileAndFolderData?.map(async (item) => {
          await updateFolder({
            variables: {
              data: {
                pin: item.pin ? 0 : 1,
                updatedBy: item.createdBy?._id,
              },
              where: {
                _id: item.id,
              },
            },
            onCompleted: () => {
              handleTriggerFolder();
              onPressSuccess();
            },
          });
        });
        handleClearFile();
        successMessage("Data have pineed successfully", 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleDeleteData = async () => {
    try {
      if (handleCheckData()) {
        dataSelector?.selectionFileAndFolderData?.map(async (item) => {
          if (item.checkType === "folder") {
            await updateFolder({
              variables: {
                where: {
                  _id: item.id,
                },
                data: {
                  status: "deleted",
                  createdBy: item?.createdBy?._id,
                },
              },
              onCompleted: () => {
                onPressSuccess();
              },
            });
          } else {
            await updateFile({
              variables: {
                where: {
                  _id: item.id,
                },
                data: {
                  status: "deleted",
                  createdBy: item?.createdBy?._id,
                },
              },
              onCompleted: () => {
                onPressSuccess();
              },
            });
          }
        });
        handleClearFile();
        successMessage("Data were deleted successfully", 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleShare = () => {
    onPressShare();
  };

  const handleSaveToCloud = async () => {
    manageFileAction.handleMultipleSaveToClound(
      {
        multipleData: dataSelector?.selectionFileAndFolderData,
        country,
        device,
      },
      {
        onSuccess: () => {
          successMessage("Save to Cloud", 3000);
          handleClearFile();
        },
        onFailed: (error) => {
          console.error(error);
        },
      },
    );
  };

  const handleDeleteFileDrop = () => {
    onPressDeleteDrop();
  };

  const handleRestore = async () => {
    try {
      if (handleCheckData()) {
        await dataSelector.selectionFileAndFolderData?.map(async (item) => {
          if (item.checkType === "folder") {
            await restoreFolder({
              variables: {
                data: {
                  status: "active",
                },
                where: {
                  _id: item.id,
                },
              },
              onCompleted: () => {
                onPressSuccess();
              },
            });
          } else {
            await restoreFile({
              variables: {
                data: {
                  status: "active",
                },
                where: {
                  _id: item.id,
                },
              },
              onCompleted: () => {
                onPressSuccess();
              },
            });
          }
        });

        successMessage(`Restore all items selected successfully`, 3000);
        handleClearFile();
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleDeleteForever = async () => {
    try {
      if (handleCheckData()) {
        await dataSelector?.selectionFileAndFolderData?.map(async (item) => {
          if (item.checkType === "folder") {
            await deleteFolder({
              variables: {
                where: { _id: item.id, checkFolder: item.check },
              },
              onCompleted: () => {
                onPressSuccess();
              },
            });
          } else {
            await deleteFile({
              variables: {
                id: item.id,
              },
              onCompleted: () => {
                onPressSuccess();
              },
            });
          }
        });

        successMessage("Data were deleted forever", 3000);
        handleClearFile();
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  // Function to handle Escape key press
  const handleEscKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      handleClearFile();
    }
  };

  const handleKeyDown = (event: Event) =>
    handleEscKey(event as unknown as KeyboardEvent);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    function handleMultipleMenu() {
      if (dataSelector?.selectionFileAndFolderData?.length) {
        let hasFile = false;
        let hasFolder = false;
        dataSelector.selectionFileAndFolderData?.forEach((item) => {
          if (item.checkType === "folder") {
            hasFolder = true;
          }
          if (item.checkType === "file") {
            hasFile = true;
          }
        });

        if (hasFile && hasFolder) {
          setMultipleTab("multiple");
        } else if (hasFile) {
          setMultipleTab("file");
        } else if (hasFolder) {
          setMultipleTab("folder");
        }
      }
    }

    handleMultipleMenu();
  }, [dataSelector?.selectionFileAndFolderData]);

  useEffect(() => {
    if (user) {
      const dataPackage = user?.packageId;
      setUserPackage(dataPackage);
    }
  }, [user]);

  return (
    <Fragment>
      <SelectContainer>
        <SelectWrapper>
          <SelectBoxLeft>
            <SelectBoxContainer>
              <FaTimes
                style={{
                  fontSize: "15px",
                  color: "#4B465C",
                  cursor: "pointer",
                  marginTop: "5px",
                }}
                onClick={handleClearFile}
              />
              <Typography variant="h2">
                {dataSelector?.selectionFileAndFolderData?.length}{" "}
                {!isMobile && "Selected"}
              </Typography>
            </SelectBoxContainer>
          </SelectBoxLeft>
          {isTrash ? (
            <SelectBoxRight>
              {/* id, checkType: file or folder */}
              {multipleTrashFolderAndFileItems.map((item, index) => {
                return (
                  <Fragment key={index}>
                    <SelectWrapper>
                      <Tooltip title={item?.title || ""}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            handleMenuAction(item.action);
                          }}
                        >
                          {item.icon}
                        </IconButton>
                      </Tooltip>
                    </SelectWrapper>
                  </Fragment>
                );
              })}
            </SelectBoxRight>
          ) : (
            <Fragment>
              {isShare ? (
                <SelectBoxRight>
                  {/* id, checkType: file or folder */}
                  {multipleShareFolderAndFileItems.map((item, index) => {
                    return (
                      <Fragment key={index}>
                        <SelectWrapper>
                          {item.action === "share-download" &&
                          dataSelector.isLoading ? (
                            <IconButton size="small">
                              <CircularProgress size={18} />
                            </IconButton>
                          ) : (
                            <Tooltip title={item?.title || ""}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  handleMenuAction(item.action);
                                }}
                                disabled={
                                  (item.action === "share-download" ||
                                    item.action === "share") &&
                                  dataSelector?.selectionFileAndFolderData?.find(
                                    (item) =>
                                      item?.permission === "view" ||
                                      item.totalSize! === 0,
                                  ) &&
                                  true
                                }
                              >
                                {item.icon}
                              </IconButton>
                            </Tooltip>
                          )}
                        </SelectWrapper>
                      </Fragment>
                    );
                  })}
                </SelectBoxRight>
              ) : (
                <Fragment>
                  {isFileDrop ? (
                    <SelectBoxRight>
                      {multipleFileDropFolderAndFileItems.map((item, index) => {
                        return (
                          <Fragment key={index}>
                            <SelectWrapper>
                              {item.action === "filedrop-download" &&
                              dataSelector.isLoading ? (
                                <IconButton size="small">
                                  <CircularProgress size={18} />
                                </IconButton>
                              ) : (
                                <Tooltip title={item?.title || ""}>
                                  <IconButton
                                    onClick={() => {
                                      handleMenuAction(item.action);
                                    }}
                                    size="small"
                                  >
                                    {item.icon}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </SelectWrapper>
                          </Fragment>
                        );
                      })}
                    </SelectBoxRight>
                  ) : (
                    <SelectBoxRight>
                      {/* id, checkType: folder or file, dataPassword, shortLink, createdBy: _id, newName, favorite: true or false, pin: true or false */}
                      <Fragment>
                        {/* files */}
                        {multipleTab === "file" && (
                          <Fragment>
                            {multipleSelectionFileItems.map((item, index) => {
                              if (
                                item.action === "password" &&
                                userPackage?.lockFile === "off"
                              ) {
                                return;
                              }
                              return (
                                <Fragment key={index}>
                                  <SelectWrapper>
                                    {item.action === "file-download" &&
                                    dataSelector.isLoading ? (
                                      <IconButton size="small">
                                        <CircularProgress size={18} />
                                      </IconButton>
                                    ) : (
                                      <Tooltip title={item?.title || ""}>
                                        <IconButton
                                          onClick={() => {
                                            handleMenuAction(item.action);
                                          }}
                                          disabled={
                                            (item.action === "get link" ||
                                              item.action === "one-time-link" ||
                                              item.action === "file-download" ||
                                              item.action === "password" ||
                                              item.action === "delete" ||
                                              item.action === "share") &&
                                            dataSelector?.selectionFileAndFolderData?.find(
                                              (selector) =>
                                                selector?.dataPassword,
                                            ) &&
                                            true
                                          }
                                          size="small"
                                        >
                                          {item.icon}
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </SelectWrapper>
                                </Fragment>
                              );
                            })}
                          </Fragment>
                        )}

                        {/* folder */}
                        {multipleTab === "folder" && (
                          <Fragment>
                            {multipleSelectionFolderItems.map((item, index) => {
                              if (
                                item.action === "password" &&
                                userPackage?.lockFolder === "off"
                              ) {
                                return;
                              }

                              return (
                                <Fragment key={index}>
                                  {item.action === "folder-download" &&
                                  dataSelector.isLoading ? (
                                    <IconButton size="small">
                                      <CircularProgress size={18} />
                                    </IconButton>
                                  ) : (
                                    <Tooltip title={item.title! || ""}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            handleMenuAction(item.action);
                                          }}
                                          disabled={
                                            !(
                                              item.action === "delete" &&
                                              dataSelector?.selectionFileAndFolderData?.some(
                                                (selector) =>
                                                  selector?.totalSize === 0,
                                              )
                                            ) &&
                                            (item.action === "get link" ||
                                              item.action ===
                                                "folder-download" ||
                                              item.action === "password" ||
                                              item.action === "delete" ||
                                              item.action === "one-time-link" ||
                                              item.action === "share") &&
                                            dataSelector?.selectionFileAndFolderData?.some(
                                              (selector) =>
                                                selector?.totalSize === 0 ||
                                                selector?.dataPassword,
                                            )
                                          }
                                        >
                                          <Fragment>{item.icon}</Fragment>
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                </Fragment>
                              );
                            })}
                          </Fragment>
                        )}

                        {/* files and folders */}
                        {multipleTab === "multiple" && (
                          <Fragment>
                            {multipleSelectionFolderAndFileItems.map(
                              (item, index) => {
                                if (
                                  item.action === "password" &&
                                  (userPackage.lockFile === "off" ||
                                    userPackage.lockFolder === "off")
                                ) {
                                  return;
                                }

                                return (
                                  <Fragment key={index}>
                                    {item.action === "multiple-download" &&
                                    dataSelector.isLoading ? (
                                      <IconButton size="small">
                                        <CircularProgress size={18} />
                                      </IconButton>
                                    ) : (
                                      <Tooltip title={item?.title}>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            handleMenuAction(item.action);
                                          }}
                                          disabled={
                                            (item.action === "get link" ||
                                              item.action === "one-time-link" ||
                                              item.action ===
                                                "multiple-download" ||
                                              item.action === "password" ||
                                              item.action === "delete" ||
                                              item.action === "share") &&
                                            dataSelector?.selectionFileAndFolderData?.find(
                                              (selector) =>
                                                selector?.totalSize === 0 ||
                                                selector?.dataPassword,
                                            ) &&
                                            true
                                          }
                                        >
                                          {item.icon}
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Fragment>
                                );
                              },
                            )}
                          </Fragment>
                        )}
                      </Fragment>
                    </SelectBoxRight>
                  )}
                </Fragment>
              )}
            </Fragment>
          )}
        </SelectWrapper>
      </SelectContainer>

      <DialogAlert
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
        }}
        title="Are you sure that you want to delete this item?"
        onClick={handleDeleteForever}
        message={"Note: Any deleted files or folders will not restore again!."}
      />
    </Fragment>
  );
}

export default MenuMultipleSelectionFolderAndFile;
