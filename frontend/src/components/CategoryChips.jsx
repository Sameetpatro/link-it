import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';

const CATEGORIES = [
  { id: 'all', label: 'All Links' },
  { id: 'stripe', label: '💳 Stripe & Payments' },
  { id: 'github', label: '💻 GitHub & Tech' },
  { id: 'news', label: '📰 News & Media' },
  { id: 'mine', label: '👤 My Created Links' },
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        mb: 3,
        overflowX: 'auto',
        pb: 1,
        '::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <Chip
            key={cat.id}
            label={cat.label}
            onClick={() => onSelectCategory(cat.id)}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              py: 2,
              px: 0.5,
              cursor: 'pointer',
              borderColor: isActive ? '#10b981' : isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)',
              backgroundColor: isActive ? '#10b981' : isDark ? '#0f1713' : '#ffffff',
              color: isActive ? '#042f2e' : theme.palette.text.secondary,
              boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.25)' : 'none',
              '&:hover': {
                backgroundColor: isActive ? '#059669' : isDark ? '#15221b' : '#ecfdf5',
                color: isActive ? '#ffffff' : theme.palette.text.primary,
                borderColor: '#10b981',
              },
            }}
          />
        );
      })}
    </Box>
  );
}

