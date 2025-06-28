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
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import styled from 'styled-components';

function Header({ isOverMap }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: 'stories', link: '/' },
    { text: 'action', link: '/action' },
    { text: 'resources', link: '/resources' },
    { text: 'contact us', link: '/about'}
  ];

  return (
    <AppBar 
      position={isOverMap ? "static" : "fixed"} 
      sx={{ 
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        color: 'red',
        boxShadow: 'none',
        zIndex: isOverMap ? 1000 : 1100
      }}
    >
      <Container maxWidth={false}>
        <Toolbar sx={{ padding: { xs: '0 16px', md: '0 24px' } }}>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              mr: 2,
              display: { sm: 'none' },
              color: 'red'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {!isOverMap && (
            <Typography 
              variant="h4" 
              component={Link} 
              to="/"
              sx={{ 
                flexGrow: 1,
                textDecoration: 'none',
                color: 'red',
                fontFamily: 'balloon',
                fontSize: '2rem'
              }}
            >
              Archive of the Chinese Women's Diaspora
            </Typography>
          )}
          {isOverMap && (
            <Box sx={{ flexGrow: 1 }}></Box>
          )}

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Typography
                key={item.text}
                component={Link}
                to={item.link}
                sx={{
                  textDecoration: 'none',
                  color: 'red',
                  fontFamily: 'balloon',
                  fontSize: '1.5rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {item.text}
              </Typography>
            ))}
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'white',
            color: 'red'
          }
        }}
      >
        <List sx={{ width: 250 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.link}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: 'red',
                fontFamily: 'balloon',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)'
                }
              }}
            >
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  sx: {
                    fontFamily: 'balloon',
                    color: 'red'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Header;