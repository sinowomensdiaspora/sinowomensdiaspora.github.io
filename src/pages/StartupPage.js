import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import backgroundImage from '../assets/images/background.png';

function StartupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: '写故事', path: '/map' },
    { label: '故事档案', path: '/archive' },
    { label: '行动', path: '/action' },
    { label: '工具箱', path: '/resources' },
    { label: '关于我们', path: '/about' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Pink gradient overlay - top 20% */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '70vh',
          background: 'linear-gradient(to bottom, rgba(255, 0, 94, 1) 0%, transparent 100%)',
          zIndex: 2
        }}
      />

      {/* Background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
          textAlign: 'center'
        }}
      >
        <Typography
          sx={{
            fontFamily: 'balloon',
            fontSize: '4rem',
            fontWeight: 'bold',
            color: '#000',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            textAlign: 'center'
          }}
        >
          Archive of the<br />
          Sino Women's<br />
          Diaspora
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '30vh',
          right: '50vh',
          zIndex: 3
        }}
      >
        <Typography
          sx={{
            fontSize: '1rem',
            color: '#000',
            fontFamily: 'SimHei, sans-serif'
          }}
        >
          记录即反抗
        </Typography>
      </Box>

      {/* Bottom menu */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          width: '100%',
          padding: 3,
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 3, md: 6 }
        }}
      >
        {menuItems.map((item, index) => (
          <Typography
            key={index}
            onClick={() => navigate(item.path)}
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: '#000',
              cursor: 'pointer',
              fontFamily: 'SimHei, sans-serif',
              fontWeight: location.pathname === item.path ? 'bold' : 'normal',
              transition: 'font-weight 0.2s ease',
              '&:hover': {
                fontWeight: 'bold'
              }
            }}
          >
            {item.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default StartupPage;
