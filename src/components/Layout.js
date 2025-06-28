import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import Header from './Header';
import footerPixels from '../assets/images/footer_pixels.png';

function Layout({ children }) {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(false);
  const [isOverMap, setIsOverMap] = useState(true); // 默认认为Header在地图上方
  const footerLinks = {
    'Map': ['Page', 'Page', 'Page'],
    'Resources': ['Page', 'Page', 'Page'],
    'About': ['Page', 'Page', 'Page']
  };

  useEffect(() => {
    setShowHeader(true);
    setIsOverMap(location.pathname === '/');
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {showHeader && (
        <Header isOverMap={isOverMap} />
      )}
      <Container 
        maxWidth={false}
        disableGutters
        sx={{
          flex: 1,
          padding: 0,
          maxWidth: '100%',
          margin: 0,
          width: '100vw',
          paddingTop: isOverMap ? '0' : '80px',
          backgroundColor: 'transparent'
        }}
      >
        {children}
      </Container>
      <Box 
        component="footer" 
      >
       <Box sx={{ marginTop: '80px', marginBottom: '40px' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: 'balloon', 
              color: 'red', 
              textAlign: 'center',
              marginBottom: '40px',
              fontSize: '3rem'
            }}
          >
            Archive of the Sino Women's Diaspora
          </Typography>
          
          <Typography 
            sx={{ 
              color: 'red', 
              textAlign: 'justify',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            In the public space, we are targets of harassment; in the healthcare system, our needs are ignored; and in social interactions, we are marginalised or alienated as part of a stereotype. We refuse to be silent because speaking out about our experiences is a form of resistance. When discrimination and oppression go unspoken, they are hidden, rationalised and become part of the daily grind. And when we naming it, we break the silence and not only make our own experiences visible, but fight for space for the wider community.Therefore, we created this platform to anonymously collect and share the real experiences of Chinese diaspora women in their new environment.We believe that the accumulation of personal experiences translates into possibilities for more powerful social action, such as Annual Anti-Discrimination Day, connecting with local anti-discrimination organisations to prompt policy improvements.Street actions and marches - Speak out in public spaces to challenge stereotypes and resist racialised gender violence.Possibilities of Performance Art - Intervening in urban spaces with the body, breaking down the invisible oppression of the everyday, using art as a form of resistance
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;