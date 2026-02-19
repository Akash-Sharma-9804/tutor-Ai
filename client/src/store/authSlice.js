import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  student: JSON.parse(localStorage.getItem("student")) || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.student = action.payload.student;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("student", JSON.stringify(action.payload.student));
    },

    logout: (state) => {
      state.token = null;
      state.student = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("student");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
