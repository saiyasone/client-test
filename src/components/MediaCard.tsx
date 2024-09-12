import { Fragment } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

// components
import useAuth from "hooks/useAuth";
import { Base64 } from "js-base64";
import { useNavigate } from "react-router-dom";
import * as MUI from "styles/component.style";
import { convertBytetoMBandGB } from "utils/storage.util";
import cardNumber from "./slider/cardNumber";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(0),
  textAlign: "left",
  color: theme.palette.text.secondary,
  boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
}));

const FileTypeTitle: any = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  fontSize: "1.1rem",
  marginTop: "5px",
}));

interface IFilesCategoryTypes {
  fileCategory: any;
  countLoading: boolean;
}
function MediaCard({ fileCategory, countLoading }: IFilesCategoryTypes) {
  const navigate = useNavigate();
  const { user }: any = useAuth();
  const handleClick = (val: string) => {
    const status = Base64.encode("active", true);
    const value = Base64.encode(val, true);
    const userId = Base64.encode(user?._id, true);

    navigate(`/file/${userId}/${value}/${status}`);
    if (!val) {
      navigate(`/myfile/file/${userId}/${value}/${status}`);
    }
  };

  return (
    <Box>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {cardNumber.map((card, index) => (
          <Fragment key={index}>
            <Grid item md={2} xs={6} sm={6}>
              <Item>
                <Card>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <MUI.MyclouldIcon>{card.icon}</MUI.MyclouldIcon>
                      <FileTypeTitle component="h4" sx={{ mb: 3 }}>
                        {card.title}
                      </FileTypeTitle>
                      <Typography component="p" style={{ fontSize: "1rem" }}>
                        {card.type === "audio"
                          ? countLoading
                            ? "Loading.."
                            : convertBytetoMBandGB(
                                fileCategory.audioFileData.totalSize,
                              )
                          : ""}
                        {card.type === "video"
                          ? countLoading
                            ? "Loading.."
                            : convertBytetoMBandGB(
                                fileCategory.videoFileData.totalSize,
                              )
                          : ""}
                        {card.type === "image"
                          ? countLoading
                            ? "Loading.."
                            : convertBytetoMBandGB(
                                fileCategory.imageFileData.totalSize,
                              )
                          : ""}
                        {card.type === "application"
                          ? countLoading
                            ? "Loading.."
                            : convertBytetoMBandGB(
                                fileCategory.documentFileData.totalSize,
                              )
                          : ""}
                        {card.type === "other"
                          ? countLoading
                            ? "Loading.."
                            : convertBytetoMBandGB(
                                fileCategory.otherFileData.totalSize,
                              )
                          : ""}
                        {card.type === "text"
                          ? countLoading
                            ? "Loading.."
                            : convertBytetoMBandGB(
                                fileCategory.textFileData.totalSize,
                              )
                          : ""}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: -3,
                    }}
                  >
                    <Button onClick={() => handleClick(card.type)}>
                      View All
                    </Button>
                  </CardActions>
                </Card>
              </Item>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </Box>
  );
}

export default MediaCard;
