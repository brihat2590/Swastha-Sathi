import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

// 1. Function to create the store
export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      // Add other reducers here
    },
  });
};

// 2. Infer types from the store
export type AppStore = ReturnType<typeof makeStore>;
// 3. Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];