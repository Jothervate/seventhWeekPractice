import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
    name: 'toast',

    initialState: {
        message: '',
        status: '', // 用來決定顏色，例如 'success' 或 'danger'
        visible: false,
    },

    reducers: {
        // 顯示通知
        pushMessage: (state, action) => {
        const { message, status } = action.payload;
        state.message = message;
        state.status = status;
        state.visible = true;
        },
        // 隱藏通知
        removeMessage: (state) => {
            state.visible = false;
        },
    },

});

// 使用解構方式導出 Action，這樣你在元件裡可以用：dispatch(pushMessage(...))
export const { pushMessage, removeMessage } = toastSlice.actions;

// 預設導出 reducer，這是給 store.js 用的
export const toastReducer= toastSlice.reducer;