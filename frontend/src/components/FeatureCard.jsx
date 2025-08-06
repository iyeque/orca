import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

export default function FeatureCard({ title, description, icon }) {
  const IconComponent = MuiIcons[icon + 'Icon'];

  return (
    <Card
      sx={{
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #e0f7fa', // Light blue border
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 20px rgba(0, 188, 212, 0.2)', // Cyan shadow on hover
        },
      }}
    >
      <CardContent>
        {IconComponent && (
          <Box sx={{ mb: 2, color: 'primary.main' }}>
            <IconComponent sx={{ fontSize: 48 }} />
          </Box>
        )}
        <Typography variant="h5" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
