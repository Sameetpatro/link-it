import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { X, Lock } from 'lucide-react';
import { authAPI } from '../api';

export default function AuthDialog({ open, onClose, onAuthSuccess }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tab, setTab] = useState(0); // 0 = login, 1 = register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 0) {
        // Login
        const res = await authAPI.login(username.trim(), password.trim());
        localStorage.setItem('linkit_token', res.data.token);
        localStorage.setItem('linkit_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      } else {
        // Register
        const res = await authAPI.register(username.trim(), password.trim());
        setSuccessMsg('Account created! Logging you in...');
        // Auto login
        const loginRes = await authAPI.login(username.trim(), password.trim());
        localStorage.setItem('linkit_token', loginRes.data.token);
        localStorage.setItem('linkit_user', JSON.stringify(loginRes.data.user));
        onAuthSuccess(loginRes.data.user);
        setTimeout(onClose, 800);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          p: 2,
          borderRadius: 4,
          backgroundColor: isDark ? '#0f1713' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)'}`,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.primary }}>
          <Lock size={18} color="#10b981" /> {tab === 0 ? 'Sign In to LinkIT' : 'Create Account'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => {
            setTab(val);
            setError('');
            setSuccessMsg('');
          }}
          variant="fullWidth"
          sx={{
            mb: 2.5,
            '& .MuiTabs-indicator': { backgroundColor: '#10b981' },
            '& .MuiTab-root.Mui-selected': { color: '#10b981', fontWeight: 700 },
          }}
        >
          <Tab label="Sign In" />
          <Tab label="Register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2, bgcolor: '#059669', color: '#ffffff' }}>
            {successMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. smita"
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#10b981' },
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#10b981' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{ py: 1.2, fontWeight: 700, mt: 1 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : tab === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

