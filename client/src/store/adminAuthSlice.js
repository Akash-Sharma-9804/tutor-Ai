import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("adminToken") || null,
  admin: JSON.parse(localStorage.getItem("admin")) || null,
  isAuthenticated: !!localStorage.getItem("adminToken"),
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    adminLoginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.isAuthenticated = true;

      localStorage.setItem("adminToken", action.payload.token);
      localStorage.setItem("admin", JSON.stringify(action.payload.admin));
    },

    adminLogout: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;

      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
    },
  },
});

export const { adminLoginSuccess, adminLogout } =
  adminAuthSlice.actions;

export default adminAuthSlice.reducer;
