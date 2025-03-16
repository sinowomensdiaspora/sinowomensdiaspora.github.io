import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

function RecentHarms({ incidents }) {
  const recentIncidents = incidents
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const getHarmTypeLabel = (type) => {
    const types = {
      1: '肢体暴力',
      2: '语言暴力',
      3: '冷暴力',
      4: '其他'
    };
    return types[type] || '未知';
  };

  return (
    <Paper sx={{ p: 2, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Incidents
      </Typography>
      <List>
        {recentIncidents.map((incident) => (
          <ListItem key={incident.id}>
            <ListItemText
              primary={`${getHarmTypeLabel(incident.harm_level)} - ${incident.region || '未知地区'}`}
              secondary={incident.story}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default RecentHarms;