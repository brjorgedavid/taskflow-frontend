import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  total: 0,
  page: 0,
  loading: false,
  error: null,
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    fetchEmployeesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess(state, action) {
      state.loading = false;
      state.list = action.payload.content || [];
      state.total = action.payload.total || 0;
      state.page = action.payload.page || 0;
    },
    fetchEmployeesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchEmployeesStart, fetchEmployeesSuccess, fetchEmployeesFailure } = employeesSlice.actions;
export default employeesSlice.reducer;

