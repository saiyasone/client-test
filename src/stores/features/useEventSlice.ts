// eventSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IStateTypes {
  isOpenMenu: boolean;
  isSelected: boolean;
  isOnClicked: boolean;
}

const initialState: IStateTypes = {
  isOpenMenu: false,
  isSelected: false,
  isOnClicked: false,
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
  },
});

export const { toggleMenu, toggleSelected, setOnClicked } = eventSlice.actions;

export default eventSlice.reducer;
