import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Chip,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Zap,
  Search,
  Sun,
  Moon,
  Bot,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';

export default function AppNavbar({
  mode,
  toggleMode,
  currentUser,
  userLinks = [],
  onOpenAuth,
  onLogout,
  onOpenAIDrawer,
  onSearch,
  onOpenAnalytics,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const topShortCode = userLinks.length > 0 ? userLinks[0].shcode : '';

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: isDark
          ? 'rgba(15, 23, 19, 0.88)'
          : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`,
        boxShadow: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 68, justifyContent: 'space-between' }}>
          
          {/* Brand Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#042f2e',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Zap size={20} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              LinkIT
              <Chip
                label="v2.0 PRO"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              />
            </Typography>
          </Box>

          {/* Center Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                '&:hover': { color: '#10b981' },
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Shortener
            </Button>
            <Button
              color="inherit"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                '&:hover': { color: '#10b981' },
              }}
              onClick={() => onOpenAnalytics(topShortCode || '')}
              startIcon={<BarChart3 size={16} color="#10b981" />}
            >
              Analytics
            </Button>
            <Button
              color="inherit"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                '&:hover': { color: '#10b981' },
              }}
              onClick={() => onOpenAIDrawer(topShortCode ? `predict traffic for ${topShortCode}` : 'forecast my traffic')}
              startIcon={<Bot size={16} color="#34d399" />}
            >
              ML Predictions
            </Button>
          </Box>

          {/* Right Actions: Search + Theme Toggle + Auth */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            
            {/* Search Input */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDark ? '#15221b' : '#f0fdf4',
                borderRadius: 9999,
                padding: '4px 12px',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
                '&:focus-within': {
                  borderColor: '#10b981',
                },
              }}
            >
              <Search size={16} color={isDark ? '#34d399' : '#059669'} />
              <InputBase
                placeholder="Search links..."
                size="small"
                onChange={(e) => onSearch(e.target.value)}
                sx={{
                  ml: 1,
                  fontSize: '0.85rem',
                  color: theme.palette.text.primary,
                  width: { xs: 100, sm: 160 },
                }}
              />
            </Box>

            {/* Dark/Light Toggle */}
            <IconButton onClick={toggleMode} color="inherit" size="small" sx={{ color: theme.palette.text.secondary }}>
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>

            {/* Auth User or Login Button */}
            {currentUser ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  sx={{
                    borderRadius: 9999,
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '4px 12px',
                    fontWeight: 700,
                  }}
                  startIcon={
                    <Avatar sx={{ width: 22, height: 22, bgcolor: '#10b981', color: '#042f2e', fontSize: '0.75rem', fontWeight: 800 }}>
                      {currentUser.username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                >
                  {currentUser.username}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      backgroundColor: isDark ? '#0f1713' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
                    },
                  }}
                >
                  <MenuItem disabled sx={{ color: theme.palette.text.secondary }}>
                    Signed in as @{currentUser.username}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      onLogout();
                    }}
                    sx={{ color: '#f87171', fontWeight: 600 }}
                  >
                    <LogOut size={16} style={{ marginRight: 8 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={onOpenAuth}
                startIcon={<User size={16} />}
                sx={{ fontWeight: 700 }}
              >
                Sign In
              </Button>
            )}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

