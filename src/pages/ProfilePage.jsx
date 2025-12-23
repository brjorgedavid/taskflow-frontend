import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../api';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatRole, formatStatus, getStatusColor, getStatusTextColor } from '../utils/formatters';

const COLORS = {
  primary: '#3B82F6',
  secondary: '#2DD4BF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export default function ProfilePage() {
  const { token } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [vacations, setVacations] = useState([]);
  const [manager, setManager] = useState(null);
  const [directReports, setDirectReports] = useState([]);
  const [teamVacations, setTeamVacations] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, [token]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const profileRes = await api.getMyProfile(token);
      const profileData = profileRes?.data || profileRes;
      setProfile(profileData);

      let empList = [];

      if (profileData.role === 'ADMIN') {
        const empRes = await api.fetchEmployees(token, 0, '');
        const empPayload = empRes?.data || empRes;
        empList = Array.isArray(empPayload?.items) ? empPayload.items : (empPayload?.content || []);

        const totalEmpPages = empPayload?.totalPages || 1;
        for (let p = 1; p < totalEmpPages; p++) {
          const res = await api.fetchEmployees(token, p, '');
          const payload = res?.data || res;
          const list = Array.isArray(payload?.items) ? payload.items : (payload?.content || []);
          empList = [...empList, ...list];
        }

        if (profileData.managerId) {
          const managerData = empList.find(e => e.id === profileData.managerId);
          setManager(managerData);
        }

        const reports = empList.filter(e => e.managerId === profileData.id);
        setDirectReports(reports);
      }

      const vacRes = await api.fetchVacations(token, 0);
      const vacPayload = vacRes?.data || vacRes;
      let vacList = Array.isArray(vacPayload?.items) ? vacPayload.items : (vacPayload?.content || []);

      const totalPages = vacPayload?.totalPages || 1;
      for (let p = 1; p < totalPages; p++) {
        const res = await api.fetchVacations(token, p);
        const payload = res?.data || res;
        const list = Array.isArray(payload?.items) ? payload.items : (payload?.content || []);
        vacList = [...vacList, ...list];
      }

      let userVacations;
      if (profileData.role === 'EMPLOYEE') {
        userVacations = vacList;
      } else {
        userVacations = vacList.filter(v => v.employeeId === profileData.id);
      }
      setVacations(userVacations);

      if (profileData.role === 'MANAGER' || profileData.role === 'ADMIN') {
        const reports = empList.filter(e => e.managerId === profileData.id);
        const reportIds = reports.map(r => r.id);
        const teamVacs = vacList.filter(v => reportIds.includes(v.employeeId));
        setTeamVacations(teamVacs);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">
          Unable to load profile
        </Typography>
      </Box>
    );
  }

  const vacationStats = vacations.reduce((acc, vac) => {
    const status = vac.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0 });

  const statusData = [
    { name: 'Pending', value: vacationStats.pending, color: COLORS.warning },
    { name: 'Approved', value: vacationStats.approved, color: COLORS.success },
    { name: 'Rejected', value: vacationStats.rejected, color: COLORS.error },
  ].filter(item => item.value > 0);

  const approvedVacations = vacations.filter(v => v.status === 'APPROVED');
  const totalDaysUsed = approvedVacations.reduce((acc, vac) => {
    const start = new Date(vac.startDate);
    const end = new Date(vac.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return acc + days;
  }, 0);

  const now = new Date();
  const upcomingVacations = vacations
    .filter(v => v.status === 'APPROVED' && new Date(v.startDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const recentRequests = vacations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personal information and vacation history
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: COLORS.primary,
                  fontSize: '3rem',
                  mb: 2
                }}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Chip
                label={formatRole(profile.role)}
                color="primary"
                sx={{ mb: 2 }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItem sx={{ px: 0 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <ListItemText
                  primary="Email"
                  secondary={profile.email}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <ListItemText
                  primary="Role"
                  secondary={formatRole(profile.role)}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                />
              </ListItem>

              {manager && (
                <ListItem sx={{ px: 0 }}>
                  <SupervisorAccountIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Manager"
                    secondary={`${manager.firstName} ${manager.lastName}`}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                  />
                </ListItem>
              )}

              <ListItem sx={{ px: 0 }}>
                <BeachAccessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <ListItemText
                  primary="Total Vacation Requests"
                  secondary={vacations.length}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 600 }}
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <EventAvailableIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <ListItemText
                  primary="Vacation Days Used"
                  secondary={`${totalDaysUsed} days`}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 600 }}
                />
              </ListItem>

              {(profile.role === 'MANAGER' || profile.role === 'ADMIN') && (
                <ListItem sx={{ px: 0 }}>
                  <SupervisorAccountIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Direct Reports"
                    secondary={`${directReports.length} employee${directReports.length !== 1 ? 's' : ''}`}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 600 }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.success, mb: 1 }}>
                    {vacationStats.approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.warning, mb: 1 }}>
                    {vacationStats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.error, mb: 1 }}>
                    {vacationStats.rejected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {statusData.length > 0 && profile.role !== 'EMPLOYEE' && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Request Status Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {profile.role == 'ADMIN' && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Upcoming Vacations
                  </Typography>
                  {upcomingVacations.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BeachAccessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No upcoming vacations
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {upcomingVacations.slice(0, 3).map((vac) => (
                        <Box
                          key={vac.id}
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(59,130,246,0.04)',
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderColor: COLORS.success,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {format(new Date(vac.startDate), 'MMM dd')} - {format(new Date(vac.endDate), 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vac.requestReason || 'No reason provided'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {profile.role !== 'ADMIN'  && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Recent Vacation Requests
                  </Typography>
                  {recentRequests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No vacation requests yet
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {recentRequests.map((vac) => (
                        <Grid item xs={12} sm={6} md={4} key={vac.id}>
                          <Box
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              height: '100%',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {format(new Date(vac.startDate), 'MMM dd')} - {format(new Date(vac.endDate), 'MMM dd, yyyy')}
                              </Typography>
                              <Chip
                                label={formatStatus(vac.status)}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(vac.status),
                                  color: getStatusTextColor(vac.status),
                                  fontSize: '0.7rem',
                                }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {vac.requestReason || 'No reason provided'}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              Requested: {format(new Date(vac.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                            {vac.decidedAt && (
                              <>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  Decided: {format(new Date(vac.decidedAt), 'MMM dd, yyyy')}
                                </Typography>
                              </>
                            )}
                            {vac.approvalComment && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                Comment: {vac.approvalComment}
                              </Typography>
                            )}
                            {vac.rejectionReason && (
                              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                Reason: {vac.rejectionReason}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {profile.role === 'ADMIN' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Vacation Requests
              </Typography>
              {recentRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No vacation requests yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {recentRequests.map((vac) => (
                    <Grid item xs={12} sm={6} md={4} key={vac.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {format(new Date(vac.startDate), 'MMM dd')} - {format(new Date(vac.endDate), 'MMM dd, yyyy')}
                          </Typography>
                          <Chip
                            label={formatStatus(vac.status)}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(vac.status),
                              color: getStatusTextColor(vac.status),
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {vac.requestReason || 'No reason provided'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Requested: {format(new Date(vac.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                        {vac.decidedAt && (
                          <>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Decided: {format(new Date(vac.decidedAt), 'MMM dd, yyyy')}
                            </Typography>
                          </>
                        )}
                        {vac.approvalComment && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                            Comment: {vac.approvalComment}
                          </Typography>
                        )}
                        {vac.rejectionReason && (
                          <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                            Reason: {vac.rejectionReason}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        )}

        {(profile.role === 'MANAGER' || profile.role === 'ADMIN') && directReports.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Team Vacation Requests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vacation requests from your direct reports
              </Typography>
              {teamVacations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No team vacation requests
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {teamVacations.slice(0, 6).map((vac) => {
                    const employee = directReports.find(e => e.id === vac.employeeId);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={vac.id}>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            height: '100%',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(vac.startDate), 'MMM dd')} - {format(new Date(vac.endDate), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                            <Chip
                              label={formatStatus(vac.status)}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(vac.status),
                                color: getStatusTextColor(vac.status),
                                fontSize: '0.7rem',
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {vac.requestReason || 'No reason provided'}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Requested: {format(new Date(vac.createdAt), 'MMM dd, yyyy')}
                          </Typography>
                          {vac.decidedAt && (
                            <>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                Decided: {format(new Date(vac.decidedAt), 'MMM dd, yyyy')}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

