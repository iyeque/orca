import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';

export default function OrcaHeader() {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Link href="/">
          <Image src="/orca-logo.svg" alt="ORCA Logo" width={48} height={48} style={{ marginRight: 16 }} />
        </Link>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800 }}>
          ORCA SCM Platform
        </Typography>
        <Link href="/Dashboard" style={{ color: '#fff', textDecoration: 'none', marginRight: 24 }}>Dashboard</Link>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
      </Toolbar>
    </AppBar>
  );
} 