import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: {
              main: '#10b981', // Emerald 500
              light: '#34d399', // Emerald 400
              dark: '#059669', // Emerald 600
              contrastText: '#042f2e',
            },
            secondary: {
              main: '#14b8a6', // Teal 500
              light: '#5eead4', // Teal 300
              dark: '#0f766e', // Teal 700
              contrastText: '#ffffff',
            },
            background: {
              default: '#090d0b', // Deep emerald dark
              paper: '#0f1713', // Elevated emerald slate
              raised: '#15221b', // Card raised background
            },
            text: {
              primary: '#f0fdf4', // Soft mint white
              secondary: '#94a3b8', // Slate grey
            },
            divider: 'rgba(16, 185, 129, 0.12)',
          }
        : {
            primary: {
              main: '#059669', // Emerald 600
              light: '#10b981', // Emerald 500
              dark: '#047857', // Emerald 700
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#0d9488', // Teal 600
              light: '#14b8a6',
              dark: '#115e59',
              contrastText: '#ffffff',
            },
            background: {
              default: '#f6fbf8', // Crisp mint white
              paper: '#ffffff',
              raised: '#ecfdf5',
            },
            text: {
              primary: '#064e3b',
              secondary: '#475569',
            },
            divider: 'rgba(5, 150, 105, 0.15)',
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
            background:
              mode === 'dark'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow:
              mode === 'dark'
                ? '0 0 15px rgba(16, 185, 129, 0.3)'
                : '0 2px 8px rgba(5, 150, 105, 0.25)',
            '&:hover': {
              background:
                mode === 'dark'
                  ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? '#0f1713' : '#ffffff',
            border: `1px solid ${mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`,
            borderRadius: 14,
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: mode === 'dark' ? 'rgba(52, 211, 153, 0.4)' : '#059669',
              boxShadow:
                mode === 'dark'
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.1)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
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
            backgroundColor: mode === 'dark' ? '#0f1713' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
            borderRadius: 16,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0f1713' : '#ffffff',
            borderLeft: `1px solid ${mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`,
          },
        },
      },
    },
  });

