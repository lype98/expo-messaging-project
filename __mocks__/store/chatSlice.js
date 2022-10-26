import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    currentRoomID: '9hr8DpuV2YOcv73D89Hc',
    currentRoomType: 'Group',
    currentRoomUsers: [
      {
        id: 'gR9pqEb0bpehle4GHbEEUWiu5U43',
        displayName: 'A boy!',
      },
      {
        id: 'IZ7rvcBzKbOqyuaopfWmDi1y6Bv2',
        displayName: 'BBoi',
      },
      {
        id: 'kBp1Bvh2jIdPpnO8TfSiV59ZqtB2',
        displayName: 'C señor',
      },
    ],
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
