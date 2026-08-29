import React from 'react';
import { Box, Chip } from '@mui/material';

const CATEGORIES = [
  { id: 'all', label: 'All Links (100+)' },
  { id: 'stripe', label: '💳 Stripe & Payments' },
  { id: 'github', label: '💻 GitHub & Tech' },
  { id: 'news', label: '📰 News & Media' },
  { id: 'mine', label: '👤 My Created Links' },
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
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
            color={isActive ? 'primary' : 'default'}
            sx={{
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              py: 2,
              px: 0.5,
              cursor: 'pointer',
              borderColor: isActive ? '#38bdf8' : 'divider',
              backgroundColor: isActive ? '#38bdf8' : 'background.paper',
              color: isActive ? '#090e17' : 'text.secondary',
              '&:hover': {
                backgroundColor: isActive ? '#0284c7' : 'background.raised',
                color: isActive ? '#090e17' : 'text.primary',
              },
            }}
          />
        );
      })}
    </Box>
  );
}
