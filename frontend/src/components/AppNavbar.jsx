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
  onOpenAuth,
  onLogout,
  onOpenAIDrawer,
  onSearch,
  onOpenAnalytics,
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
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
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#090e17',
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
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              />
            </Typography>
          </Box>

          {/* Center Navigation Links (MUI Blog Style) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              sx={{ color: theme.palette.text.secondary, '&:hover': { color: '#38bdf8' } }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Shortener
            </Button>
            <Button
              color="inherit"
              sx={{ color: theme.palette.text.secondary, '&:hover': { color: '#38bdf8' } }}
              onClick={() => onOpenAnalytics('b0f9736')}
              startIcon={<BarChart3 size={16} />}
            >
              Analytics
            </Button>
            <Button
              color="inherit"
              sx={{ color: theme.palette.text.secondary, '&:hover': { color: '#818cf8' } }}
              onClick={() => onOpenAIDrawer('predict traffic for b0f9736')}
              startIcon={<Bot size={16} />}
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
                backgroundColor:
                  theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                borderRadius: 9999,
                padding: '4px 12px',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Search size={16} color={theme.palette.text.secondary} />
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
            <IconButton onClick={toggleMode} color="inherit" size="small">
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>

            {/* Auth User or Login Button */}
            {currentUser ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  sx={{
                    borderRadius: 9999,
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '4px 12px',
                  }}
                  startIcon={
                    <Avatar sx={{ width: 22, height: 22, bgcolor: '#38bdf8', color: '#090e17', fontSize: '0.75rem' }}>
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
                >
                  <MenuItem disabled>Logged in as @{currentUser.username}</MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      onLogout();
                    }}
                    sx={{ color: '#f87171' }}
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
