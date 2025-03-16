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

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const RainbowButton = styled(Button)({
    background: 'linear-gradient(45deg, #FF0018, #FFA52C, #FFFF41, #008018, #0000F9, #86007D)',
    backgroundSize: '300% 300%',
    animation: 'gradient 20s ease infinite',
    color: 'white',
    '@keyframes gradient': {
      '0%': {
        backgroundPosition: '0% 50%'
      },
      '50%': {
        backgroundPosition: '100% 50%'
      },
      '100%': {
        backgroundPosition: '0% 50%'
      }
    },
    '&:hover': {
      background: 'linear-gradient(45deg, #86007D, #0000F9, #008018, #FFFF41, #FFA52C, #FF0018)',
    }
  });

  const menuItems = [
    { text: 'Map', link: '/' },
    { text: 'Action', link: '/action' },
    { text: 'Resources', link: '/resources' },
    { text: 'About', link: '/about'}
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'white',
        color: 'black',
        boxShadow: 'none',
        borderBottom: '1px solid #eaeaea'
      }}
    >
      <Container maxWidth={false}>
        <Toolbar sx={{ padding: { xs: '0 16px', md: '0 24px' } }}>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              mr: 2,
              display: { sm: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600
            }}
          >
            Chinese Women Diaspora
          </Typography>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Typography
                key={item.text}
                component={Link}
                to={item.link}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {item.text}
              </Typography>
            ))}
            <RainbowButton
              component={Link}
              to="/oneofus"
              variant="contained"
              size="small"
            >
              One of Us
            </RainbowButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List sx={{ width: 250 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.link}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Header;