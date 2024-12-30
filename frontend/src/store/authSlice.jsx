import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
};

const storedUser = localStorage.getItem("authUser");
if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    initialState.isAuthenticated = true;
    initialState.user = parsedUser;
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthState(state, action) {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user;
        },
        login(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload;
            localStorage.setItem("authUser", JSON.stringify(action.payload));
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            localStorage.removeItem("authUser");
        },
    },
});

export const { setAuthState, login, logout } = authSlice.actions;
export default authSlice.reducer;