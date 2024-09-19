import { LoadingButton } from '@mui/lab';
import { Box, Typography, TextField, Grid, Select, MenuItem, styled,createTheme, Divider, IconButton } from '@mui/material';
import BaseDialogV1 from 'components/BaseDialogV1'
import useAuth from 'hooks/useAuth';
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
import React, { useEffect, useState } from 'react'
import { convertBytetoMBandGB } from 'utils/storage.util';
import { removeFileNameOutOfPath } from 'utils/file.util';
import _ from 'lodash';
import ImageComponent from 'components/getImage';
import { IoMdClose } from 'react-icons/io';
const theme = createTheme();

export const ButtonContainer = styled(LoadingButton)({
    padding: "0.3rem",
    fontSize: "14px",
    marginBottom: "1rem",
    borderRadius: "2rem",
    background: "#17766B",
    width: '70%',
    [theme.breakpoints.down("sm")]: {
      padding: "0.2rem",
    },
  });

  const IconFolderContainer = styled(Box)({
    width: "30px",
  });

const DialogGetLink = (props) => {
    const { user }: any = useAuth();
    const { onClose, onCreate, data } = props;

      const [expiredAt, setExpiredAt] = useState(7);
      const [password, setPassword] = useState('');
      const [folders, setFolders] = useState<any[]>([null]);
      const [files, setFiles] = useState<any[]>([null]);

      function handleCloseForm() {
        onClose();
      }

      const handleGenerate = () => {
        onCreate({expiredAt, password});
      }

      useEffect(()=>{
        setFiles([]);
        setFolders([]);

        if(Array.isArray(data)){
            data.forEach((value)=>{
                if(data && value?.folder_type === 'folder'){
                    setFolders((prevFolders) => [...prevFolders, value]);
                }
                else{
                    setFiles((prevFiles) => [...prevFiles, value]);
                }
            })
        }
        else
        {
            if(data && data?.folder_type === 'folder'){
                setFolders((prevFolders) => [...prevFolders, data]);
            }
            else{
                setFiles((prevFiles) => [...prevFiles, data]);
            }
        }
        
      },[data]);

  return (
    <React.Fragment>
        <BaseDialogV1
            {...props}
            dialogProps={{
            PaperProps: {
                sx: {
                overflowY: "initial",
                maxWidth: "500px",
                },
            },
            }}
            disableOnClose={true}
            dialogContentProps={{
            padding: "20px",
            sx: {
                backgroundColor: "white !important",
                borderRadius: "6px",
                padding: 0,
            },
            }}
            onClose={handleCloseForm}
        >
            <IconButton onClick={()=>onClose()} sx={{position:'absolute',right:0, top:0}}>
                <IoMdClose />
            </IconButton>
            <Box style={{padding: 15, margin:'15px', borderRadius: '10%', border:2}}>
                <Typography component={'div'} sx={{ borderRadius:'5px'}}>
                    <Box sx={{display:'flex',flexDirection:'column', alignItems:'center', paddingY: 3}}>
                        <Typography variant='h6'>Paste a password, secret message or private link below</Typography>
                        <Typography component={'p'} sx={{opacity: '90%', fontSize: 14, mt: 2}}>Keep sensitive info out of your email and chat logs</Typography>
                    </Box>
                      {
                        ((folders && folders?.length > 0) || (files && files?.length > 0)) &&
                        <Box sx={{border: '1px solid #d6d6d6', borderRadius:'5px', padding: 3, marginY: 5 }}>
                            {
                                folders.map((item, index)=>(
                                    <Box  key={index} sx={{ height: "100%", width: "100%" }}>
                                        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div
                                                style={{
                                                display: "flex",
                                                alignItems: "center",
                                                columnGap: "6px",
                                                }}
                                            >
                                            <IconFolderContainer>
                                            {
                                                item?.total_size > 0 ? (
                                                    <FolderNotEmptyIcon />
                                                ) : (
                                                    <FolderEmptyIcon />
                                                )
                                            }
                                            </IconFolderContainer>
                                            {item?.folder_name}
                                            </div>
                                            <Typography>{convertBytetoMBandGB(item?.total_size)}</Typography>
                                        </Box>

                                    {
                                        folders?.length > 1 && ((index + 1) < folders?.length) &&
                                        <Divider/>
                                    }
                                    </Box>
                                ))
                            }
                            {
                                files.map((item, index)=>(
                                    <Box key={index} sx={{ height: "100%", width: "100%" }}>
                                        {
                                            folders?.length > 1 && ((index + 1) < folders?.length) &&
                                            <Divider/>
                                        }
                                        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div
                                                style={{
                                                display: "flex",
                                                alignItems: "center",
                                                columnGap: "6px",
                                                }}
                                            >
                                            <Box style={{width: '100px !important', height: '100px !important'}}>
                                                <ImageComponent
                                                    imagePath={user?.newName + "-" + user?._id + (item?.path ? removeFileNameOutOfPath(item?.path) : "") + "/" + item?.newFilename}
                                                    isPublic={item?.isPublic}
                                                    userId={user?._id}
                                                />
                                            </Box>
                                            {item?.filename?.length <= 15 ? item?.filename : item?.filename?.substring(0, 9)+'...'+item?.filename?.substring(item?.filename?.length-6, item?.filename?.length)}
                                            </div>
                                            <Typography>{convertBytetoMBandGB(item?.size)}</Typography>
                                        </Box>
                                        {
                                            files?.length > 1 && ((index + 1) < files?.length) &&
                                            <Divider/>
                                        }
                                    </Box>
                                ))
                            }
                        </Box>
                      }
                     <Grid container>
                        <Grid item xs={12} md={6} sx={{paddingRight: {md: 5, lg: 7}}}>
                            <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
                                Password
                            </Typography>
                            <TextField
                                type="password"
                                name="password"
                                label="password"
                                fullWidth
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                                InputLabelProps={{
                                    style: {
                                    color: "gray",
                                    height: "35px",
                                    minHeight: "35px",
                                    },
                                }}
                                size={"small"}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: "35px",
                                    },
                                }}
                                />
                        </Grid>
                        <Grid item xs={12} md={6}  sx={{paddingLeft: {md: 5, lg:7}}}>
                            <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
                                Expire time
                            </Typography>
                            <Select
                                labelId="expiredAt"
                                id="expiredAt"
                                value={expiredAt}
                                onChange={(e)=>setExpiredAt(Number(e.target.value))}
                                fullWidth
                                style={{
                                    height: "35px",
                                    minHeight: "35px",
                                    marginRight: "0.5rem",
                                    width: "100%",
                                }}
                                defaultValue={7}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: "35px",
                                    },
                                }}
                            >
                                <MenuItem value={1}>1 days</MenuItem>
                                <MenuItem value={3}>3 days</MenuItem>
                                <MenuItem value={5}>5 days</MenuItem>
                                <MenuItem value={7}>7 days</MenuItem>
                                <MenuItem value={15}>15 days</MenuItem>
                                <MenuItem value={15}>30 days</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                    <Box sx={{display:'flex',flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop: 10}}>
                        <ButtonContainer
                            type="button"
                            variant="contained"
                            color="success"
                            size="small"
                            fullWidth
                            onClick={handleGenerate}
                            disabled={!((folders && folders?.length > 0) || (files && files?.length > 0))}
                            >
                            Generate secret link Url
                        </ButtonContainer>
                        <Typography>* Please, keep your URL in secure!</Typography>
                    </Box>
                </Typography>
            </Box>
        </BaseDialogV1>
    </React.Fragment>
  )
}

export default DialogGetLink