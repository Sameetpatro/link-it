import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  Button,
  Chip,
  Alert,
  Fade,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Sparkles, Link2, Copy, Check, BarChart2 } from 'lucide-react';
import { linksAPI } from '../api';

export default function HeroShortener({ onLinkCreated, onOpenAnalytics }) {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await linksAPI.shorten(url.trim());
      setResult(res.data);
      setUrl('');
      onLinkCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ pt: 5, pb: 4 }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.2)'}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 0 35px rgba(56, 189, 248, 0.1)'
              : '0 10px 25px rgba(2, 132, 199, 0.08)',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            letterSpacing: '-0.03em',
            mb: 1,
          }}
        >
          Shorten, Scale & Forecast with{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Enterprise AI
          </Box>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3,
            maxWidth: 700,
            fontSize: '1rem',
          }}
        >
          High-throughput event ingestion backed by Upstash Redis caching, 5-minute rollup aggregations, and Quantile Gradient Boosting traffic prediction.
        </Typography>

        {/* Shortener Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: 0.75,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            '&:focus-within': {
              borderColor: '#38bdf8',
              boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.25)',
            },
          }}
        >
          <Link2
            size={20}
            style={{ marginLeft: 12, marginRight: 8, color: theme.palette.text.secondary }}
          />
          <InputBase
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your destination link (e.g. https://github.com/my-project)..."
            fullWidth
            required
            sx={{
              fontSize: '0.95rem',
              color: theme.palette.text.primary,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Result Card */}
        {result && (
          <Fade in={Boolean(result)}>
            <Paper
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2.5,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(56, 189, 248, 0.08)'
                    : 'rgba(2, 132, 199, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label="Ready"
                  size="small"
                  color="success"
                  sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
                />
                <Typography
                  component="a"
                  href={result.short_url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {result.short_url}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopy}
                  startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                  sx={{
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: copied ? '#34d399' : theme.palette.text.primary,
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onOpenAnalytics(result.short_code)}
                  startIcon={<BarChart2 size={16} />}
                  sx={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                    color: '#090e17',
                    fontWeight: 700,
                  }}
                >
                  View Analytics
                </Button>
              </Box>
            </Paper>
          </Fade>
        )}
      </Paper>
    </Box>
  );
}
