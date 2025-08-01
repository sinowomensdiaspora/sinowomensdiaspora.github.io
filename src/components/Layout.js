import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [isOverMap, setIsOverMap] = useState(true);
  const isStartupPage = location.pathname === '/';
  const isArchivePage = location.pathname === '/archive';
  const isActionPage = location.pathname === '/action' || location.pathname.startsWith('/action/');

  useEffect(() => {
    setShowHeader(!isStartupPage && !isArchivePage);
    setIsOverMap(location.pathname === '/map' || location.pathname === '/archive' || isActionPage);
  }, [location, isStartupPage, isArchivePage, isActionPage]);

  // Footer component
  const Footer = () => {
    const navigate = useNavigate();

    const menuItems = [
      { text: '写故事', link: '/map' },
      { text: '故事档案', link: '/archive' },
      { text: '行动', link: '/action' },
      { text: '工具箱', link: '/resources' },
      { text: '关于我们', link: '/about'}
    ];

    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          width: '100%',
          padding: 3,
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 3, md: 6 },
          backdropFilter: isArchivePage ? 'none' : 'blur(30px)'
        }}
      >
        {menuItems.map((item, index) => (
          <Typography
            key={index}
            onClick={() => navigate(item.link)}
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: '#000',
              cursor: 'pointer',
              fontFamily: 'SimHei, sans-serif',
              fontWeight: location.pathname === item.link ? 'bold' : 'normal',
              transition: 'font-weight 0.2s ease',
              '&:hover': {
                fontWeight: 'bold'
              }
            }}
          >
            {item.text}
          </Typography>
        ))}
      </Box>
    );
  };

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
          paddingTop: isStartupPage ? '0' : (isOverMap ? '0' : '10vh'),
          paddingBottom: isStartupPage ? '0' : (isOverMap ? '0' : '80px'),
          backgroundColor: 'transparent'
        }}
      >
        {children}
      </Container>

      {/* Show footer for archive page */}
      {isArchivePage && <Footer />}
    </Box>
  );
}

export default Layout;
