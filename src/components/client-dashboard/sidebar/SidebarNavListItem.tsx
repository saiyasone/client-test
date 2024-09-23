import { useLazyQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import { FolderContext } from "contexts/FolderProvider";
import useAuth from "hooks/useAuth";
import { Base64 } from "js-base64";
import { rgba } from "polished";
import React, { forwardRef, useContext, useState } from "react";
import { BsPinAngleFill } from "react-icons/bs";
import { NavLink, useNavigate } from "react-router-dom";

const CustomRouterLink = forwardRef((props: any, ref: any) => (
  <div ref={ref}>
    <NavLink {...props} />
  </div>
));

const Item: any = styled(ListItemButton)`
  padding-top: ${(props: any) =>
    props.theme.spacing(props.depth && props.depth > 0 ? 2 : 3)};
  padding-bottom: ${(props: any) =>
    props.theme.spacing(props.depth && props.depth > 0 ? 2 : 3)};
  padding-left: ${(props: any) => props.theme.spacing(props.depth > 0 ? 6 : 6)};
  padding-right: ${(props: any) =>
    props.theme.spacing(props.depth > 0 ? 2 : 5)};
  font-weight: ${(props: any) => props.theme.typography.fontWeightRegular};
  svg {
    color: black;
    font-size: 20px;
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }

  &:hover {
    background: #ededed;
    border-radius: 6px;
    span {
      opacity: 1;
      font-weight: 400;
    }
  }
  &.${(props: any) => props.activeclassname} {
    border-radius: 6px;
    background: #17766b;
    span {
      color: #fff;
      opacity: 1;
      font-weight: bold;
    }
    svg {
      opacity: 1;
      font-weight: bold;
      color: #fff;
    }
  }
`;

const Title: any = styled(ListItemText)`
  margin: 0;
  span {
    color: black;
    font-size: 16px;
    opacity: 0.5;
    padding: 0 ${(props: any) => props.theme.spacing(2)};
  }
`;

const Badge = styled(Chip)`
  font-weight: ${(props: any) => props.theme.typography.fontWeightBold};
  height: 20px;
  position: absolute;
  right: 26px;
  top: 12px;
  background: ${(props: any) => props.theme.sidebar.badge.background};
  z-index: 1;
  span.MuiChip-label,
  span.MuiChip-label:hover {
    font-size: 11px;
    cursor: pointer;
    color: ${(props: any) => props.theme.sidebar.badge.color};
    padding-left: ${(props: any) => props.theme.spacing(2)};
    padding-right: ${(props: any) => props.theme.spacing(2)};
  }
`;

const Span = styled("span")`
  &.${(props: any) => props.activeclassname} {
    margintop: "50px";
  }
`;

const ListItemIconPin = styled(ListItemIcon)({
  minWidth: "20px",
});
const IconContainner = styled("span")({
  display: "flex",
  alignItems: "center",
  fontSize: "12px",
  color: "black",
});

const ExpandLessIcon = styled(ExpandLess)`
  color: ${(props: any) => rgba(props.theme.sidebar.color, 0.5)};
`;

const ExpandMoreIcon = styled(ExpandMore)`
  color: ${(props: any) => rgba(props.theme.sidebar.color, 0.5)};
`;

const SidebarNavListItem = (props) => {
  const {
    title,
    href,
    depth = 0,
    children,
    icon: Icon,
    badge,
    open: openProp = false,
  } = props;
  const navigate = useNavigate();
  const { user }: any = useAuth();
  const [open, setOpen] = React.useState(openProp);
  const [openPin, setOpenPin] = React.useState(false);
  const [isHide, setIsHide] = useState(false);
  const [getFolder, { data: folderData, refetch: refetchingFolder }] =
    useLazyQuery(QUERY_FOLDER);
  const { triggerFolder }: any = useContext(FolderContext);
  const handleToggle = () => {
    setOpen((state) => !state);
  };

  const queryFolder = async () => {
    getFolder({
      variables: {
        where: {
          pin: 1,
          createdBy: user?._id,
          status: "active",
        },
        orderBy: "updatedAt_DESC",
        limit: 5,
      },
    });
    if (folderData?.folders?.data?.length > 0) {
      setIsHide(true);
    } else {
      setIsHide(false);
    }

    // if (myFolder) {
    //   setFolder(folderData?.folders?.data);
    //   if (folderData?.folders?.data?.length > 0) {
    //     setIsHide(true);
    //   } else {
    //     setIsHide(false);
    //   }
    // }
  };

  React.useEffect(() => {
    queryFolder();
  }, [folderData?.folders?.data, isHide]);

  React.useEffect(() => {
    refetchingFolder();
  }, [triggerFolder]);

  const handleOpenPind = () => {
    setOpenPin(!openPin);
  };
  const hanleClosePin = () => {
    setOpenPin(false);
  };
  const handleOpen = (val) => {
    const base64URL = Base64.encodeURI(val?.url);
    navigate(`/folder/${base64URL}`);
  };

  if (openPin) {
    return (
      <React.Fragment>
        <Item depth={depth}>
          <Span style={{ display: "flex", alignItems: "center" }}>
            {Icon && <Icon />}
          </Span>
          <Title depth={depth} onClick={hanleClosePin}>
            {title}
            {badge && <Badge label={badge} />}
          </Title>
          {isHide && folderData?.folders?.data?.length > 0 && (
            <Span
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
              }}
              onClick={handleToggle}
            >
              {title === "My Cloud" && <BsPinAngleFill fill="#333" size="12" />}
            </Span>
          )}
        </Item>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {folderData?.folders?.data?.length > 0 && (
            <List
              component="div"
              disablePadding
              sx={{
                bgcolor: "#fff",
                boxShadow:
                  "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
              }}
            >
              {folderData?.folders?.data?.map((row, index) => (
                <ListItemButton key={index}>
                  <ListItemIconPin sx={{ ml: 4 }}>
                    <BsPinAngleFill fill="#333" />
                  </ListItemIconPin>
                  <ListItemText
                    sx={{ marginLeft: "5px" }}
                    onClick={() => handleOpen(row)}
                  >
                    {row?.folder_name}
                  </ListItemText>
                </ListItemButton>
              ))}
              <ListItemButton
                depth={depth}
                component={CustomRouterLink}
                to={href}
              >
                <ListItemText sx={{ ml: 5 }}>View more..</ListItemText>
              </ListItemButton>
            </List>
          )}
        </Collapse>
      </React.Fragment>
    );
  }
  if (children) {
    return (
      <React.Fragment>
        <Item depth={depth} onClick={handleToggle}>
          <Span>{Icon && <Icon />}</Span>
          <Title depth={depth}>
            {title}
            {badge && <Badge label={badge} />}
          </Title>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Item>
        <Collapse in={open}>{children}</Collapse>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Item
        depth={depth}
        component={CustomRouterLink}
        to={href}
        activeclassname="active"
        sx={{
          "&.active": {
            svg: {
              color: "white !important",
              fill: "white !important",
              stroke: "white !important",
              "*": {
                stroke: `${title !== "For you" ? "white" : "gray"}!important`,
              },
            },
          },
        }}
      >
        <Span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {Icon && <Icon />}
        </Span>
        <Title depth={depth}>
          {title}
          {badge && <Badge label={badge} />}
        </Title>
        {isHide && folderData?.folders?.data?.length > 0 && (
          <IconContainner onMouseEnter={handleOpenPind}>
            {isHide && title === "My Cloud" && (
              <BsPinAngleFill fill="#FFFFFF" size="12" />
            )}
          </IconContainner>
        )}
      </Item>
    </React.Fragment>
  );
};

export default SidebarNavListItem;
