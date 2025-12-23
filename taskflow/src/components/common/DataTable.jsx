import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function DataTable({ columns = [], rows = [], onSort, actions, onRowClick }) {
  if (rows.length === 0) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No records found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(59,130,246,0.04)' }}>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  py: 2
                }}
              >
                {col.sortable ? (
                  <TableSortLabel
                    active={false}
                    onClick={() => onSort && onSort(col.field)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
            {actions && (
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  py: 2
                }}
              >
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              onClick={() => onRowClick && onRowClick(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': {
                  bgcolor: 'rgba(59,130,246,0.02)',
                },
                '&:last-child td': {
                  borderBottom: 0
                }
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{ py: 2 }}
                >
                  {col.render ? col.render(row) : row[col.field]}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  align="right"
                  sx={{ py: 2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
