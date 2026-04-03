import { createTheme, alpha } from '@mui/material/styles';

// ─── Paleta AprovAI ────────────────────────────────────────────────────────
const NAVY_DARK   = '#0A1F44';
const NAVY        = '#1E3A8A';
const PURPLE      = '#7B2FF7';
const PURPLE_DARK = '#5A1FCF';
const CYAN        = '#00C2FF';
const SUCCESS     = '#22C55E';
const GRAY_MID    = '#9CA3AF';
const GRAY_DARK   = '#1F2937';

// O gradiente da marca
export const BRAND_GRADIENT = 'linear-gradient(135deg, #7B2FF7, #00C2FF)';

const baseShape = { shape: { borderRadius: 12 } };

const baseTypography = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' as const },
  },
};

const baseComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '10px 20px',
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none' },
      },
      containedPrimary: {
        background: BRAND_GRADIENT,
        '&:hover': { background: `linear-gradient(135deg, ${PURPLE_DARK}, #009FCF)` },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    },
  },
  MuiChip: {
    styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
  },
  MuiTextField: {
    styleOverrides: {
      root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: 8 },
      bar: { borderRadius: 8 },
    },
  },
};

// ─── Light Theme ───────────────────────────────────────────────────────────
export const lightTheme = createTheme({
  ...baseShape,
  ...baseTypography,
  palette: {
    mode: 'light',
    primary: {
      main: PURPLE,
      light: alpha(PURPLE, 0.12),
      dark: PURPLE_DARK,
      contrastText: '#fff',
    },
    secondary: {
      main: CYAN,
      dark: '#009FCF',
      contrastText: '#fff',
    },
    success:  { main: SUCCESS },
    info:     { main: CYAN },
    background: {
      default: '#F5F7FA',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   NAVY_DARK,
      secondary: GRAY_MID,
    },
    divider: alpha(NAVY, 0.08),
  },
  components: baseComponents,
});

// ─── Dark Theme ────────────────────────────────────────────────────────────
export const darkTheme = createTheme({
  ...baseShape,
  ...baseTypography,
  palette: {
    mode: 'dark',
    primary: {
      main: PURPLE,
      light: alpha(PURPLE, 0.2),
      dark: PURPLE_DARK,
      contrastText: '#fff',
    },
    secondary: {
      main: CYAN,
      dark: '#009FCF',
      contrastText: '#fff',
    },
    success:  { main: SUCCESS },
    info:     { main: CYAN },
    background: {
      default: '#0B0F1A',
      paper:   '#111827',
    },
    text: {
      primary:   '#FFFFFF',
      secondary: GRAY_MID,
    },
    divider: alpha('#fff', 0.06),
  },
  components: {
    ...baseComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: `1px solid ${alpha('#fff', 0.06)}`,
          background: '#111827',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
