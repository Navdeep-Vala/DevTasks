import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/User";

// Define the shape of our auth state
interface AuthState {
    user : User | null; // Currently logged-in user
    isAuthenticated: boolean; // Authentication status
    loading: boolean; // Loading state for async actions
    error: string | null; // Error message if any
}

// Initial state when app starts
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
}

// Create the auth slice
const authSlice = createSlice({
    name: "auth",
    initialState, 
    reducers:{
        // Action to start login process
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // Action when logic succeeds
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload; // Set the user data
            state.error = null;
        },
        
        // Action when login fails
        loginFailure: (state, action : PayloadAction<string>) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
        },

        // Action to logout user
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        }
    }
});

// Export actions for use in components
export const {loginStart, loginSuccess, loginFailure, logout} = authSlice.actions;

// export reducer to add to store
export default authSlice.reducer;