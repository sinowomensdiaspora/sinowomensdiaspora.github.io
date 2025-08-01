import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import styled from 'styled-components';

function Header({ isOverMap }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const requiresTransparent = location.pathname === '/action' || location.pathname.startsWith('/action/') || location.pathname.startsWith('/about');

  const menuItems = [
    { text: '写故事', link: '/map' },
    { text: '故事档案', link: '/archive' },
    { text: '行动', link: '/action' },
    { text: '工具箱', link: '/resources' },
    { text: '关于我们', link: '/about'}
  ];

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '20vh',
          background: 'linear-gradient(to bottom, rgba(255, 107, 157, 0.5) 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
      
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(to bottom,rgba(255, 0, 93, 0.80),rgba(253, 68, 77, 0.49), transparent)',
          backdropFilter: 'blur(10px)',
          color: 'red',
          boxShadow: 'none',
          zIndex: 1100,
          height: '10vh'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar sx={{ padding: { xs: '0 16px', md: '0 24px' }, justifyContent: 'center' }}>
            <Typography 
              variant="h2" 
              component={Link} 
              to="/"
              sx={{ 
                textDecoration: 'none',
                color: '#000',
                fontFamily: 'balloon',
                fontSize: { xs: '1.5rem', md: '3rem' },
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Archive of the Sino<br />
              Women's Diaspora
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      {/* footer */}
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
          backdropFilter: requiresTransparent ? 'none' : 'blur(30px)'
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
    </>
  );
}

export default Header;
