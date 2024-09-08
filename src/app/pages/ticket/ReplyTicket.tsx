import IconCloseMessage from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import he from "he";
import { CSSProperties, Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import * as MUI from "./styles/chat.style";
import { ReplyContainer, TicketContainer } from "./styles/createTicket.style";
import { HeaderLayout } from "./styles/ticket2.style";

import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_TICKET_TYPE } from "api/graphql/ticket.graphql";
import DialogCloseTicket from "components/dialog/DialogCloseTicket";
import { socketIO } from "helpers/socketio.helper";
import useManageChat from "hooks/chat/useManageChat";
import useManageReply from "hooks/chat/useManageReply";
import useManageTypeTicket from "hooks/ticket/useManageTypeTicket";
import { TbSlash } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import {
  chatMessageSelector,
  setChatMessageEMPTY,
  setFocus,
} from "stores/features/chatSlice";
import { errorMessage, successMessage } from "utils/alert.util";
import { getColorStatus } from "utils/style.util";
import BreadcrumbNavigate from "../../../components/BreadcrumbNavigate";
import ChatFormReply from "./ChatFormReply";
import InifinityChatScroll from "./InfinityChatScroll";
import ReplyClosed from "./ReplyClosed";
import ReplyPanel from "./ReplyPanel";

function ReplyTicket() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { paramId } = useParams();
  const { user }: any = useAuth();

  const dispatch = useDispatch();
  const [updateCloseTicket] = useMutation(MUTATION_UPDATE_TICKET_TYPE);

  const manageChat = useManageChat({
    typeTicketID: paramId,
  });

  const userCreate = useManageTypeTicket({
    typeID: paramId,
  }).data?.[0];

  const manageReply = useManageReply({
    pathID: paramId,
  });
  const chatSelector = useSelector(chatMessageSelector);

  const handleReloading = () => manageChat.customChatMessage();

  function handleOpen() {
    if (manageReply.dataStatus === "close") return;
    setIsOpen(true);
  }
  function handleCloseOpen() {
    setIsOpen(false);
  }
  function handleReloadTicket() {
    manageReply.customTicketTypes();
  }

  const handleScrollData = () => {
    if (manageChat.limit > manageChat.data?.length) return;

    manageChat.handleLimit(20);
  };

  const ChatScrollContainer = ({ messages }) => {
    const messageByDate = {};
    messages?.forEach((message) => {
      const date = new Date(message.updatedAt).toLocaleDateString();
      if (!messageByDate[date]) {
        messageByDate[date] = [];
      }

      messageByDate[date].push(message);
    });

    const chatContents: any[] = [];
    for (const data in messageByDate) {
      messageByDate[data].forEach((message) => {
        chatContents.push(
          <ReplyPanel
            key={message?._id}
            chat={message}
            ticketStatus={manageReply?.dataStatus}
          />,
        );
      });

      chatContents.push(<MUI.BoxHeaderDate key={data} date={data} />);
    }

    return (
      <Fragment>
        <InifinityChatScroll
          chatMessages={manageChat.data}
          hasMore={hasMore}
          onRefreshLimit={onLoadLimitData}
        >
          {chatContents}
        </InifinityChatScroll>
      </Fragment>
    );
  };

  function onLoadLimitData() {
    if (manageChat.data.length >= manageChat.total) {
      setHasMore(false);
      return;
    }

    setTimeout(() => {
      handleScrollData();
    }, 500);
  }

  async function submitCloseTicket() {
    try {
      const result = await updateCloseTicket({
        variables: {
          data: {
            status: "close",
          },
          where: {
            _id: paramId,
          },
        },
      });

      if (result?.data?.updateTypetickets?._id) {
        handleReloadTicket();
        successMessage("Ticket was closed successfully", 2000);
        handleCloseOpen();
      }
    } catch (error) {
      errorMessage("Something went wrong, please try again", 3000);
    }
  }

  const removeChatReply = () => {
    dispatch(setChatMessageEMPTY());
    dispatch(setFocus(false));
  };

  useEffect(() => {
    function getMessageServer() {
      const socket = socketIO();
      try {
        socket.emit("joinRoom", parseInt(user?._id));
        socket.on("newMessage", (data) => {
          if (!data) return;
          handleReloading();
        });
      } catch (error) {
        console.error(error);
      }

      return () => {
        socket.disconnect();
      };
    }
    getMessageServer();
  }, []);

  return (
    <Fragment>
      <ReplyContainer>
        <HeaderLayout>
          <BreadcrumbNavigate
            separatorIcon={<TbSlash />}
            disableDefault
            title="support-ticket"
            titlePath="/support-ticket"
            path={["support-ticket"]}
            readablePath={["Support Ticket", `Support Ticket #${paramId} `]}
          />

          <Chip
            label={
              manageReply?.dataStatus === "close"
                ? manageReply?.dataStatus + "d"
                : manageReply?.dataStatus || "New"
            }
            style={
              getColorStatus(manageReply?.dataStatus || "New") as CSSProperties
            }
          />
        </HeaderLayout>

        <TicketContainer>
          {manageReply?.dataStatus === "close" && (
            <Paper
              sx={{
                mt: (theme) => theme.spacing(3),
                boxShadow: (theme) => theme.baseShadow.secondary,
                flex: "1 1 0",
              }}
            >
              <ReplyClosed />
            </Paper>
          )}
          <MUI.ChatContainer>
            {/* ========= Header ========= */}
            <MUI.ChatHeader>
              <MUI.ChatHeaderWrapper>
                <MUI.ChatHeaderLeft>
                  <Box className="admin-logo">
                    <Typography variant="h4">V</Typography>
                  </Box>

                  <Box className="admin-info">
                    <Typography variant="h2">Admin</Typography>
                    <Typography component="span">Vshare admin</Typography>
                  </Box>
                </MUI.ChatHeaderLeft>
                {manageReply?.dataStatus !== "close" && (
                  <MUI.ChatHeaderRight>
                    <Button
                      size="small"
                      color="error"
                      variant="text"
                      sx={{ fontWeight: "bold" }}
                      onClick={handleOpen}
                    >
                      Close
                    </Button>
                  </MUI.ChatHeaderRight>
                )}
              </MUI.ChatHeaderWrapper>
            </MUI.ChatHeader>

            <MUI.ChatContentContainer>
              {/* ========= Chat message ========= */}
              {ChatScrollContainer({
                messages: manageChat.data,
              })}
              <MUI.ChatFooterContainer>
                <MUI.ChatMessageReply>
                  {chatSelector?.dataReply ? (
                    <MUI.ChatReplyBoxMessage>
                      <MUI.ChatReplyBoxMessageContainer>
                        <Box>
                          <Typography variant="h2">Admin</Typography>
                          <Typography variant="h4">
                            {he.decode(chatSelector.dataReply?.message)}
                          </Typography>
                        </Box>
                        <MUI.ChatReplyBoxMessageClose>
                          <IconButton
                            aria-label="icon-close"
                            onClick={removeChatReply}
                          >
                            <IconCloseMessage />
                          </IconButton>
                        </MUI.ChatReplyBoxMessageClose>
                      </MUI.ChatReplyBoxMessageContainer>
                    </MUI.ChatReplyBoxMessage>
                  ) : null}

                  {manageReply?.dataStatus !== "close" && (
                    <MUI.ChatMessageReplyForm>
                      <ChatFormReply
                        dataReply={userCreate}
                        isAdmin={false}
                        handleReloading={handleReloading}
                      />
                    </MUI.ChatMessageReplyForm>
                  )}
                </MUI.ChatMessageReply>
              </MUI.ChatFooterContainer>
            </MUI.ChatContentContainer>
          </MUI.ChatContainer>
        </TicketContainer>
      </ReplyContainer>

      <DialogCloseTicket
        isOpen={isOpen}
        onConfirm={submitCloseTicket}
        onClose={handleCloseOpen}
      />
    </Fragment>
  );
}

export default ReplyTicket;
