import React from 'react';
import {
  Card,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import { Flame, Activity, Bot, Sparkles, ExternalLink, Link2 } from 'lucide-react';

export default function FeaturedSpotlight({
  topLink,
  isLoggedIn,
  onOpenAnalytics,
  onOpenAIDrawer,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // If user has no links yet (or empty list)
  if (!topLink) {
    return (
      <Card
        sx={{
          mb: 4,
          p: { xs: 2.5, md: 3.5 },
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)'}`,
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 19, 0.95) 0%, rgba(21, 34, 27, 0.8) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            icon={<Sparkles size={14} color="#10b981" />}
            label={isLoggedIn ? "Welcome to your Workspace" : "LinkIT Global Spotlight"}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}>
          {isLoggedIn ? "Shorten your first URL above" : "Start Shortening & Scaling"}
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          {isLoggedIn
            ? "Paste any destination link in the shortener above to start tracking real-time telemetry, 5-minute rollups, and ML predictions."
            : "Create high-performance short links backed by Redis caching and Gradient Boosting ML forecasting."}
        </Typography>
      </Card>
    );
  }

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'target.link';
    }
  };

  const domain = getDomain(topLink.original_url);
  const clickCount = topLink.click_count || 0;

  return (
    <Card
      sx={{
        mb: 4,
        p: { xs: 2.5, md: 3.5 },
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.25)'}`,
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 19, 0.95) 0%, rgba(21, 34, 27, 0.8) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
        boxShadow: isDark
          ? '0 0 25px rgba(16, 185, 129, 0.1)'
          : '0 8px 20px rgba(5, 150, 105, 0.08)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip
          icon={<Flame size={14} color="#10b981" />}
          label={isLoggedIn ? "Your #1 Top Performing Link" : "Top Performing Spotlight"}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        />
        <Chip
          label={`${clickCount.toLocaleString()} Total Clicks`}
          size="small"
          color="success"
          sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#059669' }}
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
          flexWrap: 'wrap',
        }}
      >
        {domain}
        <Typography
          component="span"
          sx={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1rem',
            color: '#10b981',
            fontWeight: 700,
          }}
        >
          [/{topLink.shcode}]
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
          wordBreak: 'break-all',
        }}
      >
        Target: <code style={{ color: '#34d399' }}>{topLink.original_url}</code>
      </Typography>

      {/* Metrics Row */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: isDark ? '#15221b' : '#f0fdf4',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
              Total Volume
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.25 }}>
              {clickCount}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: isDark ? '#15221b' : '#f0fdf4',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
              Telemetry
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981', mt: 0.25 }}>
              Real-Time
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: isDark ? '#15221b' : '#f0fdf4',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
              Rollups
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.25 }}>
              5-Min
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: isDark ? '#15221b' : '#f0fdf4',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
              AI Status
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#34d399', mt: 0.25 }}>
              Ready
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onOpenAnalytics(topLink.shcode)}
          startIcon={<Activity size={16} />}
          sx={{ fontWeight: 700 }}
        >
          Inspect 30-Day Metrics
        </Button>
        <Button
          variant="outlined"
          onClick={() => onOpenAIDrawer(`predict traffic for ${topLink.shcode}`)}
          startIcon={<Bot size={16} />}
          sx={{
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            '&:hover': { borderColor: '#10b981', color: '#10b981' },
          }}
        >
          Ask AI Forecaster
        </Button>
      </Box>
    </Card>
  );
}

