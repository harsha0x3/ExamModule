import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token") || null;
const initialState = { token, user: null };
const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("token", action.payload);
      else localStorage.removeItem("token");
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    // Add logout reducer
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setToken, setUser, logout } = slice.actions;
export default slice.reducer;
