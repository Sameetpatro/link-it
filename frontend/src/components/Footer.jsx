import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        borderTop: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.12)'}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            fontSize: '0.85rem',
            color: theme.palette.text.secondary,
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            <strong style={{ color: '#10b981' }}>LinkIT v2.0 PRO</strong> — Enterprise Distributed URL Shortening & Telemetry
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Go Gateway • PostgreSQL • Redis • Scikit-Learn • LangGraph
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

