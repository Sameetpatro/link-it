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
  Button,
} from '@mui/material';
import { X, Brain, Activity, Globe, Smartphone, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { linksAPI } from '../api';

export default function AnalyticsDialog({ open, onClose, shortCode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
  
  // Format timestamps nicely (e.g. "Aug 29, 14:00")
  const times = timeSeries.map((t) => {
    try {
      const d = new Date(t.timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
               d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return t.timestamp;
    } catch {
      return t.timestamp;
    }
  });
  const clicks = timeSeries.map((t) => t.clicks);

  const countries = stats?.countries || {};
  const devices = stats?.devices || {};

  const labelColor = isDark ? '#cbd5e1' : '#334155';
  const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)';

  // ECharts 1: Traffic Area Chart
  const trafficOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? 'rgba(15, 23, 19, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: '#10b981',
      borderWidth: 1.5,
      padding: [8, 12],
      textStyle: { color: isDark ? '#f0fdf4' : '#064e3b', fontSize: 12, fontWeight: 600 },
      axisPointer: { lineStyle: { color: '#10b981', width: 1.5, type: 'dashed' } },
    },
    grid: { left: '2%', right: '3%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: times.length ? times : ['No Events Yet'],
      axisLine: { lineStyle: { color: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.25)' } },
      axisLabel: {
        color: labelColor,
        fontSize: 11,
        fontWeight: 500,
        rotate: times.length > 8 ? 20 : 0,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: splitLineColor } },
      axisLabel: { color: labelColor, fontSize: 11, fontWeight: 500 },
    },
    series: [
      {
        name: 'Clicks',
        type: 'line',
        smooth: true,
        showSymbol: times.length <= 15,
        symbolSize: 6,
        data: clicks.length ? clicks : [0],
        lineStyle: { color: '#10b981', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.45)' },
            { offset: 0.8, color: 'rgba(16, 185, 129, 0.05)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' },
          ]),
        },
        itemStyle: { color: '#34d399', borderWidth: 2, borderColor: '#059669' },
      },
    ],
    dataZoom: [
      { type: 'inside' },
      {
        type: 'slider',
        bottom: 0,
        height: 18,
        borderColor: 'transparent',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.08)',
        fillerColor: 'rgba(16, 185, 129, 0.25)',
        textStyle: { color: labelColor, fontSize: 10 },
      },
    ],
  };

  // ECharts 2: Countries Bar Chart
  const countryOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(15, 23, 19, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: '#10b981',
      borderWidth: 1.5,
      textStyle: { color: isDark ? '#f0fdf4' : '#064e3b', fontSize: 12 },
    },
    grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: splitLineColor } },
      axisLabel: { color: labelColor, fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: Object.keys(countries).length ? Object.keys(countries) : ['Direct / None'],
      axisLine: { lineStyle: { color: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)' } },
      axisLabel: { color: isDark ? '#f0fdf4' : '#0f172a', fontWeight: 600, fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 18,
        data: Object.values(countries).length ? Object.values(countries) : [0],
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#059669' },
            { offset: 1, color: '#34d399' },
          ]),
        },
      },
    ],
  };

  // ECharts 3: Devices Donut Chart
  const deviceOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(15, 23, 19, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: '#10b981',
      borderWidth: 1.5,
      textStyle: { color: isDark ? '#f0fdf4' : '#064e3b', fontSize: 12 },
    },
    legend: {
      bottom: '0%',
      textStyle: { color: isDark ? '#e2e8f0' : '#1e293b', fontSize: 11, fontWeight: 600 },
      itemWidth: 12,
      itemHeight: 12,
    },
    color: ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'],
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#0f1713' : '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
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
          maxHeight: '92vh',
          backgroundColor: isDark ? '#0f1713' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)'}`,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <Activity size={22} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
              Link Telemetry & Analytics
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#10b981',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              /{shortCode}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={fetchAnalytics} size="small" title="Refresh metrics" sx={{ color: theme.palette.text.secondary }}>
            <RefreshCw size={18} />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 1, mt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
            <CircularProgress color="primary" size={36} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Loading real-time click aggregates...
            </Typography>
          </Box>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: isDark ? '#15221b' : '#ecfdf5',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.15)'}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                    Total Clicks
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.text.primary }}>
                    {(stats.total_clicks || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: isDark ? '#15221b' : '#ecfdf5',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.15)'}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                    Unique Visitors
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#10b981' }}>
                    {(stats.unique_visitors || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: isDark ? '#15221b' : '#ecfdf5',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.15)'}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                    Avg Latency
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.text.primary }}>
                    {(stats.avg_latency_ms || 0).toFixed(1)} ms
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: isDark ? '#15221b' : '#ecfdf5',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.15)'}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                    Bot Traffic
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: (stats.bot_clicks || 0) > 0 ? '#f87171' : '#34d399' }}>
                    {stats.total_clicks > 0
                      ? (((stats.bot_clicks || 0) / stats.total_clicks) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* ML Traffic Forecast Banner */}
            {ml && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 3,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.35) 0%, rgba(15, 23, 19, 0.9) 100%)'
                    : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(5, 150, 105, 0.3)'}`,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? '#34d399' : '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Brain size={18} color="#10b981" /> ML Traffic Forecast (Quantile Gradient Boosting)
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 1, fontWeight: 500 }}>
                  {ml.plain_english_summary || 'Model prediction generated from recent traffic distribution.'}
                </Typography>
                {ml.why_breakdown?.reasons_list && (
                  <Box component="ul" sx={{ pl: 2.5, m: 0, color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                    {ml.why_breakdown.reasons_list.map((r, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{r}</li>
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
                backgroundColor: isDark ? '#15221b' : '#ffffff',
                border: `1px solid ${theme.palette.divider}`,
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart2 size={16} color="#10b981" /> 30-Day Hourly Traffic Volume
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
                    backgroundColor: isDark ? '#15221b' : '#ffffff',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.primary }}>
                    <Globe size={16} color="#10b981" /> Top Countries
                  </Typography>
                  <ReactECharts option={countryOption} style={{ height: 220 }} />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: isDark ? '#15221b' : '#ffffff',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.primary }}>
                    <Smartphone size={16} color="#10b981" /> Device Breakdown
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

