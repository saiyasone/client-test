import { useLazyQuery, useMutation } from "@apollo/client";
import React, { Fragment, useState } from "react";

// component
import { Box, Typography } from "@mui/material";

//icons
import {
  MUTATION_DELETE_FOLDER_TRASH,
  MUTATION_UPDATE_FOLDER,
} from "api/graphql/folder.graphql";
import { QUERY_DELETED_SUB_FOLDER_FILE } from "api/graphql/other.graphql";
import TrashEmpty from "assets/images/empty/trash-empty.svg?react";
import Empty from "components/Empty";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SimpleBar from "components/SimpleBar";
import SwitchPages from "components/SwitchPage";
import DialogAlert from "components/dialog/DialogAlert";
import { trashMenuItems } from "constants/menuItem.constant";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import TrashDataGrid from "./TrashDataGrid";
import * as MUI_TRASH from "./styles/deletedFile.style";
import * as MUI from "./styles/trash.style";

function Trash() {
  const manageGraphqlError = useManageGraphqlError();
  const [toggle, setToggle] = useState<any>("list");
  const [totalItems, setTotalItems] = useState<any>(0);
  const { setIsAutoClose } = useMenuDropdownState();
  const { user }: any = useAuth();

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  const manageFile = useManageFile({ user });
  const [dataDeletedFoldersAndFiles, setDataDeletedFoldersAndFiles] =
    useState<any>(null);
  const [getDeletedFoldersAndFiles, { data }] = useLazyQuery(
    QUERY_DELETED_SUB_FOLDER_FILE,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [
    isDataDeletedFoldersAndFilesFound,
    setIsDataDeletedFoldersAndFilesFound,
  ] = useState<any>(null);
  const [dataForEvents, setDataForEvents] = useState<any>({
    action: null,
    data: {},
  });

  const [restoreFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [deleteFolder] = useMutation(MUTATION_DELETE_FOLDER_TRASH);

  // dialog confirmation
  const [isRestoreOpen, setIsRestoreOpen] = useState<any>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<any>(false);

  useEffect(() => {
    if (dataForEvents.action && dataForEvents.data) {
      menuOnClick(dataForEvents.action);
    }
  }, [dataForEvents.action]);

  const customGetDeletedFolderFile = () => {
    try {
      getDeletedFoldersAndFiles({
        variables: {
          where: {
            createdBy: user?._id,
          },
          orderBy: "updatedAt_DESC",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const resetDataForEvents = () => {
    setDataForEvents((state) => ({
      ...state,
      action: null,
      data: {},
    }));
  };

  const menuOnClick = (action) => {
    setIsAutoClose(true);
    switch (action) {
      case "restore":
        handleRestore();
        break;

      case "delete forever":
        setIsDeleteOpen(true);
        break;
      default:
        return;
    }
  };

  const handleRestore = async () => {
    if (dataForEvents.data.checkTypeItem === "folder") {
      try {
        await restoreFolder({
          variables: {
            data: {
              status: "active",
            },
            where: {
              _id: dataForEvents.data._id,
            },
          },
          onCompleted: async () => {
            successMessage(
              `Restore ${dataForEvents.data.name} successfully`,
              3000,
            );
            customGetDeletedFolderFile();
            resetDataForEvents();
            setIsRestoreOpen(false);
          },
        });
      } catch (error: any) {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(
            cutErr || "Something went wrong, Please try again",
          ) as string,
          3000,
        );
      }
    }

    if (dataForEvents.data.checkTypeItem === "file") {
      await manageFile.handleRestoreFile(dataForEvents.data._id, {
        onSuccess: () => {
          successMessage(
            `Restore ${dataForEvents.data.name} successfully`,
            3000,
          );
          resetDataForEvents();
          customGetDeletedFolderFile();
          setIsRestoreOpen(false);
        },
        onFailed: (error) => {
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(
            cutErr || "Something went wrong, Please try again",
            3000,
          );
        },
      });
    }
  };

  const handleDeleteForever = async () => {
    if (dataForEvents.data.checkTypeItem === "folder") {
      await deleteFolder({
        variables: {
          where: {
            _id: dataForEvents.data._id,
            checkFolder: dataForEvents.data?.check,
          },
        },
        onCompleted: async () => {
          successMessage(
            `Delete ${dataForEvents.data.name} successfully`,
            3000,
          );
          resetDataForEvents();
          customGetDeletedFolderFile();
          setIsDeleteOpen(false);
        },
        onError: async () => {
          errorMessage("Something went wrong", 3000);
        },
      });
    }

    if (dataForEvents.data.checkTypeItem === "file") {
      await manageFile.handleDeleteFileForever(dataForEvents.data._id, {
        onSuccess: () => {
          successMessage(
            `Delete ${dataForEvents.data.name} successfully`,
            3000,
          );
          customGetDeletedFolderFile();
          setIsDeleteOpen(false);
          resetDataForEvents();
        },
      });
    }
  };

  const handleMultipleListData = (selected, dataDeletedFile) => {
    const selectionOption = dataDeletedFile?.data?.find(
      (el) => el.id === selected,
    );

    if (selectionOption) {
      dispatch(
        checkboxAction.setFileAndFolderData({
          data: {
            id: selectionOption?._id,
            checkType: selectionOption?.checkTypeItem,
            check: selectionOption?.check,
          },
          toggle,
        }),
      );
    }
  };

  const handleMultipleGridData = (selected, item) => {
    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: selected,
          checkType: item?.checkTypeItem,
          check: item?.check,
        },
        toggle,
      }),
    );
  };

  useEffect(() => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  }, [dispatch, toggle]);

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  useEffect(() => {
    function getDataSetting() {
      const localStorageToggled = localStorage.getItem("toggle");
      if (localStorageToggled) {
        setToggle(localStorageToggled === "list" ? "list" : "grid");
      } else {
        localStorage.setItem("toggle", "list");
        setToggle("list");
      }
    }

    getDataSetting();
  }, []);

  useEffect(() => {
    customGetDeletedFolderFile();
    // getDeletedFoldersAndFiles({
    //   variables: {
    //     where: {
    //       createdBy: user?._id,
    //     },
    //     orderBy: "updatedAt_DESC",
    //   },
    // });
  }, []);

  React.useEffect(() => {
    try {
      const queryData = data?.queryDeleteSubFolderAndFile?.data;
      setTotalItems(data?.queryDeleteSubFolderAndFile?.total);
      setDataDeletedFoldersAndFiles(() => {
        const result = manageFile.splitDataByDate(queryData, "updatedAt");

        if (queryData !== undefined) {
          if (queryData.length > 0) {
            setIsDataDeletedFoldersAndFilesFound(true);
          } else {
            setIsDataDeletedFoldersAndFilesFound(false);
          }
        }
        return result.map((recentFiles) => {
          return {
            ...recentFiles,
            data: recentFiles.data.splice(0, 15).map((data) => ({
              id: data._id,
              ...data,
            })),
          };
        });
      });
    } catch (error) {
      console.log({ error });
    }
  }, [data?.queryDeleteSubFolderAndFile?.data]);

  return (
    <MUI_TRASH.TrashFilesContainer>
      <DialogAlert
        open={isRestoreOpen}
        onClose={() => {
          resetDataForEvents();
          setIsRestoreOpen(false);
        }}
        title="Are you sure?"
        onClick={handleRestore}
        message={""}
      />
      <DialogAlert
        open={isDeleteOpen}
        onClose={() => {
          resetDataForEvents();
          setIsDeleteOpen(false);
        }}
        title="Are you sure that you want to delete this item?"
        onClick={handleDeleteForever}
        message={"Note: Any deleted files or folders will not restore again!."}
      />

      <MUI.TitleAndSwitch sx={{ my: 2 }}>
        {dataSelector?.selectionFileAndFolderData?.length ? (
          <MenuMultipleSelectionFolderAndFile
            isTrash={true}
            onPressSuccess={() => {
              customGetDeletedFolderFile();
            }}
          />
        ) : (
          <Fragment>
            <MUI.SwitchItem>
              <Typography variant="h4">Trash For My Drive</Typography>
            </MUI.SwitchItem>
            {isDataDeletedFoldersAndFilesFound !== null &&
              isDataDeletedFoldersAndFilesFound && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MUI.SwitchItem sx={{ mr: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: "1rem",
                        color: "initial !important",
                        fontWeight: "normal !important",
                      }}
                    >
                      {totalItems} Items
                    </Typography>
                  </MUI.SwitchItem>
                  <SwitchPages
                    handleToggle={handleToggle}
                    toggle={toggle === "grid" ? "grid" : "list"}
                    setToggle={setToggle}
                  />
                </Box>
              )}
          </Fragment>
        )}
      </MUI.TitleAndSwitch>

      {isDataDeletedFoldersAndFilesFound !== null &&
        isDataDeletedFoldersAndFilesFound && (
          <>
            <SimpleBar
              title="Items in trash will be deleted forever after 30 days"
              barStyle={{
                color: "#4B465C",
                backgroundColor: "#E0E0E0",
              }}
            />
            <MUI_TRASH.TrashFilesList>
              {dataDeletedFoldersAndFiles &&
                dataDeletedFoldersAndFiles.map((dataDeletedFile, index) => {
                  return (
                    <React.Fragment key={index}>
                      {dataDeletedFile.data.length > 0 && (
                        <MUI_TRASH.TrashFilesItem>
                          <Typography variant="h4" fontWeight="bold">
                            {dataDeletedFile.title}
                          </Typography>
                          {toggle === "grid" && (
                            <FileCardContainer>
                              {dataDeletedFile.data.map((data, index) => {
                                return (
                                  <FileCardItem
                                    cardProps={{
                                      onClick: () => {},
                                      ...(dataSelector?.selectionFileAndFolderData?.find(
                                        (el) => el?.id === data?._id,
                                      ) && {
                                        ishas: "true",
                                      }),
                                    }}
                                    imagePath={
                                      user?.newName +
                                      "-" +
                                      user?._id +
                                      "/" +
                                      (data.newPath
                                        ? removeFileNameOutOfPath(data.newPath)
                                        : "") +
                                      data.newName
                                    }
                                    user={user}
                                    filePassword={data?.filePassword}
                                    id={data?._id}
                                    isCheckbox={true}
                                    fileType={getShortFileTypeFromFileType(
                                      data.type,
                                    )}
                                    handleSelect={(dataId) => {
                                      handleMultipleGridData(dataId, data);
                                    }}
                                    isContainFiles={
                                      data.totalItems
                                        ? data.totalItems > 0
                                          ? true
                                          : false
                                        : false
                                    }
                                    name={data.name}
                                    key={index}
                                    menuItems={trashMenuItems.map(
                                      (menuItem, index) => {
                                        return (
                                          <MenuDropdownItem
                                            onClick={() => {
                                              setDataForEvents({
                                                action: menuItem.action,
                                                data,
                                              });
                                            }}
                                            key={index}
                                            title={menuItem.title}
                                            icon={menuItem.icon}
                                          />
                                        );
                                      },
                                    )}
                                  />
                                );
                              })}
                            </FileCardContainer>
                          )}
                          {toggle === "list" && (
                            <TrashDataGrid
                              data={dataDeletedFile.data}
                              dataSelector={dataSelector}
                              handleEvent={(action, data) => {
                                setDataForEvents({
                                  action,
                                  data,
                                });
                              }}
                              handleSelection={(id) => {
                                handleMultipleListData(id, dataDeletedFile);
                              }}
                            />
                          )}
                        </MUI_TRASH.TrashFilesItem>
                      )}
                    </React.Fragment>
                  );
                })}
            </MUI_TRASH.TrashFilesList>
          </>
        )}

      {isDataDeletedFoldersAndFilesFound !== null &&
        !isDataDeletedFoldersAndFilesFound && (
          <Empty
            icon={<TrashEmpty />}
            title="Trash is Empty"
            context="Items moved to the trash will be deleted forever after 30 days"
          />
        )}
    </MUI_TRASH.TrashFilesContainer>
  );
}

export default Trash;
