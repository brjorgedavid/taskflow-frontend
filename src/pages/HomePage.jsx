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
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import PeopleIcon from '@mui/icons-material/People';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

const COLORS = {
  primary: '#3B82F6',
  secondary: '#2DD4BF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

export default function HomePage() {
  const { token } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [stats, setStats] = useState({
    totalEmployees: 0,
    byRole: {},
    byManager: {},
    vacationStats: { pending: 0, approved: 0, rejected: 0 },
    upcomingVacations: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let empList = [];

      const empRes = await api.fetchEmployees(token, 0, '');
      const empPayload = empRes?.data || empRes;
      empList = Array.isArray(empPayload?.items) ? empPayload.items : (empPayload?.content || []);

      const totalPages = empPayload?.totalPages || 1;
      for (let page = 1; page < totalPages; page++) {
        const res = await api.fetchEmployees(token, page, '');
        const payload = res?.data || res;
        const list = Array.isArray(payload?.items) ? payload.items : (payload?.content || []);
        empList = [...empList, ...list];
      }

      const vacRes = await api.fetchVacations(token, 0);
      const vacPayload = vacRes?.data || vacRes;
      const vacList = Array.isArray(vacPayload?.items) ? vacPayload.items : (vacPayload?.content || []);

      setEmployees(empList);
      setVacations(vacList);

      calculateStats(empList, vacList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (empList, vacList) => {
    const totalEmployees = empList.length;

    const byRole = empList.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {});

    const byManager = empList.reduce((acc, emp) => {
      if (emp.managerId) {
        const manager = empList.find(e => e.id === emp.managerId);
        const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';
        acc[managerName] = (acc[managerName] || 0) + 1;
      }
      return acc;
    }, {});

    const vacationStats = vacList.reduce((acc, vac) => {
      const status = vac.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    const now = new Date();
    const upcomingVacations = vacList
      .filter(v => v.status === 'APPROVED' && new Date(v.startDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);

    setStats({
      totalEmployees,
      byRole,
      byManager,
      vacationStats,
      upcomingVacations,
    });
  };

  const getApprovedVacationsForCalendar = () => {
    return vacations.filter(v => v.status === 'APPROVED');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Prepare data for charts
  const roleData = Object.entries(stats.byRole).map(([role, count]) => ({
    name: role,
    value: count,
  }));

  const managerData = Object.entries(stats.byManager)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([manager, count]) => ({
      name: manager.split(' ')[0], // First name only
      count,
    }));

  const vacationStatusData = [
    { name: 'Pending', value: stats.vacationStats.pending, color: COLORS.warning },
    { name: 'Approved', value: stats.vacationStats.approved, color: COLORS.success },
    { name: 'Rejected', value: stats.vacationStats.rejected, color: COLORS.error },
  ];

  const monthlyTrends = vacations
    .filter(vac => vac.status === 'APPROVED')
    .reduce((acc, vac) => {
      const month = format(new Date(vac.startDate), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month]++;
      return acc;
    }, {});

  const trendData = Object.entries(monthlyTrends)
    .map(([month, count]) => ({
      month,
      approved: count,
    }))
    .slice(0, 6)
    .reverse();

  const vacationsByManager = vacations.reduce((acc, vac) => {
    const employee = employees.find(e => e.id === vac.employeeId);
    if (employee && employee.managerId) {
      const manager = employees.find(e => e.id === employee.managerId);
      const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';

      if (!acc[managerName]) {
        acc[managerName] = { pending: 0, approved: 0, rejected: 0 };
      }
      acc[managerName][vac.status.toLowerCase()]++;
    }
    return acc;
  }, {});

  const managerVacationData = Object.entries(vacationsByManager)
    .sort((a, b) => {
      const totalA = a[1].pending + a[1].approved + a[1].rejected;
      const totalB = b[1].pending + b[1].approved + b[1].rejected;
      return totalB - totalA;
    })
    .slice(0, 6)
    .map(([manager, counts]) => ({
      name: manager.split(' ')[0],
      ...counts,
    }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your team.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<PeopleIcon />}
            color={COLORS.primary}
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Vacations"
            value={stats.vacationStats.approved}
            icon={<BeachAccessIcon />}
            color={COLORS.success}
            trend="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Requests"
            value={stats.vacationStats.pending}
            icon={<CalendarMonthIcon />}
            color={COLORS.warning}
            trend="3 new"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Team Size"
            value={Math.round(stats.totalEmployees / Math.max(Object.keys(stats.byManager).length, 1))}
            icon={<TrendingUpIcon />}
            color={COLORS.secondary}
            trend="Stable"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Employees by Role
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Vacation Requests Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vacationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vacationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Team Size by Manager
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={managerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Approved Vacations Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="approved" stroke={COLORS.success} strokeWidth={3} name="Approved" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Vacation Requests by Manager
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={managerVacationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" stackId="a" fill={COLORS.success} name="Approved" />
                <Bar dataKey="pending" stackId="a" fill={COLORS.warning} name="Pending" />
                <Bar dataKey="rejected" stackId="a" fill={COLORS.error} name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Vacation Calendar
            </Typography>
            <VacationCalendar
              vacations={getApprovedVacationsForCalendar()}
              employees={employees}
              currentDate={calendarDate}
              onDateChange={setCalendarDate}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Upcoming Vacations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.upcomingVacations.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No upcoming vacations
                </Typography>
              ) : (
                stats.upcomingVacations.map((vac) => {
                  const employee = employees.find(e => e.id === vac.employeeId);
                  return (
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(vac.startDate), 'MMM dd')} - {format(new Date(vac.endDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function StatsCard({ title, value, icon, color, trend }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.1)',
                color: COLORS.success,
                fontWeight: 600
              }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

function VacationCalendar({ vacations, employees, currentDate, onDateChange }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getVacationsForDay = (day) => {
    return vacations.filter(vac => {
      const start = new Date(vac.startDate);
      const end = new Date(vac.endDate);
      return day >= start && day <= end;
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={goToPreviousMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <Button size="small" variant="outlined" onClick={goToToday}>
            Today
          </Button>
        </Box>

        <IconButton onClick={goToNextMonth} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={1} sx={{ mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid item xs key={day}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                fontWeight: 600,
                color: 'text.secondary'
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1}>
        {days.map((day, idx) => {
          const dayVacations = getVacationsForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());

          return (
            <Grid item xs key={idx}>
              <Box
                sx={{
                  minHeight: 80,
                  p: 1,
                  bgcolor: isToday ? 'rgba(59,130,246,0.1)' : isCurrentMonth ? 'white' : 'rgba(0,0,0,0.02)',
                  borderRadius: 1,
                  border: isToday ? '2px solid' : '1px solid',
                  borderColor: isToday ? COLORS.primary : 'rgba(0,0,0,0.08)',
                  position: 'relative',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isToday ? 700 : 400,
                    color: isCurrentMonth ? 'text.primary' : 'text.disabled'
                  }}
                >
                  {format(day, 'd')}
                </Typography>

                {dayVacations.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {dayVacations.slice(0, 2).map((vac, i) => {
                      const employee = employees.find(e => e.id === vac.employeeId);
                      return (
                        <Box
                          key={i}
                          sx={{
                            fontSize: '0.6rem',
                            bgcolor: COLORS.success,
                            color: 'white',
                            borderRadius: 0.5,
                            px: 0.5,
                            py: 0.25,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={employee ? `${employee.firstName} ${employee.lastName}` : 'Vacation'}
                        >
                          {employee ? employee.firstName : '•'}
                        </Box>
                      );
                    })}
                    {dayVacations.length > 2 && (
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                        +{dayVacations.length - 2} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

