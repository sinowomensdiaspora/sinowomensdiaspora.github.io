import React, { useEffect, useState } from 'react';
import { Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import styled from 'styled-components';
import markerIcon from '../assets/map_marker/regular-marker.png';
import dbImage from '../assets/images/db.png';

// Helper function to generate random gap between 3px and 15px
const getRandomGap = () => Math.floor(Math.random() * 13) + 3; // 3-15px

// Helper function to generate evenly distributed positions for scattered layout
function generateRandomPositions(count, containerWidth = 900, containerHeight = 600, margin = 30) {
  const positions = [];
  const balloonWidth = 120; // 气球宽度
  const balloonHeight = 180; // 气球高度
  
  // 计算可用空间
  const availableWidth = containerWidth - margin * 2;
  const availableHeight = containerHeight - margin * 2;
  
  // 创建网格来确保均匀分布
  const cols = Math.ceil(Math.sqrt(count * availableWidth / availableHeight));
  const rows = Math.ceil(count / cols);
  
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;
  
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    // 网格内随机定位
    const cellMargin = Math.min(cellWidth, cellHeight) * 0.05;
    const randomRange = Math.min(cellWidth, cellHeight) * 0.25;
    const x = margin + col * cellWidth + cellMargin + Math.random() * (cellWidth - balloonWidth - cellMargin * 2);
    const y = margin + row * cellHeight + cellMargin + Math.random() * (cellHeight - balloonHeight - cellMargin * 2);
    
    // 随机偏移
    const offsetX = (Math.random() - 0.5) * randomRange;
    const offsetY = (Math.random() - 0.5) * randomRange;
    
    positions.push({
      x: Math.max(margin, Math.min(x + offsetX, containerWidth - balloonWidth - margin)),
      y: Math.max(margin, Math.min(y + offsetY, containerHeight - balloonHeight - margin))
    });
  }
  
  return positions;
};

const BalloonContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  minHeight: '60vh',
  padding: '5px',
  marginTop: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}));

const Balloon = styled(Box)(({ isMobile }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  color: 'red',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'all 0.3s ease-in-out',
  padding: isMobile ? '8px' : '10px',
  backgroundColor: 'transparent',
  zIndex: 1,
  '&:hover': {
    transform: 'scale(1.1)',
    zIndex: 2
  }
}));

// 气球图标组件
const BalloonIcon = styled('img')(({ isMobile }) => ({
  width: isMobile ? '90px' : '75px',
  height: isMobile ? '120px' : '105px',
  position: isMobile ? 'flex':'absolute',
  top: isMobile ? '0px' : '-60px',
  filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))',
}));
const ScatteredContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '650px',
  padding: '10px',
  backgroundImage: `url(${dbImage})`,
  backgroundPosition: 'bottom right',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'auto 40%'
}));

const MobileGalleryContainer = styled(Box)(() => ({
  display: 'flex',
  overflowX: 'auto',
  overflowY: 'hidden',
  width: '100%',
  padding: '10px 0',
  gap: '15px',
  '&::-webkit-scrollbar': {
    height: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#ff0000',
    borderRadius: '3px'
  }
}));

const ScatteredBalloon = styled(Box)(({ position }) => ({
  position: 'absolute',
  left: position.x,
  top: position.y,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  color: 'red',
  textAlign: 'center',
  transition: 'all 0.3s ease-in-out',
  padding: '10px',
  backgroundColor: 'transparent',
  zIndex: 1,
  width: '20%',
  maxWidth: '200px',
  minWidth: '120px',
  '&:hover': {
    transform: 'scale(1.03)',
    zIndex: 1
  }
}));

const MobileBalloon = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  color: 'red',
  textAlign: 'center',
  padding: '8px',
  backgroundColor: 'transparent',
  width: '20%',
  maxWidth: '150px',
  minWidth: '120px',
  flexShrink: 0
}));

function RecentHarms({ incidents = [] }) {
  const [balloons, setBalloons] = useState([]);
  const [positions, setPositions] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    console.log('RecentHarms received incidents:', incidents);
    if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
      console.log('No incidents available for RecentHarms');
      return;
    }

    const sorted = [...incidents].sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || a.created_at || 0;
      const dateB = b.updatedAt || b.createdAt || b.created_at || 0;
      return new Date(dateB) - new Date(dateA);
    });
    const selected = sorted.slice(0, Math.min(6, incidents.length));

    const balloonData = selected.map((incident, index) => {
      return {
        id: incident.id || index,
        color: 'red', // 统一使用红色
        location: incident.region || incident.here_happened || 'recent news',
        story: incident.story || incident.description ||"",
        iconTitleGap: getRandomGap() // Random gap for each balloon
      };
    });
    setBalloons(balloonData);
    
    // 为桌面端生成随机位置
    if (!isMobile) {
      setPositions(generateRandomPositions(balloonData.length));
    }
  }, [incidents]);

  return (
    <BalloonContainer>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        width: '100%',
        maxWidth: '1400px',
        mt: 3,
        gap: 2
      }}>
        <Box sx={{ 
          backgroundColor: 'white', 
          width: isMobile ? '100%' : '33.33%',
          minWidth: isMobile ? 'auto' : '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Box sx={{ py: 0 }}>
            <Typography variant="h3" sx={{ color: 'red', fontFamily: 'sans-serif'}}>
              Listen,
            </Typography>
            <Typography variant="h3" sx={{ color: '#2C2C2C', fontFamily: 'sans-serif'}}>
              What Does Asian Say?
            </Typography>
          </Box>
        </Box>
        {isMobile ? (
          // 移动端横向滚动布局
          <MobileGalleryContainer sx={{ width: '100%' }}>
            {balloons.map((balloon) => (
              <MobileBalloon key={balloon.id}>
                <BalloonIcon src={markerIcon} alt="marker" isMobile={true} />
                <Typography 
                  sx={{ 
                    fontFamily: 'balloon', 
                    color: '#ff0000',
                    marginTop: `${balloon.iconTitleGap}px`,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  {balloon.location}
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#ff0000',
                    fontSize: '0.9rem',
                    marginTop: '3px',
                    whiteSpace: 'pre-line',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    maxHeight: '60px',
                    width: '100%'
                  }}
                >
                  {balloon.story}
                </Typography>
              </MobileBalloon>
            ))}
          </MobileGalleryContainer>
        ) : (
          <ScatteredContainer sx={{ width: '66.67%' }}>
            {balloons.map((balloon, index) => (
              <ScatteredBalloon 
                key={balloon.id}
                position={positions[index] || { x: 0, y: 0 }}
              >
                <BalloonIcon src={markerIcon} alt="marker" isMobile={false} />
                <Typography 
                  sx={{ 
                    fontFamily: 'balloon', 
                    color: '#ff0000',
                    marginTop: `0px`,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  {balloon.location}
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#ff0000',
                    fontSize: '0.8rem',
                    marginTop: '3px',
                    whiteSpace: 'pre-line',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    maxHeight: '80px',
                    width: '100%'
                  }}
                >
                  {balloon.story}
                </Typography>
              </ScatteredBalloon>
            ))}
          </ScatteredContainer>
        )}
      </Box>
    </BalloonContainer>
  );
}

export default RecentHarms;