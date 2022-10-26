import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    currentRoomID: null,
    currentRoomType: null,
    currentRoomUsers: null,
    refreshing: false,
  },
  reducers: {
    enterRoom(state, action) {
      state.currentRoomID = action.payload.roomID;
      state.currentRoomType = action.payload.chatType;
      state.currentRoomUsers = action.payload.users;
    },
    refresh(state) {
      state.refreshing = !state.refreshing;
    },
  },
});

export const chatActions = chatSlice.actions;

export default chatSlice;
