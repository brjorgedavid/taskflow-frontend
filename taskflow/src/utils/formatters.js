export const formatRole = (role) => {
  if (!role) return '';

  const roleMap = {
    'ADMIN': 'Admin',
    'MANAGER': 'Manager',
    'EMPLOYEE': 'Employee'
  };

  return roleMap[role] || role;
};

export const formatStatus = (status) => {
  if (!status) return '';

  const statusMap = {
    'PENDING': 'Pending',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected'
  };

  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  const colorMap = {
    'PENDING': '#FEF3C7',
    'APPROVED': '#D1FAE5',
    'REJECTED': '#FEE2E2'
  };

  return colorMap[status] || '#F3F4F6';
};

export const getStatusTextColor = (status) => {
  const colorMap = {
    'PENDING': '#92400E',
    'APPROVED': '#065F46',
    'REJECTED': '#991B1B'
  };

  return colorMap[status] || '#374151';
};

