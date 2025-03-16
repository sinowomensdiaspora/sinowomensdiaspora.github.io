import React from 'react';
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import Header from './Header';

function Layout({ children }) {
  const footerLinks = {
    'Map': ['Page', 'Page', 'Page'],
    'Resources': ['Page', 'Page', 'Page'],
    'About': ['Page', 'Page', 'Page']
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container 
        maxWidth={false}
        sx={{
          flex: 1,
          padding: { xs: 0, md: '0 24px' },
          maxWidth: { xs: '100%', md: '1200px' },
          margin: '0 auto'
        }}
      >
        {children}
      </Container>

      <Box sx={{ backgroundColor: '#f5f5f5', mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              Listen,
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              What Does Asian Say?
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box component="footer" sx={{ backgroundColor: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chinese Women Diaspora
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton color="inherit" size="small">
                  <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" size="small" href='https://www.instagram.com/unaverba2024/' target="_blank">
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Grid>

            {Object.entries(footerLinks).map(([category, links]) => (
              <Grid item xs={6} md={3} key={category}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {links.map((link, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;