import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as checkboxAction from "stores/features/checkBoxFolderAndFileSlice";
import "styles/dataGrid.style.css";

//components
const FileDataGridContainer = styled("div")({
  width: "100%",
  height: "100%",
  ".MuiDataGrid-root": {
    /* backgroundColor: "white", */
    border: "none",
    /* borderBottom: "1px solid #A19EAA", */
    borderRadius: 0,
    ".MuiDataGrid-virtualScroller": {
      overflowX: "hidden",
    },
    ".MuiDataGrid-columnHeaders": {
      fontSize: "1rem",
    },
    ".MuiDataGrid-columnHeaders, .MuiDataGrid-cell": {
      /* borderBottom: "1px solid #A19EAA", */
    },
  },
});

export default function FileDataGrid({ dataGrid, ...props }) {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState<any>(null);
  const dataSelector = useSelector(
    checkboxAction.checkboxFileAndFolderSelector,
  );

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r) => {
      return r.id === id;
    });

    props?.setHover(row);
  };

  const handlePopperClose = () => {
    if (open == null) {
      return;
    }
    props?.setHover("");
  };

  function getRowClassName(params: any) {
    const { _id } = params?.row || {};

    if (
      dataSelector?.selectionFileAndFolderData?.find((el) => el?.id === _id) &&
      true
    ) {
      return "custom-row-class";
    }

    return "";
  }

  useEffect(() => {
    if (props.data?.length > 0) {
      // setData((_) =>
      setData(() =>
        props.data.map((data, index) => ({
          noId: index,
          ...data,
        })),
      );
      setIsLoaded(true);
    }
  }, [props.data]);


  return (
    <FileDataGridContainer>
      <Box sx={{ height: "100%", width: "100%" }}>
        {isLoaded && (
          <DataGrid
            autoHeight
            disableSelectionOnClick={true}
            getRowClassName={getRowClassName}
            onCellDoubleClick={props?.hanleOpenFile}
            componentsProps={{
              row: {
                onMouseEnter: handlePopperOpen,
                onMouseLeave: handlePopperClose,
              },
            }}
            {...{
              ...dataGrid,
              sx: {
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                " .css-cemoa4-MuiButtonBase-root-MuiCheckbox-root": {
                  color: "rgba(0, 0, 0, 0.3)",
                },
                ...dataGrid.sx,
              },

              rows: data,
              getRowId: (row) => row._id,
            }}
            sx={{
              height: "100% !important",
              borderRadius: 0,
              "& .MuiDataGrid-columnSeparator": { display: "none" },
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "scroll",
              },
            }}
          />
        )}
      </Box>
    </FileDataGridContainer>
  );
}
