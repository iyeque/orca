import React from 'react';
import { Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

export default function AnimatedCard({ children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.03 }}
      style={{ marginBottom: 24 }}
    >
      <Card {...props} elevation={4}>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
} 