import React from 'react';
import { Select, MenuItem, Box, Typography } from '@mui/material';

function FilterBar({ onRegionChange, onMoodChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', borderRadius: '8px' }}>
      <Typography 
        sx={{ 
          fontFamily: 'balloon', 
          color: 'red',
          marginRight: '10px',
          fontSize: '1.5rem'
        }}
      >
        filter by... region
      </Typography>
      <Select
        size="small"
        displayEmpty
        defaultValue=""
        onChange={onRegionChange}
        sx={{ 
          width: '120px', 
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'balloon',
          color: 'red',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
          },
          '& .MuiSelect-icon': {
            color: 'red'
          }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              '& .MuiMenuItem-root': {
                fontFamily: 'balloon',
                color: 'red'
              }
            }
          }
        }}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        <MenuItem value="china">中国</MenuItem>
        <MenuItem value="usa">美国</MenuItem>
        <MenuItem value="france">法国</MenuItem>
        <MenuItem value="uk">英国</MenuItem>
        <MenuItem value="japan">日本</MenuItem>
      </Select>
      
      <Typography 
        sx={{ 
          fontFamily: 'balloon', 
          color: 'red',
          marginLeft: '20px',
          marginRight: '10px',
          fontSize: '1.5rem'
        }}
      >
        mood
      </Typography>
      
      <Select
        size="small"
        displayEmpty
        defaultValue=""
        onChange={onMoodChange}
        sx={{ 
          width: '150px', 
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'balloon',
          color: 'red',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
          },
          '& .MuiSelect-icon': {
            color: 'red'
          }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              '& .MuiMenuItem-root': {
                fontFamily: 'balloon',
                color: 'red'
              }
            }
          }
        }}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        <MenuItem value="physical">身体暴力</MenuItem>
        <MenuItem value="mental">精神暴力</MenuItem>
        <MenuItem value="sexual">性暴力</MenuItem>
        <MenuItem value="third_party">借助第三方的暴力</MenuItem>
        <MenuItem value="cyber">网络暴力</MenuItem>
      </Select>
    </Box>
  );
}

export default FilterBar;