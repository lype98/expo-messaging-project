import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    uid: '',
    email: '',
    username: '',
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
