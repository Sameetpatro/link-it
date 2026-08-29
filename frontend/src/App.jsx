import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Grid,
  Fab,
  Tooltip,
} from '@mui/material';
import { Bot } from 'lucide-react';
import { getTheme } from './theme/theme';
import AppNavbar from './components/AppNavbar';
import HeroShortener from './components/HeroShortener';
import CategoryChips from './components/CategoryChips';
import FeaturedSpotlight from './components/FeaturedSpotlight';
import LinkCardGrid from './components/LinkCardGrid';
import EngineVitals from './components/EngineVitals';
import AnalyticsDialog from './components/AnalyticsDialog';
import AICopilotDrawer from './components/AICopilotDrawer';
import AuthDialog from './components/AuthDialog';
import Footer from './components/Footer';
import { linksAPI } from './api';

export default function App() {
  const [mode, setMode] = useState('dark');
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const [allLinks, setAllLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Modals / Drawers state
  const [analyticsCode, setAnalyticsCode] = useState(null);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check saved user
    const savedUser = localStorage.getItem('linkit_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await linksAPI.list(50);
      setAllLinks(res.data.links || []);
      setCacheStats(res.data.cache_stats);
      applyFilter(res.data.links || [], activeCategory, searchQuery);
    } catch (err) {
      console.error('Failed to load links:', err);
    }
  };

  const applyFilter = (links, cat, query) => {
    let result = [...links];

    // Category filter
    if (cat === 'stripe') {
      result = result.filter((l) => l.original_url.includes('stripe'));
    } else if (cat === 'github') {
      result = result.filter((l) => l.original_url.includes('github'));
    } else if (cat === 'news') {
      result = result.filter(
        (l) =>
          l.original_url.includes('cnn') ||
          l.original_url.includes('ycombinator') ||
          l.original_url.includes('wired')
      );
    } else if (cat === 'mine') {
      if (currentUser) {
        result = result.filter((l) => l.user_id === currentUser.id);
      }
    }

    // Search query filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.shcode.toLowerCase().includes(q) ||
          l.original_url.toLowerCase().includes(q)
      );
    }

    setFilteredLinks(result);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat === 'mine' && !currentUser) {
      setIsAuthOpen(true);
      return;
    }
    applyFilter(allLinks, cat, searchQuery);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(allLinks, activeCategory, query);
  };

  const handleLinkCreated = () => {
    loadLinks();
  };

  const handleOpenAnalytics = (code) => {
    setAnalyticsCode(code);
  };

  const handleOpenAIDrawer = (query = '') => {
    setAiInitialQuery(query);
    setIsAIDrawerOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('linkit_token');
    localStorage.removeItem('linkit_user');
    setCurrentUser(null);
    loadLinks();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Navbar */}
        <AppNavbar
          mode={mode}
          toggleMode={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenAIDrawer={handleOpenAIDrawer}
          onSearch={handleSearch}
          onOpenAnalytics={handleOpenAnalytics}
        />

        {/* Main Body */}
        <Container maxWidth="lg" sx={{ flex: 1, pb: 8 }}>
          {/* Hero Shortener */}
          <HeroShortener
            onLinkCreated={handleLinkCreated}
            onOpenAnalytics={handleOpenAnalytics}
          />

          {/* Category Chips */}
          <CategoryChips
            activeCategory={activeCategory}
            onSelectCategory={handleCategoryChange}
          />

          {/* Main Grid: Articles/Cards (Left) + Sidebar (Right) */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Featured Top Performer Spotlight */}
              <FeaturedSpotlight
                onOpenAnalytics={handleOpenAnalytics}
                onOpenAIDrawer={handleOpenAIDrawer}
              />

              {/* Link Cards Grid */}
              <LinkCardGrid
                links={filteredLinks}
                onOpenAnalytics={handleOpenAnalytics}
                onOpenAIDrawer={handleOpenAIDrawer}
              />
            </Grid>

            {/* Sidebar Widgets (MUI Blog Sidebar) */}
            <Grid item xs={12} md={4}>
              <EngineVitals
                cacheStats={cacheStats}
                onOpenAIDrawer={handleOpenAIDrawer}
              />
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Footer />

        {/* Floating Action Button for AI Copilot */}
        <Tooltip title="Ask LinkIT AI Copilot">
          <Fab
            color="primary"
            onClick={() => handleOpenAIDrawer()}
            sx={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              boxShadow: '0 8px 30px rgba(56, 189, 248, 0.4)',
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              color: '#090e17',
              fontWeight: 800,
            }}
          >
            <Bot size={24} />
          </Fab>
        </Tooltip>

        {/* Modals & Drawers */}
        <AnalyticsDialog
          open={Boolean(analyticsCode)}
          onClose={() => setAnalyticsCode(null)}
          shortCode={analyticsCode}
        />

        <AICopilotDrawer
          open={isAIDrawerOpen}
          onClose={() => setIsAIDrawerOpen(false)}
          initialQuery={aiInitialQuery}
          currentUser={currentUser}
        />

        <AuthDialog
          open={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            loadLinks();
          }}
        />
      </Box>
    </ThemeProvider>
  );
}
