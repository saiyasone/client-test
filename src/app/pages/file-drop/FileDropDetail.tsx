import { useLazyQuery, useMutation } from "@apollo/client";
import FileEmpty from "assets/images/empty/file-empty.svg?react";
import { Base64 } from "js-base64";
import moment from "moment";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";
import * as Mui from "./styles/fileDropDetail.style";

// components
import { Card } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import {
  MUTATION_ACTION_FILE,
  MUTATION_COPY_FILE,
  MUTATION_CREATE_FILE,
  MUTATION_DELETE_FILE,
  MUTATION_UPDATE_FILE,
} from "api/graphql/file.graphql";
import axios from "axios";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageFile from "hooks/file/useManageFile";
import useAuth from "hooks/useAuth";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { useDispatch, useSelector } from "react-redux";

import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import Empty from "components/Empty";
import FileCardContainer from "components/FileCardContainer";
import FileCardItem from "components/FileCardItem";
import MenuDropdownItem from "components/MenuDropdownItem";
import MenuMultipleSelectionFolderAndFile from "components/MenuMultipleSelectionFolderAndFile";
import SwitchPages from "components/SwitchPage";
import DialogFileDetail from "components/dialog/DialogFileDetail";
import DialogPreviewFile from "components/dialog/DialogPreviewFile";
import DialogRenameFile from "components/dialog/DialogRenameFile";
import DialogValidateFilePassword from "components/dialog/DialogValidateFilePassword";
import ProgressingBar from "components/loading/ProgressingBar";
import { ENV_KEYS } from "constants/env.constant";
import { fileDropMenuItems } from "constants/menuItem.constant";
import useGetUrlDownload from "hooks/url/useGetUrlDownload";
import useBreadcrumbData from "hooks/useBreadcrumbData";
import _ from "lodash";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  combineOldAndNewFileNames,
  cutFileType,
  getFileNameExtension,
  getFileType,
  getShortFileTypeFromFileType,
} from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import FileDropDataGrid from "./FileDropDataGrid";
import useFetchFile from "./hooks/useFetchFile";
import { decryptDataLink } from "utils/secure.util";

const ITEM_PER_PAGE = 10;

function FileDropDetail() {
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const manageFile = useManageFile({ user });
  const manageGraphqlError = useManageGraphqlError();
  const { url } = useParams();
  const UA = new UAParser();
  const result = UA.getResult();
  const [toggle, setToggle] = useState<any>(null);
  const [currentFilePage, setCurrentFilePage] = useState<any>(1);
  const [name, setName] = useState<any>("");
  const { setIsAutoClose } = useMenuDropdownState();
  const [progressing, setProgressing] = useState<any>(0);
  const [procesing, setProcesing] = useState<any>(true);
  const [showProgressing, setShowProgressing] = useState<any>(false);
  const [warningMessage, setWarningMessage] = useState<any>("");
  const [existName, setExistName] = useState<any>("");
  const [country, setCountry] = useState<any>(null);
  const [eventClick, setEventClick] = useState<any>(false);
  const [userPackage, setUserPackage] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<any>(false);

  const [getFolders] = useLazyQuery(QUERY_FOLDER, { fetchPolicy: "no-cache" });
  const [deleteFile] = useMutation(MUTATION_DELETE_FILE);
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [fileAction] = useMutation(MUTATION_ACTION_FILE);
  const [uploadToBunny] = useMutation(MUTATION_COPY_FILE);
  const [uploadFiles] = useMutation(MUTATION_CREATE_FILE);

  //dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState<any>(false);
  const [fileDetailsDialog, setFileDetailsDialog] = useState<any>(false);
  const [showEncryptPassword, setShowEncryptPassword] = useState<any>(false);
  const [dataForEvent, setDataForEvent] = useState<any>({
    action: null,
    type: null,
    data: {},
  });

  // redux store
  const dispatch = useDispatch();
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  /* data for Breadcrumb */
  const breadcrumbDataForFileDetails = useBreadcrumbData(
    dataForEvent.data?.newPath ||
      (dataForEvent.data?.newPath, dataForEvent.data?.filename),
    "",
  );

  const handleFileDetailDialogBreadcrumbFolderNavigate = async (link) => {
    const result = await getFolders({
      variables: {
        where: {
          path: link,
          createdBy: user?._id,
        },
      },
    });
    if (result) {
      const [dataById] = result.data.folders.data;
      const base64URL = Base64.encodeURI(dataById.url);
      navigate(`/folder/${base64URL}`);
    }
  };

  const handleToggle = (value) => {
    setToggle(value);
    localStorage.setItem("toggle", value);
  };

  const fetchFiles: any = useFetchFile({
    filter: {
      url: decryptDataLink(url as string),
    },
  });

  function handleMultipleFile(selected) {
    const valueOption = fetchFiles.data?.find((el) => el?._id === selected);

    dispatch(
      checkboxAction.setFileAndFolderData({
        data: {
          id: valueOption?._id,
          name: valueOption?.filename,
          newFilename: valueOption?.newFilename || "",
          newPath: valueOption?.newPath || "",
          checkType: "file",
          fileType: valueOption?.fileType,
          dataPassword: valueOption?.filePassword,
          isPublic: valueOption?.isPublic,
          size: valueOption?.size,
          createdBy: {
            _id: valueOption?.createdBy?._id,
            newName: valueOption?.createdBy?.newName,
          },
        },
      }),
    );
  }

  const handleClearSelection = () => {
    dispatch(checkboxAction.setRemoveFileAndFolderData());
  };

  useEffect(() => {
    handleClearSelection();
  }, [dispatch]);

  useEffect(() => {
    setUserPackage(user?.packageId);
  }, [user]);

  React.useEffect(() => {
    if (dataForEvent.action && dataForEvent.data) {
      menuOnClick(dataForEvent.action);
    }
  }, [dataForEvent.action]);

  React.useEffect(() => {
    if (dataForEvent.action) {
      setName(
        combineOldAndNewFileNames(
          dataForEvent.data.filename,
          dataForEvent.data.newFilename,
        ),
      );
    }
  }, [dataForEvent.action]);

  React.useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        setCountry("other");
        // const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);
        // const ip = responseIp?.data;
        // if (ip) {
        //   const res = await axios.get(
        //     `https://pro.ip-api.com/json/${ip}?key=x0TWf62F7ukWWpQ`,
        //   );
        //   if (res) {
        //     setCountry(res?.data?.countryCode);
        //   }
        // }
      } catch (error) {
        setCountry("other");
      }
    };
    fetchIPAddress();
  }, []);

  // get download url
  const [dataDownloadURL, setDataDownloadURL] = useState<any>(null);
  const handleDownloadUrl = useGetUrlDownload(dataDownloadURL);
  useEffect(() => {
    if (dataDownloadURL) {
      handleDownloadUrl?.(dataDownloadURL);
      setTimeout(() => {
        setDataDownloadURL(null);
      }, 500);
    }
  }, [dataDownloadURL]);

  const handleGetDownloadLink = async () => {
    setDataDownloadURL(dataForEvent.data);
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
  };

  const customGetFiles = () => {
    fetchFiles.customgetFiles();
  };

  const resetDataForEvent = () => {
    setDataForEvent((state) => ({
      ...state,
      action: "",
      data: {},
    }));
  };

  const menuOnClick = async (action) => {
    setIsAutoClose(true);
    const checkPassword = isCheckPassword();
    switch (action) {
      case "download":
        setEventClick("download");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          if (userPackage?.downLoadOption === "another") {
            handleGetDownloadLink();
          } else {
            handleDownloadFile();
          }
        }
        break;
      case "delete":
        setEventClick("delete");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          await handleDeleteFilesAndFolders();
        }
        break;
      case "rename":
        setEventClick("rename");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setRenameDialogOpen(true);
        }
        break;
      case "preview":
        setShowPreview(true);
        break;
      case "save_to_cloud":
        handleSaveToCloud();
        setDataForEvent((prev) => ({
          ...prev,
          action: "",
        }));
        break;
      case "detail":
        setEventClick("detail");

        if (checkPassword) {
          setShowEncryptPassword(true);
        } else {
          setFileDetailsDialog(true);
        }
        break;
      default:
        return;
    }
  };

  const handleAddFavourite = async () => {
    await manageFile.handleFavoriteFile(
      dataForEvent.data?._id,
      dataForEvent.data?.favorite ? 0 : 1,
      {
        onSuccess: async () => {
          setIsAutoClose(true);
          if (dataForEvent.data?.favorite) {
            successMessage("One file removed from favorite", 3000);
          } else {
            successMessage("One file added from favorite", 3000);
          }
          customGetFiles();
          setDataForEvent((prevState) => {
            return {
              ...prevState,
              action: "",
              data: {
                ...prevState.data,
                favorite: dataForEvent.data?.favorite ? 0 : 1,
              },
            };
          });
        },
        onFailed: (error) => {
          errorMessage(error, 3000);
        },
      },
    );
  };

  const handleSaveToCloud = async () => {
    try {
      const randomName = uuidv4();
      const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);
      const uploading = await uploadFiles({
        variables: {
          data: {
            ip: String(responseIp?.data),
            newFilename:
              randomName + getFileNameExtension(dataForEvent?.data?.filename),
            filename: dataForEvent?.data?.filename,
            fileType: dataForEvent?.data?.fileType,
            size: dataForEvent?.data?.size.toString(),
            checkFile: "main",
            country: country,
            device: result.os.name || "" + result.os.version || "",
            totalUploadFile: 1,
          },
        },
      });
      if (uploading?.data?.createFiles?._id) {
        const sourcePath = dataForEvent?.data?.newFilename || "";
        const destinationPath =
          user?.newName +
          "-" +
          user?._id +
          "/" +
          randomName +
          getFileNameExtension(dataForEvent?.data?.filename);
        handleUploadToBunny(sourcePath, destinationPath);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(cutErr, 3000);
    }
  };

  const handleUploadToBunny = async (sourcePath, destinationPath) => {
    try {
      await uploadToBunny({
        variables: {
          pathFile: {
            sourceFilePath: sourcePath,
            destinationFilePath: destinationPath,
          },
        },
        onCompleted: () => {
          successMessage("Download to cloud success!", 3000);
        },
      });
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(cutErr, 3000);
    }
  };

  const handleActionFile = async (val) => {
    try {
      await fileAction({
        variables: {
          fileInput: {
            createdBy: parseInt(user?._id),
            fileId: parseInt(dataForEvent.data._id),
            actionStatus: val,
          },
        },
      });
    } catch (error: any) {
      errorMessage(error, 3000);
    }
  };

  const handleDownloadFile = async () => {
    // setShowProgressing(true);
    // setProcesing(true);

    const multipleData = [
      {
        id: dataForEvent.data._id,
        newPath: dataForEvent?.data?.newPath,
        newFilename: dataForEvent.data.newFilename || "",
        isPublic: dataForEvent.data?.isPublic,
        createdBy: {
          _id: dataForEvent.data?.createdBy._id,
          newName: dataForEvent.data?.createdBy?.newName,
        },
      },
    ];

    await manageFile.handleSingleFileDropDownload(
      { multipleData },
      {
        // onProcess: async (countPercentage) => {
        //   setProgressing(countPercentage);
        // },
        onSuccess: async () => {
          successMessage("Download successful", 3000);
          setDataForEvent((state) => ({
            ...state,
            action: "",
            data: {
              ...state.data,
              totalDownload: dataForEvent.data.totalDownload + 1,
            },
          }));
          customGetFiles();
        },
        onFailed: async () => {
          errorMessage("Download failed! Please try again!", 3000);
        },
        onClosure: () => {
          setIsAutoClose(true);
          setFileDetailsDialog(false);
          resetDataForEvent();
          setShowProgressing(false);
          setProcesing(false);
          setProgressing(0);
        },
      },
    );
  };

  const handleDeleteFilesAndFolders = async () => {
    try {
      if (dataForEvent.type === "folder") {
        return;
      } else {
        try {
          await deleteFile({
            variables: {
              id: dataForEvent?.data?._id,
            },

            onCompleted: async () => {
              successMessage("Delete file successful!!", 3000);
              customGetFiles();
              resetDataForEvent();
            },
          });
        } catch (error: any) {
          const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
          errorMessage(cutErr, 3000);
        }
      }
    } catch (err) {
      resetDataForEvent();
      errorMessage("Sorry! Something went wrong. Please try again!");
    }
  };

  const handleRename = async () => {
    try {
      await updateFile({
        variables: {
          where: {
            _id: dataForEvent.data._id,
          },
          data: {
            filename: existName ? existName : name,
            updatedBy: user?._id,
          },
        },
        onCompleted: async () => {
          successMessage("Update File successful", 3000);
          setIsAutoClose(true);
          setWarningMessage("");
          setExistName("");
          customGetFiles();
          setRenameDialogOpen(false);
          await handleActionFile("edit");
          resetDataForEvent();
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
  };

  const handleDeleteMultipleFiles = async () => {
    try {
      await dataSelector?.selectionFileAndFolderData?.map(async (item) => {
        await deleteFile({
          variables: {
            id: item.id,
          },
          onCompleted: async () => {
            await customGetFiles();
          },
        });
      });
      await handleClearSelection();
      successMessage("Delete file successful!!", 3000);
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  const handleCloseRenameDialog = () => {
    setWarningMessage("");
    setExistName("");
    resetDataForEvent();
    setRenameDialogOpen(false);
  };

  const isCheckPassword = () => {
    let checkPassword = false;
    if (dataForEvent.data?.filePassword) {
      checkPassword = true;
    }

    return checkPassword;
  };

  const handleCloseDecryptedPassword = () => {
    setEventClick("");
    setDataForEvent((prev) => {
      return {
        ...prev,
        action: "",
      };
    });
    setShowEncryptPassword(false);
  };

  async function handleSubmitDecryptedPassword() {
    switch (eventClick) {
      case "download":
        await handleDownloadFile();
        await handleCloseDecryptedPassword();
        break;
      case "delete":
        await handleDeleteFilesAndFolders();
        await handleCloseDecryptedPassword();
        break;
      case "rename":
        setRenameDialogOpen(true);
        handleCloseDecryptedPassword();
        break;
      case "detail":
        setFileDetailsDialog(true);
        handleCloseDecryptedPassword();
        break;

      default:
        break;
    }
  }

  return (
    <React.Fragment>
      <Mui.FileTypeContainer>
        <Mui.TitleAndSwitch className="title-n-switch" sx={{ my: 2 }}>
          {dataSelector.selectionFileAndFolderData?.length ? (
            <MenuMultipleSelectionFolderAndFile
              isFileDrop={true}
              onPressDeleteDrop={handleDeleteMultipleFiles}
              country={country}
              device={result}
            />
          ) : (
            <Fragment>
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  href="/file-drop"
                  sx={{
                    color: "#4B465C",
                    fontSize: "0.9rem",
                    fontWeight: "400",
                    "&:hover": {
                      cursor: "pointer",
                      textDecoration: "none",
                    },
                  }}
                >
                  file drop
                </Link>
                <Link
                  sx={{
                    color: "#4B465C",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    "&:hover": {
                      cursor: "pointer",
                      textDecoration: "none",
                    },
                  }}
                >
                  file drop details
                </Link>
              </Breadcrumbs>
              {fetchFiles.isDataFound !== null && fetchFiles.isDataFound && (
                <SwitchPages
                  handleToggle={handleToggle}
                  toggle={toggle === "grid" ? "grid" : "list"}
                  setToggle={setToggle}
                />
              )}
            </Fragment>
          )}
        </Mui.TitleAndSwitch>

        {fetchFiles.isDataFound !== null && fetchFiles.isDataFound ? (
          <Mui.FileTypeList>
            <React.Fragment>
              {fetchFiles.data.length > 0 && (
                <Mui.FileTypeItem>
                  <React.Fragment>
                    {toggle === "grid" && (
                      <FileCardContainer>
                        {fetchFiles.data.map((data, index) => {
                          const privatePath =
                            user?.newName +
                              "-" +
                              user?._id +
                              "/" +
                              data?.newPath || "";
                          const publicPath = "public/" + data.newFilename;

                          return (
                            <FileCardItem
                              cardProps={{
                                onDoubleClick: () => {
                                  setDataForEvent({
                                    action: "preview",
                                    data,
                                  });
                                },
                              }}
                              id={data?._id}
                              imagePath={
                                data?.createdBy?._id === "0"
                                  ? publicPath
                                  : privatePath
                              }
                              isPublic={
                                data?.createdBy?._id === "0" ? true : false
                              }
                              user={user}
                              isCheckbox={true}
                              selectType={"file"}
                              fileType={getShortFileTypeFromFileType(
                                data.fileType,
                              )}
                              name={combineOldAndNewFileNames(
                                data.filename,
                                data.newFilename,
                              )}
                              key={index}
                              handleSelect={handleMultipleFile}
                              menuItems={fileDropMenuItems.map(
                                (menuItem, index) => {
                                  return (
                                    <MenuDropdownItem
                                      isFavorite={data.favorite ? true : false}
                                      onClick={() => {
                                        setDataForEvent({
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
                    {toggle !== "grid" && (
                      <Card>
                        <FileDropDataGrid
                          pagination={{
                            total: Math.ceil(fetchFiles.total / ITEM_PER_PAGE),
                            currentPage: currentFilePage,
                            setCurrentPage: setCurrentFilePage,
                          }}
                          data={fetchFiles.data}
                          dataSelector={dataSelector}
                          handleEvent={(action, data) => {
                            setDataForEvent({
                              action,
                              data,
                            });
                          }}
                          handleSelection={handleMultipleFile}
                        />
                      </Card>
                    )}
                  </React.Fragment>
                </Mui.FileTypeItem>
              )}
            </React.Fragment>
          </Mui.FileTypeList>
        ) : (
          <Empty
            icon={<FileEmpty />}
            title="File drop is empty!"
            context="You have no files and folders uploaded via this link!"
          />
        )}
      </Mui.FileTypeContainer>
      {!_.isEmpty(dataForEvent.data) && (
        <DialogFileDetail
          path={breadcrumbDataForFileDetails}
          name={dataForEvent.data?.filename || dataForEvent.data?.filename}
          breadcrumb={{
            handleFolderNavigate:
              handleFileDetailDialogBreadcrumbFolderNavigate,
          }}
          type={
            dataForEvent.data.fileType
              ? getShortFileTypeFromFileType(dataForEvent.data.fileType)
              : cutFileType(dataForEvent.data.filename) || "folder"
          }
          displayType={
            dataForEvent.data.fileType ||
            getFileType(dataForEvent.data.filename) ||
            "folder"
          }
          data={dataForEvent.data}
          size={
            dataForEvent.data.size
              ? convertBytetoMBandGB(dataForEvent.data.size)
              : 0
          }
          dateAdded={moment(dataForEvent.data.createdAt).format(
            "D MMM YYYY, h:mm A",
          )}
          lastModified={moment(dataForEvent.data.updatedAt).format(
            "D MMM YYYY, h:mm A",
          )}
          totalDownload={dataForEvent.data.totalDownload}
          isOpen={fileDetailsDialog}
          onClose={() => {
            resetDataForEvent();
            setFileDetailsDialog(false);
          }}
          imagePath={
            dataForEvent?.data?.createdBy !== "0"
              ? user?.newName +
                "-" +
                user?._id +
                "/" +
                dataForEvent?.data?.newPath
              : "public/" + dataForEvent?.data?.newFilename
          }
          user={user}
          {...{
            favouriteIcon: {
              isShow: false,
              handleFavouriteOnClick: async () => await handleAddFavourite(),
              isFavourite: dataForEvent.data.favorite ? true : false,
            },
            downloadIcon: {
              isShow: true,
              handleDownloadOnClick: async () => await handleDownloadFile(),
            },
          }}
        />
      )}
      <DialogRenameFile
        open={renameDialogOpen}
        onClose={handleCloseRenameDialog}
        onSave={handleRename}
        title={"Rename file"}
        label={"Rename file"}
        setName={setName}
        defaultValue={dataForEvent?.data?.filename}
        extension={getFileNameExtension(name)}
        name={existName ? existName : name}
        detail={warningMessage}
      />
      {showProgressing && (
        <ProgressingBar procesing={procesing} progressing={progressing} />
      )}

      {showPreview && (
        <DialogPreviewFile
          open={showPreview}
          isPublicPath={
            dataForEvent.data?.createdBy?._id === "0" ? true : false
          }
          handleClose={() => {
            resetDataForEvent();
            setShowPreview(false);
          }}
          onClick={() => {
            if (userPackage?.downLoadOption === "another") {
              handleGetDownloadLink();
            } else {
              handleDownloadFile();
            }
          }}
          filename={dataForEvent.data.filename}
          newFilename={dataForEvent.data.newFilename}
          fileType={dataForEvent.data.fileType}
          path={dataForEvent.data.newPath || "public"}
          user={user}
          userId={user?._id}
        />
      )}

      <DialogValidateFilePassword
        isOpen={showEncryptPassword}
        filename={dataForEvent.data?.filename}
        newFilename={dataForEvent.data?.newFilename}
        filePassword={dataForEvent.data?.filePassword}
        onConfirm={handleSubmitDecryptedPassword}
        onClose={handleCloseDecryptedPassword}
      />
    </React.Fragment>
  );
}

export default FileDropDetail;
