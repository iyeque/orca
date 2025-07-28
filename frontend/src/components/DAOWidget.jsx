import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, List, ListItem, ListItemText, Alert } from '@mui/material';

export default function DAOWidget() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/dao/proposals');
      setProposals(await res.json());
    } catch (e) {
      setError('Failed to fetch proposals');
    }
  };

  useEffect(() => { fetchProposals(); }, []);

  const handleCreate = async () => {
    setError(null);
    setSuccess(null);
    try {
      await fetch('/api/dao/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc })
      });
      setTitle('');
      setDesc('');
      setSuccess('Proposal created!');
      fetchProposals();
    } catch (e) {
      setError('Failed to create proposal');
    }
  };

  const handleVote = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      await fetch('/api/dao/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: id })
      });
      setSuccess('Vote cast!');
      fetchProposals();
    } catch (e) {
      setError('Failed to vote');
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <h2>DAO Governance</h2>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} sx={{ mr: 2 }} />
      <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} sx={{ mr: 2 }} />
      <Button variant="contained" onClick={handleCreate} disabled={!title || !desc}>Create Proposal</Button>
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <List>
        {proposals.map(p => (
          <ListItem key={p.id} secondaryAction={
            <Button variant="outlined" onClick={() => handleVote(p.id)}>Vote ({p.votes})</Button>
          }>
            <ListItemText primary={p.title} secondary={p.description} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 