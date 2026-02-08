// store.jsx
import { configureStore } from '@reduxjs/toolkit';
// ../ 代表跳出 component 資料夾回到 src 找 toastSlice.js

// 因為在同一層，所以把 .. 改成 .
import { toastReducer } from './toastSlice/toastSlice';

export const store = configureStore({
    reducer: {
        toast: toastReducer, 
    },
});