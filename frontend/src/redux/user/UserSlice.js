import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    loginTime: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
            state.loginTime = Date.now();
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.token = null;
            state.loading = false;
            state.error = null;
        },
        logout: () => initialState,
        resetUser: () => initialState,
    },
});

export const { loginStart, loginSuccess, loginFailure, logoutSuccess, logout, resetUser } = userSlice.actions;

export default userSlice.reducer;
