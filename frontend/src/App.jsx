import React, { useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Grid,
} from '@mui/material';
import { getTheme } from './theme/theme';
import AppNavbar from './components/AppNavbar';
import HeroShortener from './components/HeroShortener';
import FeaturedSpotlight from './components/FeaturedSpotlight';
import LinkCardGrid from './components/LinkCardGrid';
import EngineVitals from './components/EngineVitals';
import AnalyticsDialog from './components/AnalyticsDialog';
import AICopilotDrawer from './components/AICopilotDrawer';
import AuthDialog from './components/AuthDialog';
import { linksAPI } from './api';

export default function App() {
  const [mode, setMode] = useState('dark');
  const theme = useMemo(() => getTheme(mode), [mode]);

  const [allLinks, setAllLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
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
        console.error('Failed to parse saved user:', e);
      }
    }
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await linksAPI.list(50);
      const links = res.data.links || [];
      setAllLinks(links);
      setCacheStats(res.data.cache_stats);
      applyFilter(links, searchQuery);
    } catch (err) {
      console.error('Failed to load links:', err);
    }
  };

  const applyFilter = (links, query) => {
    let result = [...links];

    // Search query filter
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.shcode && l.shcode.toLowerCase().includes(q)) ||
          (l.original_url && l.original_url.toLowerCase().includes(q))
      );
    }

    setFilteredLinks(result);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(allLinks, query);
  };

  const handleLinkCreated = () => {
    loadLinks();
  };

  const handleOpenAnalytics = (code) => {
    if (code) {
      setAnalyticsCode(code);
    } else if (allLinks.length > 0) {
      setAnalyticsCode(allLinks[0].shcode);
    }
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

  // Derive top-performing link dynamically
  const topLink = useMemo(() => {
    if (!allLinks || allLinks.length === 0) return null;
    // Sort by click count descending
    const sorted = [...allLinks].sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
    return sorted[0];
  }, [allLinks]);

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
          userLinks={allLinks}
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

          {/* Main Grid: Articles/Cards (Left) + Sidebar (Right) */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Dynamic Top Performing Spotlight (Shows user's own top link if logged in) */}
              <FeaturedSpotlight
                topLink={topLink}
                isLoggedIn={Boolean(currentUser)}
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

            {/* Sidebar Widgets */}
            <Grid item xs={12} md={4}>
              <EngineVitals
                cacheStats={cacheStats}
                userLinks={allLinks}
                onOpenAIDrawer={handleOpenAIDrawer}
              />
            </Grid>
          </Grid>
        </Container>

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

