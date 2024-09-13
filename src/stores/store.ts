// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import chatMessageReducer from "./features/chatSlice";
import checkBoxFolderAndFileReducer from "./features/checkBoxFolderAndFileSlice";
import paymentReducer from "./features/paymentSlice";
import textEditorReducer from "./features/textEditorSlice";
import eventReducer from "./features/useEventSlice";
const store = configureStore({
  reducer: {
    payment: paymentReducer,
    checkboxFileAndFolder: checkBoxFolderAndFileReducer,
    chatMessasge: chatMessageReducer,
    textEditor: textEditorReducer,
    event: eventReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
