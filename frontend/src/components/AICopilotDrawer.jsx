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
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your LinkIT AI Agent powered by LangGraph. Ask me to forecast traffic, compare short links, analyze spikes, or explain P95 latency.",
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
    e.preventDefault();
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
          width: { xs: '100%', sm: 420 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090e17',
            }}
          >
            <Bot size={18} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            LinkIT Copilot (LangGraph)
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
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
                  ? '#38bdf8'
                  : theme.palette.mode === 'dark'
                  ? '#1e293b'
                  : '#f1f5f9',
              color: m.role === 'user' ? '#090e17' : theme.palette.text.primary,
              fontWeight: m.role === 'user' ? 600 : 400,
              fontSize: '0.875rem',
              lineHeight: 1.5,
              border: `1px solid ${m.role === 'user' ? 'transparent' : theme.palette.divider}`,
              wordBreak: 'break-word',
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
              backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.85rem',
              color: theme.palette.text.secondary,
            }}
          >
            <CircularProgress size={14} color="inherit" />
            DeepSeek Agent analyzing...
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
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
            borderRadius: 2.5,
            px: 1.5,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <InputBase
            placeholder="Ask agent (e.g. 'forecast b0f9736')..."
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
