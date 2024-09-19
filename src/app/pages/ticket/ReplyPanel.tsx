import IconReply from "@mui/icons-material/Reply";
import { Box, IconButton, Typography } from "@mui/material";
import heEntry from "he";
import { useEffect, useRef } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useDispatch } from "react-redux";
import { setChatMessage } from "stores/features/chatSlice";
import { getTimeLineChat } from "utils/date.util";
import { getFileType } from "utils/file.util";
import * as MUI from "./styles/chat.style";
import useManageFile from "hooks/file/useManageFile";
import useAuth from "hooks/useAuth";

function ReplyPanel(props) {
  const { chat, ticketStatus } = props;
  const { user }: any = useAuth();
  const manageFile = useManageFile({ user });

  const dispatch = useDispatch();
  const messagesEndRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo(0, 0);
  };

  const handleReply = (chat) => {
    dispatch(setChatMessage(chat));
  };

  async function onDownloadFile(_, file) {
    try {
      const multipleData: any = [
        {
          id: file?._id,
          checkType: "file",
          newPath: "chat-message",
          newFilename: file.newNameImage,
          createdBy: { _id: user?._id, newName: user?.newName },
        },
      ];

      manageFile.handleMultipleDownloadFileAndFolder(
        { multipleData, isShare: false },
        { onSuccess: () => {}, onFailed: () => {} },
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  return (
    <Box className="chat-panel" ref={messagesEndRef}>
      {chat?.createdByStaff?._id ? (
        <MUI.ChatListContainer className="chat-user">
          <MUI.ChatBoxListContainer>
            <MUI.ChatBoxContainer>
              <MUI.ChatBoxCardContainer className="box-card-user">
                <MUI.ChatBoxCard className="user">
                  {/* message reply */}
                  {chat?.replyMessage?._id ? (
                    <Box className="reply-box user">
                      <Typography component="p">You</Typography>
                      <Box>
                        <Typography component="span">
                          {heEntry.decode(
                            chat?.replyMessage?.message || "No message",
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}

                  <Typography component="span">
                    {heEntry.decode(chat.message)}
                  </Typography>
                  <Box className="timeDate user">
                    <Typography component="small">
                      {getTimeLineChat(chat.createdAt)}
                    </Typography>
                  </Box>
                </MUI.ChatBoxCard>
                {ticketStatus !== "close" && (
                  <IconButton
                    color="primary"
                    aria-label="reply-message"
                    sx={{ marginLeft: "0.38rem", padding: "7px" }}
                    onClick={() => handleReply(chat)}
                  >
                    <IconReply sx={{ fontSize: "1.4rem" }} />
                  </IconButton>
                )}
              </MUI.ChatBoxCardContainer>
            </MUI.ChatBoxContainer>

            {/* Chat Files */}
            <MUI.ChatBoxFileListContainer>
              {chat?.image?.length
                ? chat?.image?.map((file, index) => {
                    return file?.image ? (
                      <MUI.ChatBoxFileItem
                        className="user"
                        key={index}
                        sx={{ mt: 1.3 }}
                        onClick={() => onDownloadFile(chat, file)}
                      >
                        <Box className="icon-file">
                          <Box
                            sx={{
                              width: "20px",
                              mr: 3,
                            }}
                          >
                            <FileIcon
                              color="white"
                              extension={getFileType(file?.image)}
                              {...{
                                ...defaultStyles[
                                  getFileType(file?.image) as string
                                ],
                              }}
                            />
                          </Box>
                          <Typography component="span">{file.image}</Typography>
                        </Box>
                      </MUI.ChatBoxFileItem>
                    ) : null;
                  })
                : null}
            </MUI.ChatBoxFileListContainer>
          </MUI.ChatBoxListContainer>
        </MUI.ChatListContainer>
      ) : (
        <MUI.ChatListContainer className="chat-owner">
          <MUI.ChatBoxListContainer>
            <MUI.ChatBoxContainer>
              <MUI.ChatBoxCardContainer>
                <MUI.ChatBoxCard className="owner">
                  {chat?.replyMessage?._id ? (
                    <Box className="reply-box">
                      <Typography component="p">Admin</Typography>
                      <Box>
                        <Typography component="span">
                          {heEntry.decode(
                            chat?.replyMessage?.message || "No message",
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}
                  <Typography component="span">
                    {heEntry.decode(chat.message)}
                  </Typography>
                  <Box className="timeDate owner">
                    <Typography component="small">
                      {getTimeLineChat(chat.createdAt)}
                    </Typography>
                  </Box>
                </MUI.ChatBoxCard>
              </MUI.ChatBoxCardContainer>
            </MUI.ChatBoxContainer>

            {/* Chat Files */}
            <MUI.ChatBoxFileListContainer>
              {chat?.image.length
                ? chat?.image?.map((file, index) => {
                    return file?.image ? (
                      <MUI.ChatBoxFileItem
                        className="user"
                        key={index}
                        sx={{ mt: 1.3 }}
                        onClick={() => onDownloadFile(chat, file)}
                      >
                        <Box className="icon-file">
                          <Box
                            sx={{
                              width: "20px",
                              mr: 3,
                            }}
                          >
                            <FileIcon
                              color="white"
                              extension={getFileType(file?.image)}
                              {...{
                                ...defaultStyles[
                                  getFileType(file?.image) as string
                                ],
                              }}
                            />
                          </Box>
                          <Typography component="span">
                            {file?.image}
                          </Typography>
                        </Box>
                      </MUI.ChatBoxFileItem>
                    ) : null;
                  })
                : null}
            </MUI.ChatBoxFileListContainer>
          </MUI.ChatBoxListContainer>
        </MUI.ChatListContainer>
      )}
    </Box>
  );
}

export default ReplyPanel;
