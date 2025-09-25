import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d81b60', // Pink color for women security theme
      light: '#ff5c8d',
      dark: '#a00037',
    },
    secondary: {
      main: '#5c6bc0', // Indigo color
      light: '#8e99f3',
      dark: '#26418f',
    },
    background: {
      default: '#f8bbd0', // Light pink background
      paper: '#ffffff',
    },
    text: {
      primary: '#37474f',
      secondary: '#546e7a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;