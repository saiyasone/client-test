import { createSlice } from "@reduxjs/toolkit";
import { ISelectMultipleType } from "types/selectMultipleType";

type Module = {
  checkboxFileAndFolder: CheckboxState;
};
type CheckboxState = {
  isLoading: boolean;
  getLinkLoading: boolean;
  selectionFileAndFolderData: ISelectMultipleType[];
  selectionDataPasswords: any[];
};
const initialState: CheckboxState = {
  isLoading: false,
  getLinkLoading: false,
  selectionFileAndFolderData: [],
  selectionDataPasswords: [],
};

const checkboxFileAndFolderSlice = createSlice({
  name: "checkboxFileAndFolder",
  initialState,
  reducers: {
    setFileAndFolderData: (state, action) => {
      const { data } = action.payload;
      const index = state.selectionFileAndFolderData.findIndex(
        (item: any) =>
          item?.id === data?.id && item.checkType === data?.checkType,
      );
      if (index !== -1) {
        const updateValue = state.selectionFileAndFolderData.filter(
          (el: any) => el.id !== data.id,
        );
        state.selectionFileAndFolderData = updateValue;
      } else {
        state.selectionFileAndFolderData.push(data);
      }
    },

    setFileDataPassword: (state, action) => {
      state.selectionDataPasswords = action.payload;
    },

    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setIsGetLinkLoading: (state, action) => {
      state.getLinkLoading = action.payload;
    },

    setRemoveDataPassword: (state) => {
      state.selectionDataPasswords = [];
    },

    setRemoveFileAndFolderData: (state) => {
      state.selectionFileAndFolderData = [];
    },
  },
});

export const {
  setIsLoading,
  setIsGetLinkLoading,
  setFileAndFolderData,
  setFileDataPassword,
  setRemoveFileAndFolderData,
  setRemoveDataPassword,
} = checkboxFileAndFolderSlice.actions;

export const checkboxFileAndFolderSelector = (state: Module) =>
  state.checkboxFileAndFolder;

export default checkboxFileAndFolderSlice.reducer;
