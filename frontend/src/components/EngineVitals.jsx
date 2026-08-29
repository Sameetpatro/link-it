import React from 'react';
import { Card, Typography, Box, useTheme, Button } from '@mui/material';
import { Cpu, Sparkles, Zap, Activity } from 'lucide-react';

export default function EngineVitals({ cacheStats, userLinks = [], onOpenAIDrawer }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const firstCode = userLinks.length > 0 ? userLinks[0].shcode : 'latest';
  const secondCode = userLinks.length > 1 ? userLinks[1].shcode : firstCode;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Vitals Card */}
      <Card sx={{ p: 2.5, backgroundColor: isDark ? '#0f1713' : '#ffffff' }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <Cpu size={16} color="#10b981" /> Engine Vitals
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              PostgreSQL (Neon)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Connected
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Redis Cache Layer
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
              <Zap size={14} />
              {cacheStats?.has_redis
                ? `Hit Rate: ${cacheStats.hit_rate?.toFixed(1)}%`
                : 'Active (L1)'}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              5-Min Rollup Worker
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Active
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              ML Gradient Booster
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
              Online (:8000)
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              LangGraph Agent
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
              Ready (:8001)
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Quick Copilot Suggestions Card */}
      <Card sx={{ p: 2.5, backgroundColor: isDark ? '#0f1713' : '#ffffff' }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
          }}
        >
          <Sparkles size={16} /> Copilot Prompts
        </Typography>

        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1.5 }}>
          Click any prompt to trigger AI forecasting:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onOpenAIDrawer(`predict traffic for ${firstCode}`)}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              fontSize: '0.78rem',
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': { color: '#10b981', borderColor: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)' },
            }}
          >
            📈 Predict traffic for /{firstCode}
          </Button>

          {userLinks.length > 1 && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onOpenAIDrawer(`compare ${firstCode} vs ${secondCode}`)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                fontSize: '0.78rem',
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&:hover': { color: '#10b981', borderColor: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)' },
              }}
            >
              ⚖️ Compare /{firstCode} vs /{secondCode}
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={() => onOpenAIDrawer('Explain P95 latency and 5-min aggregation')}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              fontSize: '0.78rem',
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': { color: '#10b981', borderColor: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)' },
            }}
          >
            🧠 Explain P95 & 5-min rollups
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

