import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, Button } from '@mui/material';
import { Cpu, Sparkles, Server, CheckCircle2, Zap } from 'lucide-react';

export default function EngineVitals({ cacheStats, onOpenAIDrawer }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Vitals Card */}
      <Card sx={{ p: 2.5 }}>
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
          <Cpu size={16} color="#38bdf8" /> Engine Vitals
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              PostgreSQL (Neon)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399' }} />
              Connected
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Upstash Redis Cache
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#38bdf8', fontWeight: 600, fontSize: '0.8rem' }}>
              <Zap size={14} />
              {cacheStats?.has_redis
                ? `Hit Rate: ${cacheStats.hit_rate?.toFixed(1)}%`
                : 'Active'}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              5-Min Rollup Worker
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399' }} />
              Active
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              ML Quantile Model
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#818cf8', fontWeight: 600, fontSize: '0.8rem' }}>
              Online (:8000)
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              LangGraph Agent
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#818cf8', fontWeight: 600, fontSize: '0.8rem' }}>
              Ready (:8001)
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Quick Copilot Suggestions Card */}
      <Card sx={{ p: 2.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
          }}
        >
          <Sparkles size={16} /> Copilot Prompts
        </Typography>

        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1.5 }}>
          Click any prompt to ask the AI agent:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onOpenAIDrawer('predict traffic for b0f9736')}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              fontSize: '0.78rem',
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': { color: '#38bdf8', borderColor: '#38bdf8' },
            }}
          >
            📈 Predict traffic for b0f9736
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onOpenAIDrawer('compare b0f9736 vs 0ccefef')}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              fontSize: '0.78rem',
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': { color: '#38bdf8', borderColor: '#38bdf8' },
            }}
          >
            ⚖️ Compare Stripe vs CNN metrics
          </Button>
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
              '&:hover': { color: '#38bdf8', borderColor: '#38bdf8' },
            }}
          >
            🧠 Explain P95 & 5-min rollups
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
