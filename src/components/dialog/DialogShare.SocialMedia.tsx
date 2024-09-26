import React from 'react';
import { IconButton } from '@mui/material';
import BaseDialogV1 from 'components/BaseDialogV1';
import { ShareSocial } from 'components/social-media';
import { IoMdClose } from 'react-icons/io';


const DialogShare = (props) => {

  return (
    <React.Fragment>
    <BaseDialogV1
        {...props}
        dialogProps={{
        PaperProps: {
            sx: {
            overflowY: "initial",
            maxWidth: "400px",
            userSelect: 'none'
            },
        },
        }}
        dialogContentProps={{
        padding: "20px",
        sx: {
            backgroundColor: "white !important",
            borderRadius: "6px",
            padding: 0,
        },
        }}
        disableOnClose={true}
        onClose={props.onClose}
    >
        <IconButton onClick={()=>props.onClose()} sx={{position:'absolute',right:-10, top:-8, zIndex:'50', padding:'3px', color:'white !important', backgroundColor: 'rgb(23, 118, 107,0.8) !important', borderRadius:'50% !important'}}>
            <IoMdClose />
        </IconButton>
        <ShareSocial
            socialTypes={[
            "copy",
            "facebook",
            "twitter",
            "line",
            "linkedin",
            "whatsapp",
            "viber",
            "telegram",
            "reddit",
            "instapaper",
            "livejournal",
            "mailru",
            "ok",
            "hatena",
            "email",
            "workspace",
            ]}
            url={props.url}
            title="Social Media"
        />
    </BaseDialogV1>
    </React.Fragment>
  )
}

export default DialogShare