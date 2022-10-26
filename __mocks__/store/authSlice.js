import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    uid: 'gR9pqEb0bpehle4GHbEEUWiu5U43',
    email: 'a@a.com',
    username: 'A boy!',
  },
  reducers: {
    login(state, action) {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.username = action.payload.username;
    },
    logOut(state) {
      for (let key in state) {
        state[key] = '';
      }
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice;
