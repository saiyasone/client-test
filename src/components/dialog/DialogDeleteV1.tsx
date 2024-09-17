//mui component and style
import { Box, Typography } from "@mui/material";
import { styled as muiStyled } from "@mui/system";
import BaseDialogV1 from "components/BaseDialogV1";
import NormalButton from "components/NormalButton";
import { useTranslation } from "react-i18next";

const FileDeleteDialogBoby = muiStyled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  rowGap: theme.spacing(7),
}));

const DialogDeleteV1 = (props) => {
  const { t } = useTranslation();

  return (
    <BaseDialogV1
      {...props}
      dialogProps={{
        PaperProps: {
          sx: {
            overflowY: "initial",
            maxWidth: "500px",
          },
        },
        sx: {
          columnGap: "20px",
        },
      }}
      dialogContentProps={{
        sx: {
          backgroundColor: "white !important",
          borderRadius: "6px",
          padding: (theme) => `${theme.spacing(5)}`,
        },
      }}
    >
      <FileDeleteDialogBoby>
        <Typography
          variant="h4"
          sx={{
            width: "100%",
            display: "flex",
            fontWeight: "bold",
            color: (theme) => theme.palette.primaryTheme!.brown(),
          }}
        >
          {props?.title || t("_delete_title")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: (theme) => theme.spacing(4),
          }}
        >
          {props.label}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            columnGap: (theme) => theme.spacing(3),
          }}
        >
          <Box
            sx={{
              display: "flex",
              columnGap: (theme) => theme.spacing(3),
            }}
          >
            <NormalButton
              onClick={() => props.onClose()}
              sx={{
                padding: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
                borderRadius: (theme) => theme.spacing(1),
                backgroundColor: "rgba(0,0,0,0.1)",
                color: "rgba(0,0,0,0.5)",
              }}
            >
              {t("_cancel_button")}
            </NormalButton>
            <NormalButton
              sx={{
                padding: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
                borderRadius: (theme) => theme.spacing(1),
                backgroundColor: (theme) => theme.palette.primaryTheme!.main,
                color: "white !important",
              }}
              onClick={() => {
                props?.onConfirm();
                props?.onClose();
              }}
            >
              {t("_delete_button")}
            </NormalButton>
          </Box>
        </Box>
      </FileDeleteDialogBoby>
    </BaseDialogV1>
  );
};

export default DialogDeleteV1;
