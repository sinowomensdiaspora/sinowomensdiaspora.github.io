// Remove unused import
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
  CircularProgress,
  IconButton,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
// Remove IncidentModal import since it's not used
import { useIncident } from '../context/IncidentContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import ReplyIcon from '@mui/icons-material/Reply';

// Create a custom theme with warmer colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // Purple for primary actions
    },
    secondary: {
      main: '#ff4081', // Pink for secondary actions
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Noto Sans", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          padding: '8px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

function IncidentInfo({ supabase }) {
  // Use URLSearchParams to get id from query parameter instead of useParams
  const { search } = window.location;
  const queryParams = new URLSearchParams(search);
  const id = queryParams.get('id');
  
  const { selectedIncident, setSelectedIncident } = useIncident();
  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [likedComments, setLikedComments] = useState({});

  // 尝试从 localStorage 获取数据
  const storedIncident = localStorage.getItem('selectedIncident');
  if (storedIncident) {
    const parsedIncident = JSON.parse(storedIncident);
    setSelectedIncident(parsedIncident);
    setIncident(parsedIncident);
    // 清除 localStorage
    localStorage.removeItem('selectedIncident');
  }
  useEffect(() => {
    const fetchIncidentDetails = async () => {
      if (!id && !selectedIncident?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', id || selectedIncident?.id)
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
  }, [selectedIncident, supabase]);

  // Update comments fetch to use id from query parameter or selectedIncident.id
  useEffect(() => {
    const fetchComments = async () => {
      if (!id && !selectedIncident?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('submission_id', id || selectedIncident?.id)
          .eq('visible', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error('获取评论失败:', err);
      }
    };

    fetchComments();
  }, [id, selectedIncident, supabase]); // Add id to dependency array

  // Update handleSubmitComment to use id from query parameter or selectedIncident.id
  const handleSubmitComment = async () => {
    const submissionId = id || selectedIncident?.id;
    if (!commentText.trim() || !submissionId) return;
    
    setSubmitting(true);
    try {
      const commentData = {
        submission_id: submissionId,
        text: commentText,
        visible: true
      };
      console.log(commentData);
      
      const { error } = await supabase
        .from('comments')
        .insert([commentData]);
      
      if (error) throw error;
      
      // 重新获取评论
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('visible', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setComments(data || []);
      setCommentText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('提交评论失败:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle reply to comment
  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    // Focus on the comment text field
    document.getElementById('comment-text-field').focus();
  };
  
  // Handle like comment
  const handleLikeComment = async (commentId) => {
    // Toggle like status locally for immediate feedback
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    
    // In a real app, you would update the like count in the database
    // For now, we'll just update the UI
  };
  
  // Get random emoji for avatar
  const getRandomEmoji = () => {
    const emojis = ['🌸', '🌼', '🌺', '🌻', '🌹', '🌷', '🍀', '🌿', '🌱', '🌵', '🌴', '🌲', '🌳'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

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
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default', minHeight: 'calc(100vh - 80px)' }}>
        <Button 
          component={Link} 
          to="/" 
          variant="outlined" 
          sx={{ 
            mb: 3, 
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <span>←</span> 返回地图
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
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                />
                <ZoomControl position="topright" />
                <Marker
                  position={[incident.lat, incident.lng]}
                  icon={new L.Icon({
                    iconUrl: require('../assets/map_marker/regular-marker.png'),
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
      <Paper elevation={3} sx={{ mt: 5, p: 0, borderRadius: '12px', boxShadow:0}}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ChatBubbleOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            一些想法 ({comments.length})
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4, position: 'relative', boxShadow:0 }}>
          {replyingTo && (
            <Box sx={{ 
              p: 1, 
              mb: 1, 
              bgcolor: 'rgba(156, 39, 176, 0.1)', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2">回复评论</Typography>
              <Button 
                size="small" 
                onClick={() => setReplyingTo(null)}
                sx={{ minWidth: 'auto', p: '4px' }}
              >
                取消
              </Button>
            </Box>
          )}
          <TextField
            id="comment-text-field"
            fullWidth
            multiline
            rows={3}
            placeholder={replyingTo ? "写下你的回复..." : "分享你的想法和感受..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSubmitComment}
            disabled={submitting || !commentText.trim()}
            sx={{ 
              borderRadius: '20px',
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
            }}
          >
            {submitting ? '提交中...' : replyingTo ? '发送回复' : '分享你的想法'}
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* 评论列表 */}
        {comments.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, boxShadow:0 }}>
            {comments.map((comment, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 0, 
                  borderRadius: '12px',
                  transition: 'transform 0.2s',
                  ml: comment.reply_to ? 4 : 0,
                }}
                elevation={1}
              >
                <CardContent sx={{ p: 2}}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', boxShadow: 0 }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: comment.reply_to ? 'hsla(19, 84.30%, 65.10%, 0.70)' : 'primary.main',
                        width: 48,
                        height: 48,
                        fontSize: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {comment.avatar_emoji || '🌼'}
                    </Avatar>
                    <Box sx={{ flex: 1, boxShadow:0}}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, boxShadow:0}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, boxShadow:0}}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            路人🚶‍♀️
                          </Typography>
                          {comment.reply_to && (
                            <Chip 
                              label="回复" 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(156, 39, 176, 0.1)', 
                                color: 'primary.main',
                                height: 20,
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mt: 1, 
                          mb: 2,
                          color: 'text.primary',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {comment.text}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 5, 
            px: 3, 
            bgcolor: 'rgba(156, 39, 176, 0.05)', 
            borderRadius: '12px',
            border: '1px dashed rgba(156, 39, 176, 0.3)'
          }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              如果你也有一些想法，我们需要你的声音
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
    </ThemeProvider>
  );
}

export default IncidentInfo;