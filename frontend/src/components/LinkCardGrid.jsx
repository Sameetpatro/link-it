import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Copy, BarChart3, Bot, MousePointerClick, Calendar, ExternalLink } from 'lucide-react';

export default function LinkCardGrid({ links, onOpenAnalytics, onOpenAIDrawer }) {
  const theme = useTheme();

  const handleCopy = (code) => {
    const url = `http://localhost:8080/${code}`;
    navigator.clipboard.writeText(url);
    alert(`Copied: ${url}`);
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
      <Box sx={{ textAlign: 'center', py: 8, color: theme.palette.text.secondary }}>
        <Typography variant="body1">No links found in this category.</Typography>
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
              }}
            >
              <Box>
                {/* Card Header: Domain Tag + Copy Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Chip
                    label={domain}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                  <Tooltip title="Copy Short URL">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(link.shcode)}
                      sx={{ color: theme.palette.text.secondary }}
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
                      '&:hover': { color: '#38bdf8' },
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
                    gap: 2,
                    py: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    mb: 2,
                    fontSize: '0.8rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MousePointerClick size={14} color="#38bdf8" />
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
                      color: '#818cf8',
                      minWidth: 40,
                      px: 1,
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
