import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip, 
  Button, 
  TextField,
  Avatar,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function IncidentInfo({ supabase }) {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 获取事件详情
  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setIncident(data);
      } catch (err) {
        console.error('获取事件详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentDetails();
  }, [id, supabase]);

  // 获取评论
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('submission_id', id)
          .eq('visible', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error('获取评论失败:', err);
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id, supabase]);

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          submission_id: id,
          text: commentText,
          visible: true
        }]);
      
      if (error) throw error;
      
      // 重新获取评论
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('submission_id', id)
        .eq('visible', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setComments(data || []);
      setCommentText('');
    } catch (err) {
      console.error('提交评论失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 获取情感颜色
  const getFeelingColor = (score) => {
    if (score <= -50) return '#f44336'; // 红色
    if (score >= 50) return '#4caf50';  // 绿色
    return '#424242';                   // 深灰色
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>加载中...</Typography>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">未找到事件</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          返回地图
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button component={Link} to="/" variant="outlined" sx={{ mb: 3 }}>
        返回地图
      </Button>
      
      <Grid container spacing={3}>
        {/* 左侧地图 */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ height: '400px', overflow: 'hidden' }}>
            {incident.lat && incident.lng && (
              <MapContainer
                center={[incident.lat, incident.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="topright" />
                <Marker
                  position={[incident.lat, incident.lng]}
                  icon={new L.Icon({
                    iconUrl: incident.feeling_score <= -50 
                      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                      : incident.feeling_score >= 50
                        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
                        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                  })}
                />
              </MapContainer>
            )}
          </Paper>
        </Grid>
        
        {/* 右侧事件详情 */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 2, 
                color: getFeelingColor(incident.feeling_score),
                fontWeight: 'bold'
              }}
            >
              {incident.here_happened}
            </Typography>
            
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                发布于 {formatDate(incident.created_at)}
              </Typography>
              <Chip 
                label={`感受温度: ${incident.feeling_score}`} 
                size="small"
                sx={{ 
                  bgcolor: getFeelingColor(incident.feeling_score),
                  color: 'white'
                }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
              {incident.description}
            </Typography>
            
            {/* 暴力类型 */}
            {Array.isArray(incident.violence_type) && incident.violence_type.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  暴力类型
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {incident.violence_type.map((type, idx) => (
                    <Chip 
                      key={idx} 
                      label={type} 
                      color="error" 
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* 场景标签 */}
            {incident.scenario && incident.scenario.tags && incident.scenario.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  发生场所
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {incident.scenario.tags.map((tag, idx) => (
                    <Chip 
                      key={idx} 
                      label={tag} 
                      color="primary" 
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* 表扬内容 */}
            {incident.scenario && incident.scenario.showPraise && incident.scenario.praise && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#4caf50' }}>
                  点名表扬
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f1f8e9' }}>
                  <Typography>{incident.scenario.praise}</Typography>
                </Paper>
              </Box>
            )}
            
            {/* 批评内容 */}
            {incident.scenario && incident.scenario.showCriticism && incident.scenario.criticism && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#f44336' }}>
                  点名批评
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbe9e7' }}>
                  <Typography>{incident.scenario.criticism}</Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* 评论区 */}
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          关于这件事 ({comments.length})
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="想法..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={handleSubmitComment}
            disabled={submitting || !commentText.trim()}
          >
            {submitting ? '提交中...' : '匿名发表评论'}
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* 评论列表 */}
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Avatar sx={{ mr: 2, bgcolor: '#9c27b0' }}>🌼</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">路人</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {comment.text}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            如果你关心这件事，请在这里分享你的想法💡
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default IncidentInfo;