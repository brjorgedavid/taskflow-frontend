import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import employeesReducer from '../features/employees/employeesSlice';
import vacationsReducer from '../features/vacations/vacationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    vacations: vacationsReducer,
  },
});

export default store;

