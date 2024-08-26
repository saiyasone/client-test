import InputLabel from "@mui/material/InputLabel";

const CustomInputLabel = ({ children, htmlFor }) => {
  return (
    <InputLabel
      shrink
      htmlFor={htmlFor}
      sx={{
        fontSize: "1.2rem",
        fontWeight: "500",
        color: "#5D596C",
        marginTop: "0.8rem",
      }}
    >
      {children}
    </InputLabel>
  );
};

export default CustomInputLabel;
