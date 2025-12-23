import { createTheme } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#3B82F6',
  },
  secondary: {
    main: '#2DD4BF',
  },
  error: {
    main: '#FB7185',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#374151',
    secondary: '#6B7280',
  },
};

const theme = createTheme({
  palette,
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
        },
        containedPrimary: {
          background: 'linear-gradient(90deg,#3B82F6 0%,#2563EB 100%)',
        },
      },
    },
  },
});

export default theme;

