import { Box, styled } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { ENV_KEYS } from "constants/env.constant";
import { useDispatch } from "react-redux";
import { setDesc } from "stores/features/textEditorSlice";
const InputTextFieldLabel = styled(Box)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  marginBottom: "2px",
}));
const TextEditorInput = (props) => {
  const dispatch = useDispatch();
  return (
    <Box
      sx={{
        "& .tox-statusbar__branding": {
          display: "none",
        },
        "&.tox-statusbar__branding svg": {
          display: "none",
        },
      }}
    >
      <InputTextFieldLabel>{props?.label}</InputTextFieldLabel>
      <Editor
        apiKey={ENV_KEYS.VITE_APP_TINYMCE}
        initialValue={props?.value}
        onChange={(_evt, editor) => {
          dispatch(setDesc(editor.getContent()));
        }}
        init={{
          height: 200,
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
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px,}",
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
    </Box>
  );
};
export default TextEditorInput;
