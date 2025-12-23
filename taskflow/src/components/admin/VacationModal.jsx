import React, {useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {useSelector} from 'react-redux';
import {api} from '../../api';
import {useNotification} from '../../contexts/NotificationContext';

export default function VacationModal({open, onClose, onCreated}) {
    const {token} = useSelector((s) => s.auth);
    const {showSuccess, showError} = useNotification();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [overlapError, setOverlapError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const handleSubmit = async () => {
        if (!token) {
            showError('Authentication required. Please login again.');
            return;
        }

        setLoading(true);
        setSuggestions(null);
        setOverlapError(null);
        setValidationErrors({});

        try {
            const payload = {startDate, endDate, requestReason: reason};
            console.log('Creating vacation with payload:', payload);
            console.log('Using token:', token ? 'Token exists' : 'No token');

            const res = await api.createVacation(token, payload);
            const payloadData = res?.data || res;
            const created = payloadData?.data || payloadData || res;

            const message = res?.message || 'Vacation request created successfully';
            showSuccess(message);

            setStartDate('');
            setEndDate('');
            setReason('');
            setSuggestions(null);
            setOverlapError(null);
            setValidationErrors({});

            onCreated(created);
        } catch (err) {
            console.error('Vacation creation error:', err);
            console.error('Error details:', {
                status: err?.status,
                message: err?.message,
                data: err?.data,
                suggestions: err?.data?.suggestions,
                errors: err?.data?.errors
            });

            if (err?.status === 400 && err?.data?.errors) {
                const fieldErrors = {};
                err.data.errors.forEach(error => {
                    fieldErrors[error.field] = error.message;
                });
                setValidationErrors(fieldErrors);
                showError(err?.message || 'Validation failed');
            }

            // Check if it's an overlap error with suggestions
            else if (err?.status === 400 && err?.data?.suggestions) {
                setOverlapError(err?.message || 'Requested vacation overlaps with an existing vacation');
                setSuggestions(err.data.suggestions);
                showError(err?.message || 'Vacation dates conflict with existing request');
            } else if (err?.status === 401) {
                showError('Session expired. Please login again.');
            } else {
                const errorMessage = err?.message || err?.data?.message || 'Error creating vacation request';
                showError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUseSuggestion = (suggestion) => {
        setStartDate(suggestion.startDate);
        setEndDate(suggestion.endDate);
        setSuggestions(null);
        setOverlapError(null);
    };

    const handleCloseModal = () => {
        setStartDate('');
        setEndDate('');
        setReason('');
        setSuggestions(null);
        setOverlapError(null);
        setValidationErrors({});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <DialogTitle>New Vacation Request</DialogTitle>
            <DialogContent>
                {overlapError && suggestions && (
                    <Alert severity="warning" sx={{mb: 2}}>
                        <Typography variant="body2" sx={{fontWeight: 600, mb: 1}}>
                            {overlapError}
                        </Typography>
                        <Typography variant="body2" sx={{mb: 1}}>
                            Available date suggestions:
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            {suggestions.map((suggestion, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${new Date(suggestion.startDate).toLocaleDateString('en-US')} - ${new Date(suggestion.endDate).toLocaleDateString('en-US')}`}
                                    onClick={() => handleUseSuggestion(suggestion)}
                                    color="primary"
                                    variant="outlined"
                                    sx={{cursor: 'pointer'}}
                                />
                            ))}
                        </Box>
                    </Alert>
                )}

                <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    InputLabelProps={{shrink: true}}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{mt: 1}}
                    error={!!validationErrors.startDate}
                    helperText={validationErrors.startDate}
                />
                <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    InputLabelProps={{shrink: true}}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={{mt: 2}}
                    error={!!validationErrors.endDate}
                    helperText={validationErrors.endDate}
                />
                <TextField
                    fullWidth
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    sx={{mt: 2}}
                    multiline
                    rows={3}
                    error={!!validationErrors.requestReason}
                    helperText={validationErrors.requestReason}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

