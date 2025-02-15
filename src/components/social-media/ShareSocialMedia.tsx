import { Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  HatenaIcon,
  HatenaShareButton,
  InstapaperIcon,
  InstapaperShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  LivejournalIcon,
  LivejournalShareButton,
  MailruIcon,
  MailruShareButton,
  OKIcon,
  OKShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  EmailIcon,
  EmailShareButton,
  ViberShareButton,
  ViberIcon,
  TelegramShareButton,
  TelegramIcon,
  WorkplaceShareButton,
  WorkplaceIcon
} from "react-share";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { IndexPropsType } from "./type";
import { successMessage } from "utils/alert.util";

const useStyles = makeStyles({
  container: {
    position: "relative",
    background: 'rgb(23, 118, 107,0.8)',
    color: "#000",
    maxWidth: "568px",
    height: "auto",
    padding: "10px",
    outline: "none",
    minWidth: "250px",
    borderRadius: '5px',
    // overflow:'hidden',
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px;'
  },
  arrowUp: {
    position:'absolute',
    top: -16,
    left: 15,
    width: 0,
    height:0,
    borderLeft: '1rem solid transparent',
    borderRight: '1rem solid transparent',
    borderBottom: '1rem solid rgba(23, 118, 107, 0.8)',
    '@media (max-width: 600px)': {
      left: '50%',
    },
  },
  title: {
    color:'#fff',
    textAlign: "center",
    fontFamily: "Apple SD Gothic Neo",
    fontStyle: "normal",
    fontWeight: 800,
    fontSize: "20px",
    lineHeight: "2px",
    marginBottom: '15px',
    textDecoration:'underline',
    textDecorationColor:'rgb(255,255,255,0.6)',
    textDecorationThickness:'1px',
    textUnderlineOffset:'.5rem',
    "&:hover": {
      cursor: "none",
    }
  },
  iconContainer: {
    paddingTop: "15px",
    paddingBottom: "0px",
    textAlign: "center",
    "& button": {
      flex: "1 1 auto",
      border: "none",
      textAlign: "center",
      margin: "3px",
    },
  },
  closeImg: {
    position: "absolute",
    display: "flex",
    top: "20px",
    right: "20px",
    height: "50px",
    width: "50px",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    zIndex: 9,
    "&:hover": {
      cursor: "pointer",
    },
  },
  copyContainer: {
    // position: "relative",
    padding: "14px",
    border: "1px solid grey",
    color: "#263238",
    cursor: "text",
    display: "inline-flex",
    fontSize: "14px",
    boxSizing: "border-box",
    alignItems: "center",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    letterSpacing: "-0.05px",
    width: "100%",
    fontStyle: "normal",
    fontWeight: "bold",
    background: "black",
    borderRadius: "4px",
  },
  copyUrl: {
    color: "white",
    maxWidth: "calc(100% - 55px)",
    overflowX: "auto",
    fontSize: "16px",
    lineHeight: "24px",
    whiteSpace: "nowrap",
  },
  copyIcon: {
    width: "auto",
    // position: "absolute",
    // right: "0px",
    color: "#ebf0fa",
    fontWeight: "bold",
    "& p": {
      paddingRight: "15px",
      paddingLeft: "15px",
    },
    "&:hover": {
      cursor: "pointer",
      color: "#0C66FF",
    },
  },
  modalStyle: {
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:focus": {
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
    },
    "&:hover": {
      border: "none",
      outline: "none",
    },
  },
});

const components: any = {
  facebook: {
    Button: FacebookShareButton,
    Icon: FacebookIcon,
  },
  twitter: {
    Button: TwitterShareButton,
    Icon: TwitterIcon,
  },
  reddit: {
    Button: RedditShareButton,
    Icon: RedditIcon,
  },
  hatena: {
    Button: HatenaShareButton,
    Icon: HatenaIcon,
  },
  instapaper: {
    Button: InstapaperShareButton,
    Icon: InstapaperIcon,
  },
  line: {
    Button: LineShareButton,
    Icon: LineIcon,
  },
  linkedin: {
    Button: LinkedinShareButton,
    Icon: LinkedinIcon,
  },
  livejournal: {
    Button: LivejournalShareButton,
    Icon: LivejournalIcon,
  },
  mailru: {
    Button: MailruShareButton,
    Icon: MailruIcon,
  },
  ok: { Button: OKShareButton, Icon: OKIcon },
  whatsapp: {
    Button: WhatsappShareButton,
    Icon: WhatsappIcon,
  },
  pinterest: {
    Button: PinterestShareButton,
    Icon: PinterestIcon,
  },
  email: {
    Button: EmailShareButton,
    Icon: EmailIcon,
  },
  viber: {
    Button: ViberShareButton,
    Icon: ViberIcon,
  },
  telegram: {
    Button: TelegramShareButton,
    Icon: TelegramIcon,
  },
  workspace: {
    Button: WorkplaceShareButton,
    Icon: WorkplaceIcon,
  },
  copy: {
    Button: ContentCopyIcon,
    Icon: ContentCopyIcon
  }
};

function ShareSocial(props: IndexPropsType) {
  const classes = useStyles();
  const [isCopied, setIsCopied] = useState(false);
  const {
    title,
    socialTypes = ["facebook", "twitter"],
    style,
    url,
    onSocialButtonClicked = () => {},
  } = props;

  const copyToClipboard = (text: string) => {
    if (navigator && navigator.clipboard)
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setIsCopied(true);
          successMessage('Url was copied!', 3000)
        })
        .catch((error) => {
          alert(`Copy failed! ${error}`);
        });
  };

  useEffect(()=>{
    if(isCopied){
      setTimeout(() => {
        setIsCopied(false);
      }, 5000);
    }
  }, [isCopied]);

  function getComponent(type: string) {
    const { Button, Icon } = components[type];
    return (
        type && type === 'copy' ?
          <Tooltip title={'Copy to clipboard'}>
            <Button
              url={url}
              quote={title}
              onClick={() => copyToClipboard(url)}
              sx={{fontSize:'2.5rem', border:1, borderRadius: '30%', padding:'.4rem'}}
              className={classes.copyIcon}
              style={style?.copyIcon}
            >
              <Icon size={40} round/>
            </Button>
          </Tooltip>
          :
          <Tooltip title={type || ""} placement="top">
            <Button
              url={url}
              quote={title}
              onClick={() => onSocialButtonClicked(type)}
            >
              <Icon size={40} round />
            </Button>
          </Tooltip>
    );
  }

  return (
    <div className={classes.container} style={style?.root} data-testid="root">
      <div className={classes.arrowUp}></div>
      {title && (
        <h1 className={classes.title} style={style?.title} data-testid="title">
          {title}
        </h1>
      )}
      <div className={classes.iconContainer}>
          {Array.isArray(socialTypes) &&
            socialTypes.map((type, idx) => (
              <React.Fragment key={"social_item_" + idx}>
                {getComponent(type)}
              </React.Fragment>
            ))}
      </div>
    </div>
  );
}

export {ShareSocial};