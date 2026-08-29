import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: {
              main: '#38bdf8',
              light: '#7dd3fc',
              dark: '#0284c7',
              contrastText: '#090e17',
            },
            secondary: {
              main: '#818cf8',
              light: '#a5b4fc',
              dark: '#4f46e5',
            },
            background: {
              default: '#090e17',
              paper: '#0f172a',
              raised: '#1e293b',
            },
            text: {
              primary: '#f8fafc',
              secondary: '#94a3b8',
            },
            divider: '#1e293b',
          }
        : {
            primary: {
              main: '#0284c7',
              light: '#38bdf8',
              dark: '#0369a1',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#6366f1',
              light: '#818cf8',
              dark: '#4338ca',
            },
            background: {
              default: '#f8fafc',
              paper: '#ffffff',
              raised: '#f1f5f9',
            },
            text: {
              primary: '#0f172a',
              secondary: '#475569',
            },
            divider: '#e2e8f0',
          }),
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            boxShadow: mode === 'dark' ? '0 0 15px rgba(56, 189, 248, 0.3)' : '0 2px 8px rgba(2, 132, 199, 0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
            border: `1px solid ${mode === 'dark' ? '#1e293b' : '#e2e8f0'}`,
            borderRadius: 14,
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: mode === 'dark' ? '#334155' : '#cbd5e1',
              boxShadow: mode === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 9999,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${mode === 'dark' ? '#334155' : '#cbd5e1'}`,
            borderRadius: 16,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
            borderLeft: `1px solid ${mode === 'dark' ? '#1e293b' : '#e2e8f0'}`,
          },
        },
      },
    },
  });
