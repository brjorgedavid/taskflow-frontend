import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {api} from '../../api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import VacationModal from '../../components/admin/VacationModal';
import VacationDecisionModal from '../../components/admin/VacationDecisionModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable from '../../components/common/DataTable';
import {formatStatus, getStatusColor, getStatusTextColor} from '../../utils/formatters';
import {useNotification} from '../../contexts/NotificationContext';

export default function VacationsPage() {
    const {token} = useSelector((s) => s.auth);
    const user = useSelector((s) => s.auth.user);
    const {showSuccess, showError} = useNotification();
    const [rows, setRows] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [directReports, setDirectReports] = useState([]); // For MANAGER role
    const [loading, setLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState('');
    const [requesterFilter, setRequesterFilter] = useState(null);
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [page, setPage] = useState(1); // MUI Pagination starts at 1
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openDecision, setOpenDecision] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedVacation, setSelectedVacation] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const hasActiveFilters = statusFilter || requesterFilter || startDateFilter || endDateFilter;

    useEffect(() => {
        if (hasActiveFilters) {
            setPage(1);
        }
    }, [statusFilter, requesterFilter, startDateFilter, endDateFilter, hasActiveFilters]);

    useEffect(() => {
        let mounted = true;

        const loadEmployeeData = async () => {
            if (!user) return;

            try {
                if (user.role === 'ADMIN') {
                    const empRes = await api.fetchEmployees(token, 0, '');
                    const empPayload = empRes?.data || empRes;
                    let empList = Array.isArray(empPayload?.items) ? empPayload.items : (empPayload?.content || []);

                    // Fetch all pages of employees
                    const totalPages = empPayload?.totalPages || 1;
                    for (let p = 1; p < totalPages; p++) {
                        const res = await api.fetchEmployees(token, p, '');
                        const payload = res?.data || res;
                        const list = Array.isArray(payload?.items) ? payload.items : (payload?.content || []);
                        empList = [...empList, ...list];
                    }

                    if (mounted) {
                        setEmployees(empList);
                    }
                } else if (user.role === 'MANAGER') {
                    const empRes = await api.fetchDirectReports(token);
                    const empPayload = empRes?.data || empRes;
                    const empList = Array.isArray(empPayload?.items) ? empPayload.items :
                        Array.isArray(empPayload) ? empPayload :
                            (empPayload?.content || []);

                    if (mounted) {
                        setDirectReports(empList);
                    }
                }
            } catch (err) {
                console.error('Error loading employee data:', err);
            }
        };

        loadEmployeeData();
        return () => {
            mounted = false;
        };
    }, [token, user]);

    const filterVacationsByRole = useCallback((vacations) => {
        if (!user) return vacations;

        if (user.role === 'ADMIN') {
            return vacations;
        } else if (user.role === 'MANAGER') {
            const directReportIds = directReports.map(emp => emp.id);
            return vacations.filter(vac =>
                vac.employeeId === user.id || directReportIds.includes(vac.employeeId)
            );
        } else if (user.role === 'EMPLOYEE') {
            return vacations.filter(vac => vac.employeeId === user.id);
        }

        return vacations;
    }, [user, directReports]);

    useEffect(() => {
        let mounted = true;
        const loadVacations = async () => {
            setLoading(true);
            try {
                if (hasActiveFilters) {
                    // Fetch all pages
                    let allVacations = [];
                    let currentPage = 0;
                    let total = 1;

                    do {
                        const vacRes = await api.fetchVacations(token, currentPage);
                        const vacPayload = vacRes?.data || vacRes;
                        const vacList = Array.isArray(vacPayload?.items) ? vacPayload.items : (vacPayload?.content || []);
                        allVacations = [...allVacations, ...vacList];
                        total = vacPayload?.totalPages || 1;
                        currentPage++;
                    } while (currentPage < total);

                    allVacations = filterVacationsByRole(allVacations);

                    if (mounted) {
                        setRows(allVacations);
                        setTotalPages(1);
                    }
                } else {
                    const vacRes = await api.fetchVacations(token, page - 1);
                    const vacPayload = vacRes?.data || vacRes;
                    let vacList = Array.isArray(vacPayload?.items) ? vacPayload.items : (vacPayload?.content || []);

                    vacList = filterVacationsByRole(vacList);

                    if (mounted) {
                        setRows(vacList);
                        setTotalPages(vacPayload?.totalPages || 1);
                    }
                }
            } catch (err) {
                console.error('Error loading vacations:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadVacations();
        return () => {
            mounted = false;
        };
    }, [token, page, statusFilter, requesterFilter, startDateFilter, endDateFilter, filterVacationsByRole, hasActiveFilters]);


    const handleCreated = (v) => {
        setRows(prev => [v, ...prev]);
        setOpenCreate(false);
    };

    const reloadVacations = async () => {
        try {
            const vacRes = await api.fetchVacations(token, page - 1);
            const vacPayload = vacRes?.data || vacRes;
            const vacList = Array.isArray(vacPayload?.items) ? vacPayload.items : (vacPayload?.content || []);
            setRows(vacList);
            setTotalPages(vacPayload?.totalPages || 1);
        } catch (err) {
            console.error('Error reloading vacations:', err);
        }
    };

    const handleDecisionClick = (vacation) => {
        const vacationWithName = {
            ...vacation,
            requesterName: employeeMap.get(vacation.employeeId) || vacation.employeeId,
            decidedByName: vacation.decidedBy ? employeeMap.get(vacation.decidedBy) : null
        };
        setSelectedVacation(vacationWithName);
        setOpenDecision(true);
    };

    const handleDecisionMade = async () => {
        setOpenDecision(false);
        setSelectedVacation(null);
        await reloadVacations();
    };

    const handleDeleteClick = (vacation) => {
        setSelectedVacation(vacation);
        setOpenDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedVacation) return;

        setDeleteLoading(true);
        try {
            const res = await api.deleteVacation(token, selectedVacation.id);
            setRows(prev => prev.filter(v => v.id !== selectedVacation.id));

            const message = res?.message || 'Vacation deleted successfully';
            showSuccess(message);

            setOpenDelete(false);
            setSelectedVacation(null);
        } catch (err) {
            console.error('Error deleting vacation:', err);
            const errorMessage = err?.message || err?.data?.message || 'Error deleting vacation';
            showError(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRowClick = (vacation) => {
        handleDecisionClick(vacation);
    };

    const canEvaluateVacation = (vacation) => {
        if (!user) return false;
        if (user.role === 'EMPLOYEE') return false;
        if (user.role === 'ADMIN') {
            return vacation.employeeId !== user.id;
        }

        if (user.role === 'MANAGER') {
            if (vacation.employeeId === user.id) return false; // Cannot evaluate own vacation
            const employee = directReports.find(emp => emp.id === vacation.employeeId);
            return !!employee;
        }

        return false;
    };

    const canDeleteVacation = (vacation) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        if (user.role === 'MANAGER') {
            return vacation.employeeId === user.id;
        }

        if (user.role === 'EMPLOYEE') {
            return vacation.employeeId === user.id;
        }

        return false;
    };

    const employeeMap = useMemo(() => {
        const map = new Map();

        employees.forEach(emp => {
            map.set(emp.id, `${emp.firstName} ${emp.lastName}`);
        });

        directReports.forEach(emp => {
            map.set(emp.id, `${emp.firstName} ${emp.lastName}`);
        });

        if (user && user.id) {
            map.set(user.id, `${user.firstName} ${user.lastName}`);
        }

        return map;
    }, [employees, directReports, user]);

    const filtered = useMemo(() => {
        return rows.filter(r => {
            if (statusFilter && r.status !== statusFilter) return false;
            if (requesterFilter && r.employeeId !== requesterFilter.id) return false;

            if (startDateFilter) {
                const vacationStart = new Date(r.startDate);
                const filterStart = new Date(startDateFilter);
                if (vacationStart < filterStart) return false;
            }

            if (endDateFilter) {
                const vacationEnd = new Date(r.endDate);
                const filterEnd = new Date(endDateFilter);
                if (vacationEnd > filterEnd) return false;
            }

            return true;
        });
    }, [rows, statusFilter, requesterFilter, startDateFilter, endDateFilter]);


    const clearAllFilters = () => {
        setStatusFilter('');
        setRequesterFilter(null);
        setStartDateFilter('');
        setEndDateFilter('');
    };

    const columns = [
        {
            field: 'createdAt',
            label: 'Created At',
            render: (r) => {
                if (!r.createdAt) return '-';
                return new Date(r.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        },
        {
            field: 'requester',
            label: 'Requester',
            render: (r) => {
                if (!r.employeeId) return '-';
                const name = employeeMap.get(r.employeeId);
                return name || '-';
            }
        },
        {
            field: 'period',
            label: 'Period',
            render: (r) => {
                const startDate = new Date(r.startDate);
                const endDate = new Date(r.endDate);
                const formatOptions = {month: 'short', day: 'numeric', year: 'numeric'};
                return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
            }
        },
        {
            field: 'status',
            label: 'Status',
            render: (r) => (
                <Chip
                    label={formatStatus(r.status)}
                    size="small"
                    sx={{
                        bgcolor: getStatusColor(r.status),
                        color: getStatusTextColor(r.status),
                        fontWeight: 600,
                        fontSize: '0.75rem'
                    }}
                />
            )
        },
        {
            field: 'reason',
            label: 'Reason',
            render: (r) => r.requestReason || '-'
        },
    ];

    return (
        <Box>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" sx={{fontWeight: 600, mb: 1, color: 'text.primary'}}>
                    Vacations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage vacation requests
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
                    startIcon={<FilterListIcon/>}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{minWidth: 120}}
                >
                    Filters
                    {hasActiveFilters && (
                        <Chip
                            label={
                                [statusFilter, requesterFilter, startDateFilter, endDateFilter]
                                    .filter(Boolean).length
                            }
                            size="small"
                            sx={{ml: 1, height: 20, minWidth: 20}}
                            color="secondary"
                        />
                    )}
                </Button>

                {hasActiveFilters && (
                    <Button
                        variant="text"
                        startIcon={<ClearIcon/>}
                        onClick={clearAllFilters}
                        color="error"
                    >
                        Clear Filters
                    </Button>
                )}

                <Box flex={1}/>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenCreate(true)}
                    sx={{minWidth: 160}}
                >
                    + New Request
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
                    <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 2, color: 'text.primary'}}>
                        Filter Vacations
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    variant="outlined"
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="APPROVED">Approved</MenuItem>
                                    <MenuItem value="REJECTED">Rejected</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                size="small"
                                value={requesterFilter}
                                onChange={(event, newValue) => setRequesterFilter(newValue)}
                                options={employees}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                renderInput={(params) => (
                                    <TextField {...params} label="Requester" placeholder="Search employee..."/>
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box>
                                            <Typography variant="body2">
                                                {option.firstName} {option.lastName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Start Date (From)"
                                InputLabelProps={{shrink: true}}
                                value={startDateFilter}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="End Date (To)"
                                InputLabelProps={{shrink: true}}
                                value={endDateFilter}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    {hasActiveFilters && (
                        <Box sx={{mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
                            <Typography variant="caption" color="text.secondary" sx={{mr: 1}}>
                                Active filters:
                            </Typography>
                            {statusFilter && (
                                <Chip
                                    label={`Status: ${formatStatus(statusFilter)}`}
                                    size="small"
                                    onDelete={() => setStatusFilter('')}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {requesterFilter && (
                                <Chip
                                    label={`Requester: ${requesterFilter.firstName} ${requesterFilter.lastName}`}
                                    size="small"
                                    onDelete={() => setRequesterFilter(null)}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {startDateFilter && (
                                <Chip
                                    label={`From: ${new Date(startDateFilter).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}`}
                                    size="small"
                                    onDelete={() => setStartDateFilter('')}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {endDateFilter && (
                                <Chip
                                    label={`To: ${new Date(endDateFilter).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}`}
                                    size="small"
                                    onDelete={() => setEndDateFilter('')}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    )}
                </Paper>
            )}

            {hasActiveFilters && (
                <Box sx={{mb: 2}}>
                    <Typography variant="body2" color="text.secondary">
                        Showing <strong>{filtered.length}</strong> filtered result{filtered.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            )}

            <Paper elevation={0} sx={{borderRadius: 2, overflow: 'hidden', mb: 3}}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={8}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <DataTable
                        columns={columns}
                        rows={filtered}
                        onRowClick={handleRowClick}
                        actions={(vacation) => {
                            const canEvaluate = canEvaluateVacation(vacation);
                            const canDelete = canDeleteVacation(vacation);

                            return (
                                <Box sx={{display: 'flex', gap: 1}}>
                                    {vacation.status === 'PENDING' && canEvaluate ? (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDecisionClick(vacation);
                                            }}
                                            sx={{color: 'success.main'}}
                                            title="Evaluate vacation"
                                        >
                                            <CheckCircleIcon fontSize="small"/>
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDecisionClick(vacation);
                                            }}
                                            sx={{color: 'primary.main'}}
                                            title="View details"
                                        >
                                            <VisibilityIcon fontSize="small"/>
                                        </IconButton>
                                    )}
                                    {canDelete && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(vacation);
                                            }}
                                            sx={{color: 'error.main'}}
                                            title="Delete vacation"
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    )}
                                </Box>
                            );
                        }}
                    />
                )}
            </Paper>

            {!hasActiveFilters && totalPages > 1 && (
                <Box display="flex" justifyContent="center" sx={{mb: 3}}>
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

            <VacationModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={handleCreated}/>

            <VacationDecisionModal
                open={openDecision}
                onClose={() => {
                    setOpenDecision(false);
                    setSelectedVacation(null);
                }}
                vacation={selectedVacation}
                onDecisionMade={handleDecisionMade}
                canEvaluate={selectedVacation ? canEvaluateVacation(selectedVacation) : false}
            />

            <ConfirmDialog
                open={openDelete}
                onClose={() => {
                    setOpenDelete(false);
                    setSelectedVacation(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Vacation"
                message={`Are you sure you want to delete this vacation request? This action cannot be undone.`}
                loading={deleteLoading}
            />
        </Box>
    );
}
