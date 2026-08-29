import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { X, Brain, Activity, Globe, Smartphone, ShieldCheck } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { linksAPI } from '../api';

export default function AnalyticsDialog({ open, onClose, shortCode }) {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && shortCode) {
      fetchAnalytics();
    }
  }, [open, shortCode]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await linksAPI.getAnalytics(shortCode, 30);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const stats = data?.stats || {};
  const ml = data?.ml;
  const timeSeries = stats?.time_series || [];
  const times = timeSeries.map((t) => t.timestamp);
  const clicks = timeSeries.map((t) => t.clicks);

  const countries = stats?.countries || {};
  const devices = stats?.devices || {};

  // ECharts 1: Traffic Area Chart
  const trafficOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '3%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: times.length ? times : ['No Events'],
      axisLine: { lineStyle: { color: theme.palette.text.secondary } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: theme.palette.divider } },
    },
    series: [
      {
        name: 'Clicks',
        type: 'line',
        smooth: true,
        data: clicks.length ? clicks : [0],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#38bdf888' },
            { offset: 1, color: '#38bdf800' },
          ]),
        },
        itemStyle: { color: '#38bdf8' },
      },
    ],
    dataZoom: [
      { type: 'inside' },
      { type: 'slider', bottom: 0, textStyle: { color: theme.palette.text.secondary } },
    ],
  };

  // ECharts 2: Countries Bar Chart
  const countryOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    grid: { left: '3%', right: '3%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: theme.palette.divider } },
    },
    yAxis: {
      type: 'category',
      data: Object.keys(countries).length ? Object.keys(countries) : ['None'],
      axisLine: { lineStyle: { color: theme.palette.text.secondary } },
    },
    series: [
      {
        type: 'bar',
        data: Object.values(countries).length ? Object.values(countries) : [0],
        itemStyle: { color: '#60a5fa', borderRadius: [0, 6, 6, 0] },
      },
    ],
  };

  // ECharts 3: Devices Donut Chart
  const deviceOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', textStyle: { color: theme.palette.text.secondary } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: theme.palette.background.paper,
          borderWidth: 2,
        },
        data: Object.entries(devices).length
          ? Object.entries(devices).map(([k, v]) => ({ name: k, value: v }))
          : [{ name: 'Desktop', value: 1 }],
      },
    ],
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          p: { xs: 1.5, md: 3 },
          borderRadius: 4,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={20} color="#38bdf8" /> Analytics Visualizer
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'JetBrains Mono, monospace' }}>
            Short Code: /{shortCode}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 1, mt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Total Clicks
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {(stats.total_clicks || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Unique Visitors
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {(stats.unique_visitors || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Avg Latency
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {(stats.avg_latency_ms || 0).toFixed(1)} ms
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Bot Traffic
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#f87171' }}>
                    {stats.total_clicks > 0
                      ? (((stats.bot_clicks || 0) / stats.total_clicks) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* ML Traffic Forecast Banner */}
            {ml && ml.why_breakdown && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 3,
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #172554 100%)',
                  border: '1px solid #3b82f6',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Brain size={18} /> ML Traffic Forecast (Quantile Gradient Boosting)
                </Typography>
                <Typography variant="body2" sx={{ color: '#f8fafc', mb: 1 }}>
                  {ml.plain_english_summary}
                </Typography>
                {ml.why_breakdown.reasons_list && (
                  <Box component="ul" sx={{ pl: 2.5, m: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                    {ml.why_breakdown.reasons_list.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* 1. Main Time Series Area Chart */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                border: `1px solid ${theme.palette.divider}`,
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                📈 30-Day Hourly Traffic Volume
              </Typography>
              <ReactECharts option={trafficOption} style={{ height: 280 }} />
            </Box>

            {/* 2. Side-by-Side: Countries & Devices */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Globe size={16} /> Top Countries
                  </Typography>
                  <ReactECharts option={countryOption} style={{ height: 220 }} />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Smartphone size={16} /> Device Breakdown
                  </Typography>
                  <ReactECharts option={deviceOption} style={{ height: 220 }} />
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
