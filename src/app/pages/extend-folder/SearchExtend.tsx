import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  InputLabel,
  ListItemText,
  styled,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FileCardItemIcon from "components/file/FileCardItemIcon";
import MenuDropdown from "components/MenuDropdown";
import NormalButton from "components/NormalButton";
import useAuth from "hooks/useAuth";
import useFetchSubFolderAndFile from "hooks/useFetchSubFolderAndFIle";
import moment from "moment";
import React from "react";
import { CiSearch } from "react-icons/ci";
import { IFileTypes } from "types/filesType";
import { IFolderTypes } from "types/mycloudFileType";
import { IUserTypes } from "types/userType";
import {
  getShortFileTypeFromFileType,
  removeFileNameOutOfPath,
} from "utils/file.util";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { cutStringWithEllipsis } from "utils/string.util";
import MenuDropdownItem from "components/MenuDropdownItem";
import menuItems from "constants/menuItem.constant";

const HeadSearch = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "1.2rem 0.8rem",
}));

const ContainerSearch = styled("div")(() => ({
  margin: "0 0.8rem",
}));
const ContainerFolderFiles = styled("div")(() => ({
  margin: "0.8rem 0 0",
}));

interface ISearchProps {
  handleClose?: () => void;
  open?: boolean;
  parentFolder: IFolderTypes;
}
interface AuthContextType {
  user: IUserTypes | null;
}

export default function SearchExtend({
  handleClose,
  open,
  parentFolder,
}: ISearchProps) {
  const theme = useTheme();
  const { user } = useAuth() as AuthContextType;
  const [search, setSearch] = React.useState<string>("");
  const [isSearch, setIsSearch] = React.useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const fetchSubFoldersAndFiles = useFetchSubFolderAndFile({
    id: isSearch ? parentFolder?._id : "",
    toggle: isSearch ? "grid" : "",
    name: isSearch ? search : "",
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearch(true);
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
  };

  setTimeout(() => {
    setIsSearch(false);
  }, 200);
  React.useEffect(() => {
    if (!search && search == "") {
      setIsSearch(true);
    }
  }, [search]);

  React.useEffect(() => {
    if (isSearch) {
      fetchSubFoldersAndFiles.queryGridDataFileAndFolder();
    }
  }, [isSearch]);


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
                height: "80vh",
                margin: 0,
                borderBottom: "0",
                position: "absolute",
                left: 0,
                bottom: 0,
                right: 0,
                borderRadius: "10px 10px 0 0",
              },
            }}
          >
            <HeadSearch>
              <Typography component="h6" variant="h6">
                Search files
              </Typography>
              <CloseIcon
                sx={{ color: theme.palette.grey[600] }}
                onClick={handleClose}
              />
            </HeadSearch>
            <ContainerSearch>
              <Box>
                <InputLabel>Search</InputLabel>
                <Box
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "45px",
                      },
                      "& .MuiInputBase-input": {
                        padding: "0 14px",
                        height: "20px",
                      },
                    }}
                    value={search}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    sx={{
                      height: "45px",
                      padding: "0 10px",
                      minWidth: "auto",
                      color: "gray",
                      borderColor: "gray",
                    }}
                  >
                    <CiSearch size={24} />
                  </Button>
                </Box>
              </Box>

              <ContainerFolderFiles>
                {fetchSubFoldersAndFiles?.files?.data &&
                  fetchSubFoldersAndFiles.files?.data?.map(
                    (fileTerm: IFileTypes, index: number) => {
                        console.log(fileTerm);
                        
                      const isContainsFiles =
                        fileTerm.checkTypeItem === "folder" && fileTerm?.size
                          ? Number(fileTerm.size) > 0
                            ? true
                            : false
                          : false;
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "start",
                              flexShrink: 0,
                              columnGap: 1,
                              gap: 2,
                            }}
                          >
                            <Box sx={{ maxWidth: "60px", mt: 2 }}>
                              <FileCardItemIcon
                                isContainFiles={isContainsFiles}
                                name={fileTerm.filename}
                                password={fileTerm?.password}
                                fileType={getShortFileTypeFromFileType(
                                  fileTerm.type,
                                )}
                                imagePath={
                                  user?.newName +
                                  "-" +
                                  user?._id +
                                  "/" +
                                  (fileTerm.newPath
                                    ? removeFileNameOutOfPath(fileTerm.newPath)
                                    : "") +
                                  fileTerm.newName
                                }
                                user={user}
                              />
                            </Box>

                            <Box>
                              <Typography
                                variant="h6"
                                component="p"
                                sx={{
                                  fontSize: "0.8rem",
                                }}
                              >
                                {cutStringWithEllipsis(fileTerm.filename, 25)}
                              </Typography>
                              <ListItemText
                                sx={{ fontSize: "0.5rem" }}
                                primary={moment(fileTerm.createdAt).format(
                                  "MM-DD-YYYY",
                                )}
                              />
                            </Box>
                          </Box>
                          <Box>
                            <MenuDropdown
                              customButton={{
                                element: (
                                  <NormalButton>
                                    <MoreVertIcon
                                      style={{
                                        color: theme.palette.primaryTheme!.main,
                                      }}
                                    />
                                  </NormalButton>
                                ),
                              }}
                            >
                              {fileTerm.checkTypeItem === "file" && (
                                <div>
                                  {menuItems.map((menuItem, index) => {
                                    console.log(menuItem);
                                    
                                    return (
                                      <MenuDropdownItem
                                        key={index}
                                        isFavorite={
                                          fileTerm.favorite ? true : false
                                        }
                                        // isPassword={
                                        //   fileTerm?.password ||
                                        //   fileTerm?.access_passwordFolder
                                        // }
                                        isPassword={fileTerm?.password}
                                        title={menuItem.title}
                                        icon={menuItem.icon}
                                        // onClick={() => {
                                        //   handleCheckPasswordBeforeEvent(
                                        //     menuItem.action,
                                        //     fileTerm,
                                        //   );
                                        // }}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                              {/* {fileTerm.checkTypeItem === "folder" && (
                                <div>
                                  {favouriteMenuItems?.map(
                                    (menuItems, index) => {
                                      return (
                                        <MenuDropdownItem
                                          key={index}
                                          className="menu-item"
                                          isPinned={fileTerm.pin ? true : false}
                                          isPassword={
                                            fileTerm?.password ||
                                            fileTerm?.access_passwordFolder
                                          }
                                          title={menuItems.title}
                                          icon={menuItems.icon}
                                          onClick={() => {
                                            handleCheckPasswordBeforeEvent(
                                              menuItems.action,
                                              fileTerm,
                                            );
                                          }}
                                        />
                                      );
                                    },
                                  )}
                                </div>
                              )} */}
                            </MenuDropdown>
                          </Box>
                        </Box>
                      );
                    },
                  )}
              </ContainerFolderFiles>
            </ContainerSearch>
          </Dialog>
        )}
      </div>
    </>
  );
}
