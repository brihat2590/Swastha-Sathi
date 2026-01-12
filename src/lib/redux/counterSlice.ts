import { createSlice,PayloadAction } from "@reduxjs/toolkit";


interface CounterState{
    value:number
}
const initialState:CounterState={
    value:0,
}
export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
      increment: (state) => {
        // Redux Toolkit allows writing "mutating" logic. It uses Immer
        // to produce new, immutable state from it.
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
      // Use PayloadAction to type the action's payload
      incrementByAmount: (state, action: PayloadAction<number>) => {
        state.value += action.payload;
      },
    },
  });
  
  export const { increment, decrement, incrementByAmount } = counterSlice.actions;
  export default counterSlice.reducer;