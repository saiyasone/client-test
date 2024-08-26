import { useMutation } from "@apollo/client";
import { Button, Typography, styled, useMediaQuery } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { createTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import {
  MUTATION_CREATE_SHARE,
  MUTATION_CREATE_SHARE_FROM_SHARING,
} from "api/graphql/share.graphql";
import ActionCreateShare from "components/share/ActionCreateShare";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { useMenuDropdownState } from "contexts/MenuDropdownProvider";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { MuiChipsInput } from "mui-chips-input";
import React, { Fragment } from "react";
import "styles/chipInput.style.css";
import * as MUI from "styles/share.style";
import { errorMessage, successMessage } from "utils/alert.util";

const theme = createTheme();
const ActionContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  margin: "40px 0px 30px 0px",
});
const TextInputdShare = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  margin: "10px 0px",
  [theme.breakpoints.down("sm")]: {
    display: "column",
    flexDirection: "column",
  },
}));
const BoxTitle = styled("div")({});

const DialogCreateMultipleShare = (props) => {
  const { open, data, onClose, dataSelector } = props;

  const manageGraphqlError = useManageGraphqlError();
  const [createShare] = useMutation(MUTATION_CREATE_SHARE);
  const [createShareFromSharing] = useMutation(
    MUTATION_CREATE_SHARE_FROM_SHARING,
  );
  const [statusShare, setStatusShare] = React.useState("view");
  const [isGlobals, _setIsGlobals] = React.useState("private");
  const isMobile = useMediaQuery("(max-width:768px)");
  const [_getURL, _setGetURL] = React.useState("");
  const [chipData, setChipData] = React.useState([]);
  const eventUploadTrigger = React.useContext(EventUploadTriggerContext);
  const { setIsAutoClose } = useMenuDropdownState();

  const handleChange = (newChip) => {
    setChipData(newChip);
  };

  const isValidEmail = (data) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(data);
  };

  React.useEffect(() => {
    isValidEmail(data);
  }, [chipData]);

  const handleShareStatus = async () => {
    try {
      if (dataSelector?.length > 0) {
        if (chipData.length > 0) {
          dataSelector?.map(async (item) => {
            if (item.checkType === "folder") {
              for (let i = 0; i < chipData.length; i++) {
                if (item?.share?.isFromShare) {
                  await createShareFromSharing({
                    variables: {
                      body: {
                        shareId: item?.share._id,
                        toAccount: chipData[i],
                        permission: statusShare,
                      },
                    },
                  });
                } else {
                  await createShare({
                    variables: {
                      body: {
                        folderId: item?.id,
                        toAccount: chipData[i],
                        isPublic: isGlobals,
                        permission: statusShare,
                      },
                    },
                  });
                }
              }
            } else {
              let shareCount = 0;
              for (let i = 0; i < chipData.length; i++) {
                if (item?.share?.isFromShare) {
                  shareCount += 1;
                  await createShareFromSharing({
                    variables: {
                      body: {
                        permission: statusShare,
                        toAccount: chipData[i],
                        shareId: item?.share._id,
                      },
                    },
                  });
                } else {
                  shareCount += 1;
                  await createShare({
                    variables: {
                      body: {
                        fileId: item?.id,
                        toAccount: chipData[i],
                        isPublic: isGlobals,
                        permission: statusShare,
                      },
                    },
                  });
                }
              }
              if (shareCount === chipData.length) {
                eventUploadTrigger.trigger();
              }
            }
          });
          successMessage("Share file successful", 3000);
          await handleClearChipData();
          await onClose();
        } else {
          onClose();
        }
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  };

  // status share
  const handleStatus = async (data) => {
    setStatusShare(data);
    setIsAutoClose(true);
  };

  const handleClearChipData = () => {
    setChipData([]);
  };

  return (
    <Dialog open={open} onClose={onClose} keepMounted fullWidth={true}>
      <Box
        sx={{
          [theme.breakpoints.up("sm")]: {
            minWidth: "450px",
          },
        }}
      >
        <Fragment>
          <DialogContent sx={{ pb: 0 }}>
            <MUI.FlexBetween
              sx={{
                mt: 4,
              }}
            >
              <BoxTitle>
                <Typography
                  variant="h6"
                  fontSize={isMobile ? "0.8rem" : "1.3rem"}
                >
                  Share all items selected
                </Typography>
              </BoxTitle>
            </MUI.FlexBetween>
          </DialogContent>

          <DialogContent sx={{ pt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                mb: isMobile ? "1px" : "4px",
              }}
              fontSize={isMobile ? "0.8rem" : "1rem"}
            >
              Send the document via email
            </Typography>
            <TextInputdShare>
              <MuiChipsInput
                value={chipData}
                placeholder="Add user and Group"
                fullWidth
                onChange={handleChange}
                validate={isValidEmail}
              />

              {chipData.length > 0 && (
                <ActionCreateShare
                  accessStatusShare={"private"}
                  statusshare={statusShare}
                  handleStatus={handleStatus}
                />
              )}
            </TextInputdShare>

            <ActionContainer>
              <Button
                sx={{
                  borderRadius: "6px",
                  padding: "8px 25px",
                }}
                type="button"
                variant="contained"
                color="greyTheme"
                onClick={() => onClose()}
              >
                Done
              </Button>
              <Button
                sx={{
                  borderRadius: "6px",
                  padding: "8px 25px",
                }}
                type="button"
                variant="contained"
                color="primaryTheme"
                onClick={handleShareStatus}
              >
                Send
              </Button>
            </ActionContainer>
          </DialogContent>
        </Fragment>
      </Box>
    </Dialog>
  );
};

export default DialogCreateMultipleShare;
