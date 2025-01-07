import { createSlice } from "@reduxjs/toolkit";

// Инициализация стейта, если есть данные в localStorage
const storedUser = localStorage.getItem("authUser");
const initialState = {
    isAuthenticated: storedUser ? true : false,
    user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthState(state, action) {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user;
            if (action.payload.isAuthenticated) {
                // Сохраняем данные пользователя в localStorage при успешной авторизации
                localStorage.setItem("authUser", JSON.stringify(action.payload.user));
            } else {
                // Удаляем данные пользователя из localStorage при логауте
                localStorage.removeItem("authUser");
            }
        },
        login(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload;
            // Сохраняем данные в localStorage
            localStorage.setItem("authUser", JSON.stringify(action.payload));
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            // Удаляем данные из localStorage
            localStorage.removeItem("authUser");
        },
    },
});

export const { setAuthState, login, logout } = authSlice.actions;
export default authSlice.reducer;