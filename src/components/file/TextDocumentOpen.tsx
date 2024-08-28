import { Box } from "@mui/material";

interface TextDocumentOpenProps {
  src: string;
}
export default function TextDocumentOpen({ src }: TextDocumentOpenProps) {
  return (
    <>
      <Box sx={{ backgroundColor: "white" }}>
        <iframe src={src} style={{ backgroundColor: "white", width: "60vw" }} />
      </Box>
    </>
  );
}
