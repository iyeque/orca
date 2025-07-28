import { createTheme } from '@mui/material/styles';

const orcaTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a2540',
    },
    secondary: {
      main: '#00bcd4',
    },
    background: {
      default: '#e3f2fd',
      paper: '#ffffff',
    },
    text: {
      primary: '#0a2540',
      secondary: '#00bcd4',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          transition: 'background 0.3s cubic-bezier(.47,1.64,.41,.8)',
          '&:hover': {
            backgroundColor: '#00bcd4',
            color: '#fff',
            boxShadow: '0 4px 20px 0 rgba(10,37,64,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 32px 0 rgba(10,37,64,0.10)',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: '0 8px 40px 0 rgba(0,188,212,0.18)',
          },
        },
      },
    },
  },
});

export default orcaTheme; 