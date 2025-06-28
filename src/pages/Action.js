import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Action() {
  return (
    <Container maxWidth="md" sx={{ padding:20, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        努力实现中 orzz
      </Typography>
      <Typography variant="body1">
        This page is under construction.
        It really is.
      </Typography>
    </Container>
  );
}

export default Action;