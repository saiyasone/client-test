import { useMutation } from "@apollo/client";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

// component
import useAuth from "../../../hooks/useAuth";
import * as MUI from "./styles/feedback.style";

// material ui
import { useTheme } from "@emotion/react";
import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Rating from "@mui/material/Rating";
import { Editor } from "@tinymce/tinymce-react";
import { MUTATION_CREATE_FEEDBACK } from "api/graphql/support.graphql";
import RatingV1 from "components/Rating";
import { ENV_KEYS } from "constants/env.constant";
import { errorMessage, successMessage, warningMessage } from "utils/alert.util";

const RateData = [
  {
    id: 0,
    question:
      "Q1: How do you rate your experience with performance our website?",
  },
  {
    id: 1,
    question: "Q2: How do you rate your experience with design in our website?",
  },
  {
    id: 2,
    question: "Q3: How do you rate your experience with service our website?",
  },
];

function Feedback() {
  const { user }: any = useAuth();
  const navigate = useNavigate();
  const theme: any = useTheme();
  const [isChecked, setIsChecked] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [designRating, setDesignRating] = React.useState(0);
  const [designComment, setDesignComment] = React.useState("");
  const [performanceRating, setPerformanceRating] = React.useState(0);
  const [performanceComment, setPerformanceComment] = React.useState("");
  const [serviceRating, setServiceRating] = React.useState(0);
  const [serviceComment, setServiceComment] = React.useState("");

  const editorRef = useRef<any>(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  const [feedbackCreation] = useMutation(MUTATION_CREATE_FEEDBACK);

  const initialStates = () => {
    setIsChecked(false);
    setRating(0);
    setDesignComment("");
    setDesignRating(0);
    setPerformanceComment("");
    setPerformanceRating(0);
    setServiceComment("");
    setServiceRating(0);
  };

  const handleGobackToPrevious = () => {
    navigate(-1);
  };

  const handleGetRating = (value, index) => {
    switch (index) {
      case 0:
        setPerformanceRating(value);
        break;
      case 1:
        setDesignRating(value);
        break;
      case 2:
        setServiceRating(value);
        break;
      default:
        break;
    }
  };

  const handleGetComment = (value, index) => {
    switch (index) {
      case 0:
        setPerformanceComment(value);
        break;
      case 1:
        setDesignComment(value);
        break;
      case 2:
        setServiceComment(value);
        break;
      default:
        break;
    }
  };

  const handleSubmitFeedback = async () => {
    if (!isChecked) {
      warningMessage("Please accepted our conditions!!", 2000);
    } else {
      try {
        const createFeedback = await feedbackCreation({
          variables: {
            input: {
              email: user?.email,
              firstName: user?.firstName,
              lastName: user?.lastName,
              comment: editorRef.current.getContent(),
              rating: rating.toString(),
              designComment: designComment,
              designRating: designRating.toString(),
              performanceComment: performanceComment,
              performanceRating: performanceRating.toString(),
              serviceComment: serviceComment,
              serviceRating: serviceRating.toString(),
              source: "Feedback",
              score: 100,
              isAnonymous: 0,
            },
          },
        });
        if (createFeedback?.data?.createFeedback?._id) {
          initialStates();
          successMessage("Submit success! Thank you so much!", 3000);
        }
      } catch (err) {
        errorMessage("Something went wrong!", 2000);
      }
    }
  };

  return (
    <React.Fragment>
      <MUI.FeedbackContainer>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ margin: "1rem 0", padding: isMobile ? "0 0.5rem" : "0" }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#A5A3AE", cursor: "pointer" }}
            onClick={handleGobackToPrevious}
          >
            Previous
          </Typography>
          <Typography variant="h4" sx={{ color: "#5D596C", cursor: "pointer" }}>
            Feedback
          </Typography>
        </Breadcrumbs>
        <Card
          sx={{
            margin: "0.5rem 0",
            padding: isMobile ? "0.5rem" : "0.5rem 1.5rem",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              margin: "1.5rem 0",
              color: "#5D596C",
              fontSize: "1.5rem",
              fontWeight: 600,
              [theme.breakpoints.down("sm")]: {
                fontSize: "1rem",
                fontWeight: 500,
              },
            }}
          >
            <Typography>
              How do you rate your experience with Vshare?
            </Typography>
            <br />
            <Rating
              name="half-rating"
              defaultValue={0}
              precision={0.5}
              sx={{ color: "#17766B", fontSize: "35px" }}
              value={rating}
              onChange={(e: any) => setRating(e.target.value)}
            />
          </Box>
          <MUI.NotificationDiv>
            <Typography>Submit your feedback & get up to 50 points</Typography>
          </MUI.NotificationDiv>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Editor
                apiKey={ENV_KEYS.VITE_APP_TINYMCE}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                init={{
                  height: isMobile ? 200 : 300,
                  menubar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "autoresize",
                  ],
                  toolbar:
                    "insertfile undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent image",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  image_uploadtab: true,
                  file_picker_callback: function (callback) {
                    const input: any = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = function () {
                      if (input.files.length > 0) {
                        const file = input.files[0];
                        const reader: any = new FileReader();
                        reader.onload = function () {
                          callback(reader.result, { title: file.name });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  },
                }}
              />
            </Grid>
          </Grid>
          <Box sx={{ margin: "2rem 0" }}>
            {RateData?.map((val, index) => (
              <RatingV1
                handleGetRating={(data) => handleGetRating(data, index)}
                handleGetComment={(data) => handleGetComment(data, index)}
                question={val?.question}
                key={index}
              />
            ))}
          </Box>
          <MUI.AgreeDiv>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                }
                sx={{ color: "#6F6B7D" }}
                label="I am happy to share my email for future communication related to my feedback"
              />
            </FormGroup>
          </MUI.AgreeDiv>
          <MUI.ActionDiv>
            <Button variant="contained" onClick={handleSubmitFeedback}>
              Submit feedback
            </Button>
            <Button
              variant="contained"
              sx={{
                background: "#F6F6F7",
                color: "#C6C8CA",
                marginLeft: "2rem",
                "&:hover": {
                  background: "#F6F6F7",
                  color: "#C6C8CA",
                },
              }}
              onClick={handleGobackToPrevious}
            >
              Cancel
            </Button>
          </MUI.ActionDiv>
        </Card>
      </MUI.FeedbackContainer>
    </React.Fragment>
  );
}

export default Feedback;
