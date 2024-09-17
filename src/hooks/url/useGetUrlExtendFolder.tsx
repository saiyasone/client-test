import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_RECENT_FILE } from "api/graphql/file.graphql";
import { MUTATION_UPDATE_FOLDER } from "api/graphql/folder.graphql";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { useState } from "react";
import { errorMessage, successMessage } from "utils/alert.util";

const useGetUrlExtendFolder = (data) => {
  const manageGraphqlError = useManageGraphqlError();
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
      const dataType = data?.folder_type || "file";
      const ownerData = data?.createdBy?._id;
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
                  successMessage("Link is copied!", 2000);
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
                if (result.data?.updateFiles?._id) {
                  setCoppied(false);
                  successMessage("Link is copied!", 2000);
                }
              }
            }, 500);
          })
          .catch((err: any) => {
            const cutErr = err.message.replace(/(ApolloError: )?Error: /, "");
            errorMessage(
              manageGraphqlError.handleErrorMessage(
                cutErr || "Something went wrong, Please try again",
              ) as string,
              2000,
            );
          });
      } catch (error) {
        console.error(error);
      }
    };

    return handleGetFolderURL;
  }
};

export default useGetUrlExtendFolder;
