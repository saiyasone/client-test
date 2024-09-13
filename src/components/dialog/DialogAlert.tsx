import { Button, useMediaQuery } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const DialogAlert = (props) => {
  const isMatches = useMediaQuery("(min-width:600px)");
  const { open, onClose, onClick, title, message } = props;
  const handleClose = () => {
    onClose(false);
  };

  return (
    <Dialog
      sx={{
        backdropFilter: "blur(1px) sepia(5%)",
        "& .MuiDialog-paper": {
          borderRadius: "6px",
          minWidth: "20%",
        },
      }}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle
        component={isMatches ? "h4" : "body"}
        sx={{ mt: 2 }}
        id="alert-dialog-title"
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ mb: 2, mr: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          color="greyTheme"
          sx={{ mr: 2, borderRadius: "6px" }}
        >
          No
        </Button>
        <Button
          onClick={onClick}
          autoFocus
          variant="contained"
          color="primaryTheme"
          sx={{ borderRadius: "6px" }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAlert;
