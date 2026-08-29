import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
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
            <strong>LinkIT v2.0 PRO</strong> — Enterprise Distributed URL Shortening & Telemetry
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Go Gateway • PostgreSQL • Upstash Redis • Scikit-Learn • LangGraph
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
