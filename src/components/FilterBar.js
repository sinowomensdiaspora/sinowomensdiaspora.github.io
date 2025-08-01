import React, { useState } from 'react';
import { Select, MenuItem, Box, Typography, TextField, useMediaQuery, useTheme, Chip, Collapse, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function FilterBar({ onRegionChange, onMoodChange }) {
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedViolenceType, setSelectedViolenceType] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleRegionChange = (event) => {
    const value = event.target.value;
    setSelectedRegion(value);
    onRegionChange(event);
  };

  const handleViolenceTypeChange = (event) => {
    const value = event.target.value;
    setSelectedViolenceType(value);
    onMoodChange(event);
  };

  const getRegionLabel = (value) => {
    const regions = {
      '': '全部',
      'china': '中国',
      'usa': '美国',
      'france': '法国',
      'uk': '英国',
      'japan': '日本'
    };
    return regions[value] || '全部';
  };

  const getViolenceTypeLabel = (value) => {
    const types = {
      '': '全部',
      'physical': '身体暴力',
      'mental': '精神暴力',
      'sexual': '性暴力',
      'third_party': '借助第三方的暴力',
      'cyber': '网络暴力'
    };
    return types[value] || '全部';
  };

  if (isMobile) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          margin: '0',
          width: '100%',
          position: 'sticky',
          top: '60px',
          zIndex: 200
        }}
      >
        {/* Mobile Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <SearchIcon sx={{ color: '#666', fontSize: '20px' }} />
            <TextField
              size="small"
              placeholder="搜索你的那只气球"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  '& fieldset': { border: 'none' },
                  '& input': {
                    padding: '8px 12px',
                    fontSize: '16px',
                    color: '#333'
                  }
                }
              }}
            />
          </Box>

          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              color: '#666',
              backgroundColor: 'transparent',
            }}
          >
            <FilterListIcon />
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Mobile Filters */}
        <Collapse in={isExpanded}>
          <Box sx={{ p: 2, pt: 0 }}>
            {/* Active Filters Display */}
            {(selectedRegion || selectedViolenceType) && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedRegion && (
                  <Chip
                    label={`位置: ${getRegionLabel(selectedRegion)}`}
                    onDelete={() => {
                      setSelectedRegion('');
                      onRegionChange({ target: { value: '' } });
                    }}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,0,93,0.1)',
                      color: '#333',
                      '& .MuiChip-deleteIcon': {
                        color: '#ff005d'
                      }
                    }}
                  />
                )}
                {selectedViolenceType && (
                  <Chip
                    label={`类型: ${getViolenceTypeLabel(selectedViolenceType)}`}
                    onDelete={() => {
                      setSelectedViolenceType('');
                      onMoodChange({ target: { value: '' } });
                    }}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,0,93,0.1)',
                      color: '#333',
                      '& .MuiChip-deleteIcon': {
                        color: '#ff005d'
                      }
                    }}
                  />
                )}
              </Box>
            )}

            {/* Filter Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '14px', color: '#666', mb: 1, fontWeight: 'bold' }}>
                  🎈 位置
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '8px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff005d'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff005d'
                    }
                  }}
                >
                  <MenuItem value="">全部位置</MenuItem>
                  <MenuItem value="china">中国</MenuItem>
                  <MenuItem value="usa">美国</MenuItem>
                  <MenuItem value="france">法国</MenuItem>
                  <MenuItem value="uk">英国</MenuItem>
                  <MenuItem value="japan">日本</MenuItem>
                </Select>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '14px', color: '#666', mb: 1, fontWeight: 'bold' }}>
                  🎈 暴力类型
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={selectedViolenceType}
                  onChange={handleViolenceTypeChange}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '8px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff005d'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff005d'
                    }
                  }}
                >
                  <MenuItem value="">全部类型</MenuItem>
                  <MenuItem value="physical">身体暴力</MenuItem>
                  <MenuItem value="mental">精神暴力</MenuItem>
                  <MenuItem value="sexual">性暴力</MenuItem>
                  <MenuItem value="third_party">借助第三方的暴力</MenuItem>
                  <MenuItem value="cyber">网络暴力</MenuItem>
                </Select>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>
    );
  }

  // Desktop version
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        margin: '0 auto',
        maxWidth: '1000px'
      }}
    >

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: '8px', height: '8px', backgroundColor: 'red', borderRadius: '50%' }} />
        <Typography sx={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>位置</Typography>
        <Select
          size="small"
          displayEmpty
          value={selectedRegion}
          onChange={handleRegionChange}
          IconComponent={ArrowDropDownIcon}
          sx={{
            minWidth: '80px',
            fontSize: '14px',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': {
              padding: '4px 8px',
              color: '#333',
              textDecoration: 'underline',
              textDecorationColor: 'red'
            }
          }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="china">中国</MenuItem>
          <MenuItem value="usa">美国</MenuItem>
          <MenuItem value="france">法国</MenuItem>
          <MenuItem value="uk">英国</MenuItem>
          <MenuItem value="japan">日本</MenuItem>
        </Select>
      </Box>

      {/* Violence Type Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: '8px', height: '8px', backgroundColor: 'red', borderRadius: '50%' }} />
        <Typography sx={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>暴力类型</Typography>
        <Select
          size="small"
          displayEmpty
          value={selectedViolenceType}
          onChange={handleViolenceTypeChange}
          IconComponent={ArrowDropDownIcon}
          sx={{
            minWidth: '80px',
            fontSize: '14px',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': {
              padding: '4px 8px',
              color: '#333',
              textDecoration: 'underline',
              textDecorationColor: 'red'
            }
          }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="physical">身体暴力</MenuItem>
          <MenuItem value="mental">精神暴力</MenuItem>
          <MenuItem value="sexual">性暴力</MenuItem>
          <MenuItem value="third_party">借助第三方的暴力</MenuItem>
          <MenuItem value="cyber">网络暴力</MenuItem>
        </Select>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon sx={{ color: '#666', fontSize: '18px' }} />
        <TextField
          size="small"
          placeholder="搜索你的那只气球"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              border: 'none',
              '& fieldset': { border: 'none' },
              '& input': {
                padding: '4px 8px',
                fontSize: '14px',
                color: '#333'
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default FilterBar;