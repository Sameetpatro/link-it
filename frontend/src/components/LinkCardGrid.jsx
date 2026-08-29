import React from 'react';
import {
  Grid,
  Card,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Copy, BarChart3, Bot, MousePointerClick, Calendar, ExternalLink, Sparkles } from 'lucide-react';

export default function LinkCardGrid({ links, onOpenAnalytics, onOpenAIDrawer }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleCopy = (code) => {
    const url = `http://localhost:8080/${code}`;
    navigator.clipboard.writeText(url);
    alert(`Copied short link: ${url}`);
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'web.link';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!links || links.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          backgroundColor: isDark ? 'rgba(15, 23, 19, 0.5)' : '#ffffff',
          borderRadius: 3,
          border: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <Sparkles size={32} color="#10b981" style={{ marginBottom: 12 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
          No shortened links found
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Enter a URL above to create and manage your personal shortened links.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {links.map((link) => {
        const domain = getDomain(link.original_url);
        return (
          <Grid item xs={12} sm={6} key={link.id || link.shcode}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 2.5,
                backgroundColor: isDark ? '#0f1713' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`,
                '&:hover': {
                  borderColor: isDark ? '#10b981' : '#059669',
                  boxShadow: isDark
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 185, 129, 0.15)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <Box>
                {/* Card Header: Domain Tag + Copy Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Chip
                    label={domain}
                    size="small"
                    sx={{
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.1)',
                      color: isDark ? '#34d399' : '#047857',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)'}`,
                    }}
                  />
                  <Tooltip title="Copy Short URL">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(link.shcode)}
                      sx={{ color: theme.palette.text.secondary, '&:hover': { color: '#10b981' } }}
                    >
                      <Copy size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Short Code Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    mb: 0.5,
                  }}
                >
                  <Box
                    component="a"
                    href={`http://localhost:8080/${link.shcode}`}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { color: '#10b981' },
                    }}
                  >
                    /{link.shcode}
                    <ExternalLink size={14} color={theme.palette.text.secondary} />
                  </Box>
                </Typography>

                {/* Destination URL */}
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.85rem',
                    mb: 2,
                  }}
                  title={link.original_url}
                >
                  {link.original_url}
                </Typography>
              </Box>

              {/* Bottom Section: Click Stats & Action Triggers */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    mb: 2,
                    fontSize: '0.8rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MousePointerClick size={14} color="#10b981" />
                    <strong style={{ color: theme.palette.text.primary }}>
                      {link.click_count || 0}
                    </strong>{' '}
                    clicks
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Calendar size={14} />
                    {formatDate(link.created_at)}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => onOpenAnalytics(link.shcode)}
                    startIcon={<BarChart3 size={15} />}
                    sx={{
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#10b981', color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)' },
                    }}
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onOpenAIDrawer(`predict traffic for ${link.shcode}`)}
                    sx={{
                      borderColor: theme.palette.divider,
                      color: '#10b981',
                      minWidth: 40,
                      px: 1,
                      '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' },
                    }}
                    title="Ask AI Forecaster"
                  >
                    <Bot size={16} />
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

