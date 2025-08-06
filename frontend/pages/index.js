import Link from 'next/link';
import React, { useState } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FeatureCard from '../src/components/FeatureCard';

export default function Home() {
  const [openTourDialog, setOpenTourDialog] = useState(false);

  const handleOpenTourDialog = () => {
    setOpenTourDialog(true);
  };

  const handleCloseTourDialog = () => {
    setOpenTourDialog(false);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #0a2540 30%, #00bcd4 90%)',
          color: 'white',
          textAlign: 'center',
          padding: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Revolutionizing Supply Chain with AI & Web3
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            Experience unparalleled transparency, efficiency, and security in your logistics operations.
          </Typography>
          <Button variant="contained" color="secondary" size="large" component={Link} href="/Dashboard" sx={{ mt: 4, mr: 2 }}>
            Go to Dashboard
          </Button>
          <Button variant="outlined" color="inherit" size="large" onClick={handleOpenTourDialog} sx={{ mt: 4, borderColor: 'white', color: 'white' }}>
            Start Tour
          </Button>
        </Container>
      </Box>

      {/* Feature Showcase Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              title="AI-Powered Delay Prediction"
              description="Leverage machine learning to accurately predict shipment delays and proactively manage risks."
              icon="Science"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              title="Web3 & IPFS Integration"
              description="Ensure unparalleled transparency and data integrity with blockchain and decentralized storage."
              icon="AccountTree"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              title="Real-time Oracle Integration"
              description="Incorporate external data like weather and GPS for enhanced tracking and decision-making."
              icon="Cloud"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              title="DAO Governance"
              description="Participate in community-driven decisions and shape the future of the platform."
              icon="HowToVote"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              title="Inventory Vision"
              description="Utilize computer vision to accurately count and manage inventory, reducing manual errors."
              icon="Visibility"
            />
          </Grid>
        </Grid>
      </Container>

      {/* Why Web3? Section */}
      <Box sx={{ background: '#f5f5f5', py: 8 }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h3" component="h2" gutterBottom>
            Why Web3 for Supply Chain?
          </Typography>
          <Typography variant="body1" paragraph>
            Traditional supply chains often suffer from a lack of transparency, data silos, and susceptibility to fraud. ORCA leverages Web3 technologies like blockchain and IPFS to fundamentally transform these challenges.
          </Typography>
          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Enhanced Transparency</Typography>
                <Typography variant="body2">Every transaction and data point is immutably recorded on a decentralized ledger, visible to all authorized participants.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Data Integrity & Security</Typography>
                <Typography variant="body2">IPFS ensures secure, tamper-proof storage of critical documents and metadata, protecting against unauthorized alterations.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Reduced Fraud & Disputes</Typography>
                <Typography variant="body2">The verifiable nature of blockchain transactions minimizes opportunities for fraud and streamlines dispute resolution.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Real-time Insights Section (Placeholder) */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Real-time Insights
        </Typography>
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>150</Typography>
              <Typography variant="body1">Shipments Currently in Transit</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h4" color="secondary" gutterBottom>98.5%</Typography>
              <Typography variant="body1">On-Time Delivery Rate (Last 30 Days)</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button variant="outlined" size="large" component={Link} href="/Dashboard">
            View Detailed Analytics
          </Button>
        </Box>
      </Container>

      {/* Tour Dialog */}
      <Dialog open={openTourDialog} onClose={handleCloseTourDialog}>
        <DialogTitle>Welcome to the ORCA Tour!</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This interactive tour would guide you through the key sections of the ORCA homepage and dashboard.
            You would learn about:
          </Typography>
          <ul>
            <li>The AI-powered delay prediction system.</li>
            <li>How Web3 and IPFS ensure data transparency and security.</li>
            <li>Real-time oracle integrations for enhanced tracking.</li>
            <li>The DAO governance model for community participation.</li>
            <li>And much more!</li>
          </ul>
          <Typography>
            For a full implementation, this would involve a step-by-step overlay, highlighting different elements and providing contextual information.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTourDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}