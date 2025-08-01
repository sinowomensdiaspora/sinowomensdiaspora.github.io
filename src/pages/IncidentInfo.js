// Remove unused import
import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  IconButton,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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
  // 简化URL参数解析
  const getIdFromUrl = () => {
    // 尝试从hash中获取ID
    const hash = window.location.hash;
    console.log('Full hash:', hash);

    // 方法1: 从hash查询参数获取
    const queryStart = hash.indexOf('?');
    if (queryStart !== -1) {
      const queryString = hash.substring(queryStart + 1);
      console.log('Query string from hash:', queryString);
      const queryParams = new URLSearchParams(queryString);
      const hashId = queryParams.get('id');
      if (hashId) {
        console.log('ID from hash:', hashId);
        return hashId;
      }
    }

    // 方法2: 从search参数获取（备用）
    const searchParams = new URLSearchParams(window.location.search);
    const searchId = searchParams.get('id');
    if (searchId) {
      console.log('ID from search:', searchId);
      return searchId;
    }

    console.log('No ID found in URL');
    return null;
  };

  const id = getIdFromUrl();

  const { selectedIncident, setSelectedIncident } = useIncident();
  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [likedComments, setLikedComments] = useState({});

  // 安全地从localStorage获取数据的函数
  const getStoredIncident = (incidentId) => {
    try {
      const storageKey = `selectedIncident_${incidentId}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsedIncident = JSON.parse(storedData);
        // 验证数据完整性
        if (parsedIncident.id === incidentId) {
          return parsedIncident;
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  };

  // 清理localStorage的函数
  const clearStoredIncident = (incidentId) => {
    try {
      const storageKey = `selectedIncident_${incidentId}`;
      localStorage.removeItem(storageKey);
      // 也清理旧的通用key（向后兼容）
      localStorage.removeItem('selectedIncident');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };
  const fetchIncidentDetails = useCallback(async () => {
    const targetId = id || selectedIncident?.id;
    console.log('IncidentInfo - URL ID:', id);
    console.log('IncidentInfo - Selected Incident ID:', selectedIncident?.id);
    console.log('IncidentInfo - Target ID:', targetId);

    if (!targetId) {
      console.log('IncidentInfo - No target ID found');
      setLoading(false);
      return;
    }

    // 首先尝试从localStorage获取缓存数据
    const storedIncident = getStoredIncident(targetId);
    if (storedIncident) {
      setIncident(storedIncident);
      setSelectedIncident(storedIncident);
      setLoading(false);
      // 清理localStorage以避免内存泄漏
      clearStoredIncident(targetId);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      setIncident(data);
      setSelectedIncident(data);
    } catch (err) {
      console.error('获取事件详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, [id, selectedIncident?.id, supabase, setSelectedIncident]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

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
  
  const getFeelingColor = (score) => {
    if (score <= -50) return '#f44336'; // 红色
    if (score >= 50) return '#4caf50';  // 绿色
    return '#424242';                   // 深灰色
  };

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
      <Box sx={{ minHeight: '100vh', pt: 8, pb: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* 左侧小地图 */}
        <Box sx={{ width: '30vh', height: '30vh', flexShrink: 0 }}>
          <Paper elevation={1} sx={{ height: '100%', overflow: 'hidden', borderRadius: '8px' }}>
            {incident.lat && incident.lng && (
              <MapContainer
                center={[incident.lat, incident.lng]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={false}
                dragging={false}
                touchZoom={false}
                doubleClickZoom={false}
              >
                <TileLayer
                        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[incident.lat, incident.lng]}
                  icon={new L.Icon({
                    iconUrl: require('../assets/map_marker/regular-marker.png'),
                    iconSize: [60, 90],
                    iconAnchor: [10, 32]
                  })}
                />
              </MapContainer>
            )}
          </Paper>
        </Box>

        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                fontWeight: 'bold',
                fontSize: '2em',
                lineHeight: 1.3
              }}
            >
              {incident.here_happened}
            </Typography>

            {((Array.isArray(incident.violence_type) && incident.violence_type.length > 0) ||
              (incident.scenario && incident.scenario.tags && incident.scenario.tags.length > 0)) && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {/* 暴力类型标签 */}
                  {Array.isArray(incident.violence_type) && incident.violence_type.map((type, idx) => (
                    <Chip
                      key={`violence-${idx}`}
                      label={type}
                      size="small"
                      sx={{
                        bgcolor: 'transparent',
                        color: '#999',
                        fontSize: '12px',
                        height: '24px'
                      }}
                    />
                  ))}

                  {/* 场景标签 */}
                  {incident.scenario && incident.scenario.tags && incident.scenario.tags.map((tag, idx) => (
                    <Chip
                      key={`scenario-${idx}`}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: 'transparent',
                        color: 'black',
                        outline:'0.5px solid',
                        fontSize: '12px',
                        height: '24px'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

                  <Paper elevation={0} sx={{ p: 0, mb: 3, bgcolor: 'transparent' }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
              color: '#333'
            }}
          >
            {incident.description}
          </Typography>

          {/* 表扬内容 */}
          {incident.scenario && incident.scenario.showPraise && incident.scenario.praise && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#4caf50', fontSize: '14px' }}>
                点名表扬
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px' }}>{incident.scenario.praise}</Typography>
              </Paper>
            </Box>
          )}

          {/* 批评内容 */}
          {incident.scenario && incident.scenario.showCriticism && incident.scenario.criticism && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#f44336', fontSize: '14px' }}>
                点名批评
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbe9e7', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px' }}>{incident.scenario.criticism}</Typography>
              </Paper>
            </Box>
          )}
        </Paper>

        </Box>

      </Box>

      <Button
          component={Link}
          to="/map"
          sx={{
            mb: 2,
            borderRadius: '8px',
            color:'black',
            fontSize: '14px',
            padding: '6px 12px'
          }}
        >
          <span>←</span> 返回地图
        </Button>

      <Divider sx={{ my: 3 }} />

      {/* 评论区 */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.5em', fontWeight: 'bold' }}>
          留言:
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="分享你的想法和感受..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '14px',
              '& fieldset': {
                borderColor: '#999',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#666',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmitComment}
          disabled={submitting || !commentText.trim()}
          sx={{
            borderRadius: '8px',
            fontSize: '14px',
            bgcolor: '#666',
            '&:hover': {
              bgcolor: '#555',
            }
          }}
        >
          +
        </Button>

        {/* 评论列表 */}
        {comments.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {comments.map((comment, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid #666'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                    路人🚶‍♀️
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                    {formatDate(comment.created_at)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    color: '#333'
                  }}
                >
                  {comment.text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
          </Box>
        </Container>
      </Box>
  );
}

export default IncidentInfo;