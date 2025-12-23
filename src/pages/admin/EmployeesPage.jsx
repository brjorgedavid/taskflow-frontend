import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import EmployeeModal from '../../components/admin/EmployeeModal';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useNotification } from '../../contexts/NotificationContext';
import { formatRole } from '../../utils/formatters';

export default function EmployeesPage() {
  const { token } = useSelector((s) => s.auth);
  const { showSuccess, showError } = useNotification();
  const [rows, setRows] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [roleFilter, setRoleFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [page, setPage] = useState(1); // MUI Pagination starts at 1
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasActiveFilters = roleFilter || managerFilter;

  useEffect(() => {
    let mounted = true;
    const loadAllEmployees = async () => {
      try {
        let allEmps = [];
        let currentPage = 0;
        let totalPages = 1;

        do {
          const res = await api.fetchEmployees(token, currentPage, '');
          const payload = res?.data || res;
          const list = Array.isArray(payload?.items) ? payload.items : (payload?.content || []);
          allEmps = [...allEmps, ...list];
          totalPages = payload?.totalPages || 1;
          currentPage++;
        } while (currentPage < totalPages);

        if (mounted) {
          setAllEmployees(allEmps);
          const managerList = allEmps.filter(emp => emp.role === 'ADMIN' || emp.role === 'MANAGER');
          setManagers(managerList);
        }
      } catch (err) {
        console.error('Error loading all employees:', err);
      }
    };
    loadAllEmployees();
    return () => { mounted = false; };
  }, [token]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.fetchEmployees(token, page - 1, searchQuery);
        const payload = res?.data || res;
        const list = Array.isArray(payload?.items) ? payload.items : (payload?.content || []);
        if (mounted) {
          setRows(list);
          setTotalPages(payload?.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [token, page, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleClearInput = () => {
    setQuery('');
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchQuery('');
    setPage(1);
  };

  const clearAllFilters = () => {
    setRoleFilter('');
    setManagerFilter(null);
  };

  const handleCreated = (newEmployee) => {
    setRows(prev => [newEmployee, ...prev]);
    setAllEmployees(prev => [...prev, newEmployee]);

    if (newEmployee.role === 'ADMIN' || newEmployee.role === 'MANAGER') {
      setManagers(prev => [...prev, newEmployee]);
    }
    setOpenCreate(false);
  };

  const handleUpdated = (updatedEmployee) => {
    setRows(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    setAllEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));

    const isManager = updatedEmployee.role === 'ADMIN' || updatedEmployee.role === 'MANAGER';
    const wasInManagersList = managers.some(m => m.id === updatedEmployee.id);

    if (isManager && !wasInManagersList) {
      setManagers(prev => [...prev, updatedEmployee]);
    } else if (!isManager && wasInManagersList) {
      setManagers(prev => prev.filter(m => m.id !== updatedEmployee.id));
    } else if (isManager && wasInManagersList) {
      setManagers(prev => prev.map(m => m.id === updatedEmployee.id ? updatedEmployee : m));
    }

    setOpenEdit(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setOpenEdit(true);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await api.deleteEmployee(token, employeeToDelete.id);
      setRows(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
      setAllEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id)); // Remove from allEmployees
      setManagers(prev => prev.filter(m => m.id !== employeeToDelete.id)); // Remove from managers

      const message = res?.message || 'Employee deleted successfully';
      showSuccess(message);

      setOpenDelete(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error(err);

      const errorMessage = err?.message || err?.data?.message || 'Error deleting employee';
      showError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRowClick = (employee) => {
    handleEdit(employee);
  };

  const employeeMap = useMemo(() => {
    const map = new Map();
    allEmployees.forEach(emp => {
      map.set(emp.id, `${emp.firstName} ${emp.lastName}`);
    });
    return map;
  }, [allEmployees]);

  const filtered = useMemo(() => {
    return rows.filter(emp => {
      if (roleFilter && emp.role !== roleFilter) return false;
      if (managerFilter && emp.managerId !== managerFilter.id) return false;

      return true;
    });
  }, [rows, roleFilter, managerFilter]);

  const columns = [
    { field: 'name', label: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
    { field: 'email', label: 'Email', render: (r) => r.email },
    { field: 'role', label: 'Role', render: (r) => formatRole(r.role) },
    {
      field: 'manager',
      label: 'Manager',
      render: (r) => {
        if (!r.managerId) return '';
        return employeeMap.get(r.managerId) || '';
      }
    },
  ];


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
          Employees
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage company employees
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap'
        }}
      >
        <Button
          variant={showFilters ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{ minWidth: 120 }}
        >
          Filters
          {hasActiveFilters && (
            <Chip
              label={
                [roleFilter, managerFilter]
                  .filter(Boolean).length
              }
              size="small"
              sx={{ ml: 1, height: 20, minWidth: 20 }}
              color="secondary"
            />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={clearAllFilters}
            color="error"
          >
            Clear Filters
          </Button>
        )}

        <TextField
          size="small"
          placeholder="Search by name..."
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 250,
            bgcolor: 'white'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearInput}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: 100 }}
        >
          Search
        </Button>
        {searchQuery && (
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            startIcon={<ClearIcon />}
            sx={{ minWidth: 140 }}
          >
            Clear Search
          </Button>
        )}

        <Box flex={1} />

        <Button
          variant="contained"
          color="secondary"
          onClick={()=>setOpenCreate(true)}
          sx={{ minWidth: 160 }}
        >
          + New Employee
        </Button>
      </Box>

      {showFilters && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'rgba(59,130,246,0.02)',
            border: '1px solid',
            borderColor: 'rgba(59,130,246,0.1)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Filter Employees
          </Typography>

          <Grid container spacing={2}>
            {/* Role Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="EMPLOYEE">Employee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                size="small"
                value={managerFilter}
                onChange={(event, newValue) => setManagerFilter(newValue)}
                options={managers}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                renderInput={(params) => (
                  <TextField {...params} label="Manager" placeholder="Search manager..." />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2">
                        {option.firstName} {option.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRole(option.role)}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            onRowClick={handleRowClick}
            actions={(employee) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(employee);
                  }}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(employee);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          />
        )}
      </Paper>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      <EmployeeModal
        open={openCreate}
        onClose={()=>setOpenCreate(false)}
        onCreated={handleCreated}
      />

      <EmployeeModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedEmployee(null);
        }}
        onUpdated={handleUpdated}
        employee={selectedEmployee}
      />

      <ConfirmDialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </Box>
  );
}
