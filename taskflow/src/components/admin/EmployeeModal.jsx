import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useSelector } from 'react-redux';
import { api } from '../../api';
import { useNotification } from '../../contexts/NotificationContext';

export default function EmployeeModal({ open, onClose, onCreated, onUpdated, employee = null }) {
  const { token } = useSelector((s) => s.auth);
  const { showSuccess, showError } = useNotification();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Password fields -> only for create mode
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const isEditMode = !!employee;

  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (!pwd) {
      return 'Password is required';
    }
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
    }
    return '';
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const loadManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const res = await api.fetchManagers(token);
      const payload = res?.data || res;
      const list = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : (payload?.content || []));
      setManagers(list);
    } catch (err) {
      console.error('Error loading managers:', err);
    } finally {
      setLoadingManagers(false);
    }
  }, [token]);

  useEffect(() => {
    if (open) {
      loadManagers();
    }
  }, [open, loadManagers]);

  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setEmail(employee.email || '');
      setRole(employee.role || 'EMPLOYEE');
      setManagerId(employee.managerId || '');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('EMPLOYEE');
      setManagerId('');
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setConfirmPasswordError('');
    }
  }, [employee, open]);

  const handleSubmit = async () => {
    if (!isEditMode) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        setPasswordError(pwdError);
        showError(pwdError);
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        showError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        role,
        managerId: managerId || null
      };

      if (!isEditMode) {
        payload.password = password;
      }

      if (isEditMode) {
        const res = await api.updateEmployee(token, employee.id, payload);
        const payloadData = res?.data || res;
        const updated = payloadData?.data || payloadData || res;

        const message = res?.message || 'Employee updated successfully';
        showSuccess(message);

        onUpdated && onUpdated(updated);
      } else {
        const res = await api.createEmployee(token, payload);
        const payloadData = res?.data || res;
        const created = payloadData?.data || payloadData || res;

        const message = res?.message || 'Employee created successfully';
        showSuccess(message);

        onCreated && onCreated(created);
      }
    } catch (err) {
      console.error(err);

      const errorMessage = err?.message || err?.data?.message || (isEditMode ? 'Error updating employee' : 'Error creating employee');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Edit Employee' : 'New Employee'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="First Name"
          value={firstName}
          onChange={(e)=>setFirstName(e.target.value)}
          sx={{mt:1}}
        />
        <TextField
          fullWidth
          label="Last Name"
          value={lastName}
          onChange={(e)=>setLastName(e.target.value)}
          sx={{mt:2}}
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          sx={{mt:2}}
          disabled={isEditMode}
        />

        {!isEditMode && (
          <>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              onBlur={handlePasswordBlur}
              error={!!passwordError}
              helperText={passwordError}
              sx={{mt:2}}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              onBlur={handleConfirmPasswordBlur}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              sx={{mt:2}}
              required
            />
          </>
        )}

        <FormControl fullWidth sx={{mt:2}}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e)=>setRole(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="MANAGER">Manager</MenuItem>
            <MenuItem value="EMPLOYEE">Employee</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{mt:2}}>
          <InputLabel>Manager</InputLabel>
          <Select
            value={managerId}
            label="Manager"
            onChange={(e)=>setManagerId(e.target.value)}
            variant="outlined"
            disabled={loadingManagers}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
