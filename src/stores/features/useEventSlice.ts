// eventSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IStateTypes {
  isOpenMenu: boolean;
  isSelected: boolean;
  isOnClicked: boolean;
  isFolderSelected: boolean;
  isToggleMenu: {
    isToggle: boolean;
    isStatus: string | null;
  };
}

const initialState: IStateTypes = {
  isOpenMenu: false,
  isSelected: false,
  isOnClicked: false,
  isFolderSelected: false,
  isToggleMenu: {
    isToggle: false,
    isStatus: "preview",
  },
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      state.isOpenMenu = action.payload;
    },
    toggleSelected: (state, action: PayloadAction<boolean>) => {
      state.isSelected = action.payload;
    },

    setOnClicked: (state, action: PayloadAction<boolean>) => {
      state.isOnClicked = action.payload;
    },
    toggleFolderSelected: (state, action: PayloadAction<boolean>) => {
      state.isFolderSelected = action.payload;
    },
    setMenuToggle: (state, action: PayloadAction<{ isStatus: string }>) => {
      const { isStatus } = action.payload;
      state.isToggleMenu.isStatus = isStatus;
      if (action.payload.isStatus == "preview") {
        state.isToggleMenu.isToggle = false;
      } else {
        state.isToggleMenu.isToggle = true;
      }
    },
  },
});

export const {
  toggleMenu,
  toggleSelected,
  setOnClicked,
  setMenuToggle,
  toggleFolderSelected,
} = eventSlice.actions;

export default eventSlice.reducer;
