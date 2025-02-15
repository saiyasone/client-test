import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_RECENT_FILE } from "api/graphql/file.graphql";
import { MUTATION_UPDATE_FOLDER } from "api/graphql/folder.graphql";
import { useState } from "react";
import { errorMessage } from "utils/alert.util";

const useGetUrlDownload = (data) => {
  const [updateFile] = useMutation(MUTATION_UPDATE_RECENT_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);

  async function copyTextToClipboard(text) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  const [_copied, setCoppied] = useState(false);
  if (data) {
    const handleGetFolderURL = async (data) => {
      const dataType =
        data?.folder_type || data?.type || data?.folderId?._id
          ? "folder"
          : "file";

      const ownerData = data?.createdBy?._id || data?.ownerId?._id;
      const dataUrl = {
        _id: data?._id,
        type: dataType,
      };

      try {
        await copyTextToClipboard(data?.shortUrl)
          .then(() => {
            setCoppied(true);
            setTimeout(async () => {
              if (dataUrl.type === "folder") {
                const result = await updateFolder({
                  variables: {
                    where: {
                      _id: dataUrl._id,
                    },
                    data: {
                      getLinkBy: parseInt(ownerData),
                    },
                  },
                });
                if (result.data?.updateFolders?._id) {
                  setCoppied(false);
                  window.open(data?.shortUrl, "_blank");
                }
              } else {
                const result = await updateFile({
                  variables: {
                    where: {
                      _id: dataUrl._id,
                    },
                    data: {
                      getLinkBy: parseInt(ownerData),
                    },
                  },
                });
                setCoppied(false);
                if (result.data?.updateFiles?._id) {
                  window.open(
                    data?.shortUrl || data?.fileId?.shortUrl,
                    "_blank",
                  );
                }
              }
            }, 100);
          })
          .catch((error) => {
            errorMessage(error, 3000);
          });
      } catch (error: any) {
        errorMessage(error, 3000);
      }
    };

    return handleGetFolderURL;
  }
};

export default useGetUrlDownload;
