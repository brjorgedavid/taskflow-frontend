import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useSelector } from 'react-redux';
import { api } from '../../api';
import { useNotification } from '../../contexts/NotificationContext';
import { formatStatus } from '../../utils/formatters';

export default function VacationDecisionModal({ open, onClose, vacation, onDecisionMade, viewOnly = false, canEvaluate = true }) {
  const { token } = useSelector((s) => s.auth);
  const { showSuccess, showError } = useNotification();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isViewOnly = viewOnly || !canEvaluate || (vacation && vacation.status !== 'PENDING');

  useEffect(() => {
    if (vacation) {
      setComment(vacation.approvalComment || vacation.rejectionReason || '');
    } else {
      setComment('');
    }
  }, [vacation, open]);

  const handleDecision = async (approved) => {
    if (!vacation || isViewOnly) return;

    setLoading(true);
    try {
      const payload = { approved, comment };
      const res = await api.updateVacationDecision(token, vacation.id, payload);

      const message = res?.message || `Vacation ${approved ? 'approved' : 'rejected'} successfully`;
      showSuccess(message);

      setComment('');
      onDecisionMade && onDecisionMade();
    } catch (err) {
      console.error('Error making decision:', err);
      const errorMessage = err?.message || err?.data?.message || 'Error updating vacation decision';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setComment('');
    onClose();
  };

  if (!vacation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
      <DialogTitle>{isViewOnly ? 'Vacation Details' : 'Vacation Decision'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Requester
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {vacation.requesterName || '-'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Period
          </Typography>
          <Typography variant="body1">
            {new Date(vacation.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} - {new Date(vacation.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Status
          </Typography>
          <Chip
            label={formatStatus(vacation.status)}
            size="small"
            color={vacation.status === 'APPROVED' ? 'success' : vacation.status === 'REJECTED' ? 'error' : 'warning'}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Request Reason
          </Typography>
          <Typography variant="body1">
            {vacation.requestReason || '-'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Created At
          </Typography>
          <Typography variant="body1">
            {formatDate(vacation.createdAt)}
          </Typography>
        </Box>

        {isViewOnly && (
          <>
            <Divider sx={{ my: 3 }} />

            {vacation.decidedAt && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Decided At
                </Typography>
                <Typography variant="body1">
                  {formatDate(vacation.decidedAt)}
                </Typography>
              </Box>
            )}

            {vacation.decidedByName && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Decided By
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {vacation.decidedByName}
                </Typography>
              </Box>
            )}

            {vacation.approvalComment && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Approval Comment
                </Typography>
                <Typography variant="body1">
                  {vacation.approvalComment}
                </Typography>
              </Box>
            )}

            {vacation.rejectionReason && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Rejection Reason
                </Typography>
                <Typography variant="body1" color="error.main">
                  {vacation.rejectionReason}
                </Typography>
              </Box>
            )}
          </>
        )}

        {!isViewOnly && (
          <TextField
            fullWidth
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={3}
            placeholder="Add a comment about your decision..."
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        {isViewOnly ? (
          <Button onClick={handleCloseModal} variant="contained">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleCloseModal} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDecision(false)}
              disabled={loading}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleDecision(true)}
              disabled={loading}
            >
              Approve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

