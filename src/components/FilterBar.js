import React from 'react';
import { Paper, TextField, Select, MenuItem, Box } from '@mui/material';

function FilterBar({ onFilter }) {
  return (
    <Paper sx={{ p: 2, my: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="关键词搜索"
          size="small"
          sx={{ flex: 1 }}
        />
        <Select
          size="small"
          label="感受程度"
          sx={{ width: 150 }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value={1}>Good</MenuItem>
          <MenuItem value={2}>Medium</MenuItem>
          <MenuItem value={3}>Bad</MenuItem>
        </Select>
        <Select
          size="small"
          label="伤害类型"
          sx={{ width: 150 }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value={1}>肢体暴力</MenuItem>
          <MenuItem value={2}>语言暴力</MenuItem>
          <MenuItem value={3}>冷暴力</MenuItem>
          <MenuItem value={4}>其他</MenuItem>
        </Select>
        <TextField
          label="地区"
          size="small"
          sx={{ width: 150 }}
        />
      </Box>
    </Paper>
  );
}

export default FilterBar;