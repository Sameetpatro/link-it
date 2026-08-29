import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  InputBase,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Bot, X, Send } from 'lucide-react';
import { agentAPI } from '../api';

export default function AICopilotDrawer({ open, onClose, initialQuery, currentUser }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your LinkIT AI Agent powered by LangGraph. Ask me to forecast traffic, compare short links, analyze spikes, or explain latency metrics.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const newMsgs = [...messages, { role: 'user', content: query }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const userId = currentUser ? currentUser.id : 1;
      const username = currentUser ? currentUser.username : 'guest';
      const res = await agentAPI.chat(userId, username, query);

      setMessages([
        ...newMsgs,
        { role: 'assistant', content: res.data.answer || 'Analysis complete.' },
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        { role: 'assistant', content: `Error contacting agent: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#0f1713' : '#ffffff',
          borderLeft: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
            <Bot size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
              LinkIT Copilot
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              DeepSeek • LangGraph
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* Message Stream */}
      <Box
        sx={{
          flex: 1,
          p: 2.5,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((m, idx) => (
          <Box
            key={idx}
            sx={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              p: 1.75,
              borderRadius: 3,
              borderBottomRightRadius: m.role === 'user' ? 0 : 3,
              borderBottomLeftRadius: m.role === 'assistant' ? 0 : 3,
              backgroundColor:
                m.role === 'user'
                  ? '#10b981'
                  : isDark
                  ? '#15221b'
                  : '#f0fdf4',
              color: m.role === 'user' ? '#042f2e' : theme.palette.text.primary,
              fontWeight: m.role === 'user' ? 700 : 400,
              fontSize: '0.875rem',
              lineHeight: 1.5,
              border: `1px solid ${m.role === 'user' ? 'transparent' : isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`,
              wordBreak: 'break-word',
              boxShadow: m.role === 'user' ? '0 2px 10px rgba(16, 185, 129, 0.25)' : 'none',
            }}
          >
            {m.content}
          </Box>
        ))}

        {loading && (
          <Box
            sx={{
              alignSelf: 'flex-start',
              p: 1.5,
              borderRadius: 3,
              backgroundColor: isDark ? '#15221b' : '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.85rem',
              color: '#10b981',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
            }}
          >
            <CircularProgress size={14} color="inherit" />
            AI agent analyzing link telemetry...
          </Box>
        )}
      </Box>

      {/* Input Box */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          gap: 1,
          backgroundColor: isDark ? '#0f1713' : '#ffffff',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDark ? '#15221b' : '#f0fdf4',
            borderRadius: 2.5,
            px: 1.5,
            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
            '&:focus-within': {
              borderColor: '#10b981',
            },
          }}
        >
          <InputBase
            placeholder="Ask agent (e.g. 'forecast traffic')..."
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !input.trim()}
          sx={{ minWidth: 44, p: 0, borderRadius: 2.5 }}
        >
          <Send size={16} />
        </Button>
      </Box>
    </Drawer>
  );
}

