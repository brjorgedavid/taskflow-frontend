import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import PeopleIcon from '@mui/icons-material/People';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';

const DRAWER_WIDTH = 280;

export default function AppLayout({ children, activeTab, onTabChange, onLogout, user }) {
  const allMenuItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, roles: ['ADMIN'] },
    { id: 'employees', label: 'Employees', icon: <PeopleIcon />, roles: ['ADMIN'] },
    { id: 'vacations', label: 'Vacations', icon: <BeachAccessIcon />, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'profile', label: 'Profile', icon: <PersonIcon />, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles && user?.role && item.roles.includes(user.role)
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid',
            borderColor: 'rgba(59,130,246,0.08)',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}>🏖️</span>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
              TaskFlow
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
              Vacation Management
            </Typography>
          </Box>
        </Box>

        <Divider />

        <List sx={{ px: 2, py: 2, flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(59,130,246,0.08)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(59,130,246,0.12)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(59,130,246,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: activeTab === item.id ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeTab === item.id ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {user && (
          <Box sx={{ p: 2, bgcolor: 'rgba(59,130,246,0.04)' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              {user.email}
            </Typography>
          </Box>
        )}

        <List sx={{ px: 2, pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={onLogout}
              sx={{
                borderRadius: 2,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'rgba(251,113,133,0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

