import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  total: 0,
  page: 0,
  loading: false,
  error: null,
};

const vacationsSlice = createSlice({
  name: 'vacations',
  initialState,
  reducers: {
    fetchVacationsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVacationsSuccess(state, action) {
      state.loading = false;
      state.list = action.payload.content || [];
      state.total = action.payload.total || 0;
      state.page = action.payload.page || 0;
    },
    fetchVacationsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchVacationsStart, fetchVacationsSuccess, fetchVacationsFailure } = vacationsSlice.actions;
export default vacationsSlice.reducer;

