import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import { Flame, Activity, Bot, ExternalLink } from 'lucide-react';

export default function FeaturedSpotlight({ onOpenAnalytics, onOpenAIDrawer }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 4,
        p: { xs: 2.5, md: 3.5 },
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<Flame size={14} color="#38bdf8" />}
          label="Top Performing Spotlight"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        />
        <Chip
          label="194 Clicks"
          size="small"
          color="success"
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: theme.palette.text.primary,
          mb: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        Stripe Checkout Telemetry Hub
        <Typography
          component="span"
          sx={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1rem',
            color: '#38bdf8',
            fontWeight: 700,
          }}
        >
          [b0f9736]
        </Typography>
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        Target: <code style={{ color: '#818cf8' }}>https://stripe.com/page/b0f9736</code>
      </Typography>

      {/* Metrics Row */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Total Clicks
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.25 }}>
              194
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Avg Latency
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.25 }}>
              30.3 ms
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Geographies
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.25 }}>
              5 Nations
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              ML Forecast
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#34d399', mt: 0.25 }}>
              ~0 Clicks
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onOpenAnalytics('b0f9736')}
          startIcon={<Activity size={16} />}
          sx={{ fontWeight: 700 }}
        >
          Inspect 30-Day Metrics
        </Button>
        <Button
          variant="outlined"
          onClick={() => onOpenAIDrawer('predict traffic for b0f9736')}
          startIcon={<Bot size={16} />}
          sx={{
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          }}
        >
          Ask AI Forecaster
        </Button>
      </Box>
    </Card>
  );
}
