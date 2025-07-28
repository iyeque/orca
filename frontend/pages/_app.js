import '../src/styles/globals.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import orcaTheme from '../src/theme/orcaTheme';
import OrcaHeader from '../src/components/OrcaHeader';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={orcaTheme}>
      <CssBaseline />
      <OrcaHeader />
      <Component {...pageProps} />
    </ThemeProvider>
  );
} 