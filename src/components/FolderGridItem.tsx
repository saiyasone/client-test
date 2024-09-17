import {
  Box,
  Checkbox,
  Grid,
  Paper,
  styled,
  useMediaQuery,
} from "@mui/material";

import Tooltip from "@mui/material/Tooltip";
import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
import useHover from "hooks/useHover";
import { useEffect, useRef, useState } from "react";
import { BsPinAngleFill } from "react-icons/bs";
import * as MUI from "styles/clientPage.style";

import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import MenuDropdown from "components/MenuDropdown";
import useOuterClick from "hooks/useOuterClick";
import { useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import { cutStringWithEllipsis } from "utils/string.util";

const CustomCheckbox: any = styled(Checkbox)({
  "& .MuiSvgIcon-root": {
    fontSize: 25,
    fontWeight: "300",
  },
});

const Item = styled(Paper)(({ theme, ...props }: any) => ({
  ...theme.typography.body2,
  textAlign: "left",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "201.58px",
  minHeight: "201.58px",
  width: "100%",
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px;",
  color: theme.palette.text.secondary,
  ":after": {
    transition: "100ms ease-in-out",
    position: "absolute",
    content: "''",
    display: "block",
    width: "100%",
    height: "100%",
    borderRadius: "inherit",
    backgroundColor: "#e2e8f0",
    opacity: props.isonhover === "true" ? 0.1 : 0,
  },
  ".checkbox-selected": {
    // color: "rgba(0, 0, 0, 0.4)",
  },
  ":hover": {
    ":after": {
      opacity: 0.1,
    },
    ".checkbox-selected": {
      display: "block",
    },
    cursor: "pointer",
  },

  // ...(props.ischecked ? { backgroundColor: "#A5D4CE" } : ""),
  // C7E3E0
  ...(props?.ishas ? { backgroundColor: "#DCEAE9" } : ""),
}));

const MenuButtonContainer = styled("div")({
  position: "absolute",
  top: 0,
  right: 0,
  zIndex: 99,
  margin: "5px",
});

const Pin = styled("div")({
  position: "absolute",
  bottom: "10px",
  left: "10px",
  color: "#17766B",
  fontSize: "18px",
  zIndex: 9,
});

const IconFolderContainer = styled("div")({
  minWidth: "150px",
  minHeight: "201.58px",
});

export default function FolderGridItem({ onOuterClick, cardProps, ...props }) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const itemRef = useRef(null);
  const isFolderItemHover = useHover(itemRef);
  const isCardOuterClicked = useOuterClick(itemRef);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // redux store
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  const { onDoubleClick: onCardDoubleClick, ...cardDataProps } =
    cardProps || {};

  const handleDropdownOpen = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  useEffect(() => {
    props.setIsOpenMenu(isFolderItemHover);
    setIsOpenMenu(isFolderItemHover);
  }, [isFolderItemHover]);

  useEffect(() => {
    props.setIsOpenMenu(isCardOuterClicked);
    onOuterClick?.();
  }, [isCardOuterClicked]);

  return (
    <Grid item md={4} lg={2} xs={6} sm={6}>
      <Item
        className="card-item"
        ref={itemRef}
        {...{
          ...cardDataProps,
          ...(!isDropdownOpen && {
            onDoubleClick: onCardDoubleClick,
          }),
          ischecked: cardDataProps?.ischecked?.toString(),
        }}
      >
        {props.isPinned && (
          <Pin>
            <BsPinAngleFill />
          </Pin>
        )}
        {props?.menuItem && isOpenMenu && (
          <MenuButtonContainer>
            <MenuDropdown
              customButton={props.customButton}
              onOpenChange={handleDropdownOpen}
            >
              {props.menuItem}
            </MenuDropdown>
          </MenuButtonContainer>
        )}
        <Box>
          <MUI.SelectionContainer>
            <CustomCheckbox
              className="checkbox-selected"
              sx={{
                display:
                  !!dataSelector?.selectionFileAndFolderData?.find(
                    (el) => el?.id === props?.id,
                  ) && true
                    ? "block"
                    : "none",
              }}
              icon={<CheckBoxOutlineBlankRoundedIcon />}
              aria-label={"check-" + props?.id}
              checked={
                !!dataSelector?.selectionFileAndFolderData?.find(
                  (el) => el?.id === props?.id,
                ) && true
              }
            />
          </MUI.SelectionContainer>

          <MUI.Folder>
            <IconFolderContainer>
              {props?.file_id || props?.folderId ? (
                <FolderNotEmptyIcon />
              ) : (
                <FolderEmptyIcon />
              )}
            </IconFolderContainer>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {props.folder_name.length > 10 ? (
                <Tooltip title={props.folder_name} placement="bottom">
                  <MUI.FolderTitle key={props.key}>
                    {cutStringWithEllipsis(
                      props?.folder_name,
                      isMobile ? 8 : 15,
                    )}
                  </MUI.FolderTitle>
                </Tooltip>
              ) : (
                <MUI.FolderTitle key={props.key}>
                  {cutStringWithEllipsis(props?.folder_name, isMobile ? 8 : 10)}
                </MUI.FolderTitle>
              )}
            </Box>
          </MUI.Folder>
        </Box>
      </Item>
    </Grid>
  );
}
