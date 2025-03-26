import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import { 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box, 
  Alert,
  Snackbar 
} from '@mui/material';
import L from 'leaflet';
import styled from 'styled-components';
import { getRegionFromCoordinates } from '../utils/locationUtils';
import FilterBar from './FilterBar';
import RecentHarms from './RecentHarms';
import Resources from './Resources';
import { Slider, Chip, Typography, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import { useIncident } from '../context/IncidentContext';


const MapEvents = ({ isAddingMode, setTempMarker, setNewIncident, setShowForm }) => {
  useMapEvents({
    click(e) {
      if (isAddingMode) {
        const { lat, lng } = e.latlng;
        setTempMarker({ latitude: lat, longitude: lng });
        setNewIncident(prev => ({
          ...prev,
          lat: lat,
          lng: lng
        }));
        setShowForm(true);
      }
    }
  });
  return null;
};

// Move SubmitButton definition to the top, outside of any component
const StyledSubmitButton = styled(Button)(({$isAddingMode}) => ({
  background: $isAddingMode 
    ? 'white'
    : 'linear-gradient(45deg, #FF1493, #FF69B4, #FFB6C1, #FFC0CB)',
  backgroundSize: '300% 300%',
  animation: $isAddingMode 
    ? 'none' 
    : 'gradient 2s ease infinite',
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  },
  color: $isAddingMode ? 'primary' : 'white',
  '&:hover': {
    background: $isAddingMode 
      ? 'white' 
      : 'linear-gradient(45deg, #FF69B4, #FFB6C1, #FFC0CB, #FF1493)',
  }
}));

const harmTypes = [
  { value: 'physical', label: '身体暴力' },
  { value: 'mental', label: '精神暴力' },
  { value: 'sexual', label: '性暴力' },
  { value: 'third_party', label: '借助第三方的暴力' },
  { value: 'cyber', label: '网络暴力' }
];

function Map({ supabase }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const { setSelectedIncident } = useIncident();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const [newIncident, setNewIncident] = useState({
    here_happened: '',
    feeling_score: 50,
    violence_type: [],
    description: '',
    scenario: {
      tags: [],
      praise: '',
      criticism: '',
      showPraise: false,
      showCriticism: false
    },
    lat: null,
    lng: null
  });

  const [showViolenceForm, setShowViolenceForm] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [nearbyStories, setNearbyStories] = useState([]);
  const [countdown, setCountdown] = useState(5);
  const scenarioTags = ['学校', '职场', '住所', '医院', '网络', '商超'];
  const violenceTypes = ['身体暴力', '精神暴力', '性暴力', '借助第三方的暴力', '网络暴力'];
  const handleCancel = () => {
    setIsAddingMode(false);
    setTempMarker(null);
    setShowForm(false);
    setNewIncident({
      here_happened: '',
      feeling_score: 0,
      violence_type: [],
      description: '',
      scenario: {
        tags: [],
        praise: '',
        criticism: '',
        showPraise: false,
        showCriticism: false
      },
      lat: null,
      lng: null
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [showNearbyStories, setShowNearbyStories] = useState(false);


  // 修改获取附近故事的函数，使用地理位置查询
  const fetchNearbyStories = async (lat, lng) => {
    try {
      // 这里可以使用地理位置查询，如果 Supabase 支持的话
      // 简化版本：获取最近创建的3条记录
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setNearbyStories(data || []);
      setShowNearbyStories(true);
    } catch (err) {
      console.error('获取附近故事失败:', err);
    }
  };

  // 添加刷新地图数据的函数
  const refreshIncidents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*');
      
      if (error) {
        console.error('Error fetching incidents:', error);
        return;
      }
      
      setIncidents(data || []);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 修改提交函数，提交后刷新地图
  const handleSubmit = async () => {
    if (!newIncident.lat || !newIncident.lng) {
      setError('请在地图上选择一个位置');
      return;
    }
  
    try {
      const { error: submitError } = await supabase
        .from('submissions')
        .insert([{
          ...newIncident,
          created_at: new Date().toISOString()
        }]);
      
      if (submitError) throw submitError;
  
      setSuccessMessage('💐 我们收到啦！');
      setShowSuccess(true);
      fetchNearbyStories(newIncident.lat, newIncident.lng);
      setCountdown(5);
      
      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowSuccess(false);
            setShowNearbyStories(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // 提交后刷新地图数据
      await refreshIncidents();
      
      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const getFeelingColor = (score) => {
    if (score <= -50) return '#f44336'; // Red
    if (score >= 50) return '#4caf50';  // Green
    return '#424242';                   // Dark grey
  };

  useEffect(() => {
    if (newIncident.feeling_score <= -50) {
      setShowViolenceForm(true);
      if (newIncident.feeling_score <= -90) {
        setShowEmergencyAlert(true);
      }
    } else {
      setShowViolenceForm(false);
      setShowEmergencyAlert(false);
    }

    
  }, [newIncident.feeling_score]);

  // Add this useEffect to fetch incidents when component mounts
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*');
        
        if (error) {
          console.error('Error fetching incidents:', error);
          return;
        }
        
        setIncidents(data || []);
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
      }
    };

    fetchIncidents();
  }, [supabase]);


  return (
    <div style={{ position: 'relative' }}>
      {showSuccess && (
        <Alert severity="success" style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {successMessage}
        </Alert>
      )}

      <StyledSubmitButton 
        variant={isAddingMode ? "outlined" : "contained"}
        onClick={() => setIsAddingMode(!isAddingMode)}
        $isAddingMode={isAddingMode}
        style={{ position: 'absolute', left: '20px', top: '20px', zIndex: 1000 }}
      >
        {isAddingMode ? 'Drop your pin' : 'Submit'}
      </StyledSubmitButton>

      <MapContainer
        center={[46.2276, 2.2137]}
        zoom={4}
        style={{ height: '70vh', width: '100%' }}
        minZoom={3}
        maxBounds={[[-90, -180], [90, 180]]}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
        />
        <ZoomControl position="topright" />
        <MapEvents 
          isAddingMode={isAddingMode}
          setTempMarker={setTempMarker}
          setNewIncident={setNewIncident}
          setShowForm={setShowForm}
        />
        
        {tempMarker && tempMarker.latitude && tempMarker.longitude && (
          <Marker 
            position={[tempMarker.latitude, tempMarker.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          />
        )}

        {incidents.map((incident) => (
          incident.lat && incident.lng ? (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={new L.Icon({
                // 根据情感分数选择不同颜色的标记
                iconUrl: incident.feeling_score <= -50 
                  ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                  : incident.feeling_score >= 50
                    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
                    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })}
              eventHandlers={{
                click: () => {
                  setSelectedIncident(incident);
                }
              }}
            >
              <Popup>
                <Typography 
                  variant="subtitle1" 
                  sx={{ color: getFeelingColor(incident.feeling_score) }}
                >
                  {incident.here_happened}
                </Typography>
                <Typography variant="body2">{incident.description}</Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ mt: 1 }}
                  onClick={() => {
                    localStorage.setItem('selectedIncident', JSON.stringify(incident));
                    setSelectedIncident(incident);
                    // Open with the exact URL to avoid path issues
                    window.open(`${process.env.PUBLIC_URL}/incident`, '_blank');
                  }}
                >
                  我想了解更多
                </Button>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
      
      {showForm && (
        <Box
          sx={{
            position: 'absolute',
            top: 60,
            left: 10,
            zIndex: 1000,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 1,
            width: '400px'
          }}
        >
          <Button 
            variant="contained" 
            color="info"
            halfWidth
            sx={{ mb: 2 }}
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    setTempMarker({ latitude, longitude });
                    setNewIncident(prev => ({
                      ...prev,
                      lat: latitude,
                      lng: longitude
                    }));
                  },
                  (error) => {
                    console.error("定位失败:", error);
                    setError("无法获取您的位置，请手动在地图上选择");
                  }
                );
              } else {
                setError("您的浏览器不支持地理定位");
              }
            }}
          >
            定位我的城市 🌆
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ whiteSpace: 'nowrap' }}>这里发生了...</Typography>
            <TextField
              fullWidth
              size="small"
              value={newIncident.here_happened}
              onChange={(e) => setNewIncident({...newIncident, here_happened: e.target.value})}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography gutterBottom>我的感受是</Typography>
              {/* 显示当前分数 */}
              <Typography variant="body2" color={newIncident.feeling_score < 0 ? "error" : "success"}>
                {newIncident.feeling_score}
              </Typography>
            </Box>
            <Slider
              value={newIncident.feeling_score}
              onChange={(e, value) => setNewIncident({...newIncident, feeling_score: value})}
              min={-100}
              max={100}
              marks={[
                { value: -100},
                { value: 0},
                { value: 100}
              ]}
              sx={{
                '& .MuiSlider-thumb': {
                  backgroundColor: '#fff',
                  border: '2px solid currentColor',
                },
                '& .MuiSlider-track': {
                  height: 8,
                  background: 'linear-gradient(90deg, #f44336, #808080)',
                },
                '& .MuiSlider-rail': {
                  height: 8,
                  background: 'linear-gradient(90deg, #f44336, #808080, #00a86b)',
                  opacity: 1
                }
              }}
            />
          </Box>

          {showViolenceForm && (
            <Box sx={{ mt: 2 }}>
              <Typography>这里发生了暴力吗？</Typography>
              <Typography sx={{ color: 'orange', fontSize: '0.8rem', mb: 1 }}>
                并不只有流血才是暴力
              </Typography>
              {violenceTypes.map(type => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => {
                    const newTypes = newIncident.violence_type.includes(type) 
                      ? newIncident.violence_type.filter(t => t !== type)
                      : [...newIncident.violence_type, type];
                    setNewIncident({...newIncident, violence_type: newTypes});
                  }}
                  color={newIncident.violence_type.includes(type) ? "primary" : "default"}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          )}

          {showEmergencyAlert && (
            <Alert severity="error" sx={{ mt: 2 }}>
              或许你现在需要帮助，这是一个可以打通的志愿电话：12334543
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Box sx={{ height: '24px', mb: 1 }}>
              <TypeAnimation
                sequence={[
                  '我觉得...',
                  2000,
                  '我看见...',
                  2000,
                  '我认为...',
                  2000
                ]}
                wrapper="span"
                speed={30}
                repeat={Infinity}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newIncident.description}
              onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
              placeholder="在这里描述你的经历"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>它发生在</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {scenarioTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => {
                    const newTags = newIncident.scenario.tags.includes(tag)
                      ? newIncident.scenario.tags.filter(t => t !== tag)
                      : [...newIncident.scenario.tags, tag];
                    setNewIncident({
                      ...newIncident, 
                      scenario: {...newIncident.scenario, tags: newTags}
                    });
                  }}
                  color={newIncident.scenario.tags.includes(tag) ? "primary" : "default"}
                />
              ))}
              
              {/* 添加点名批评和点名表扬的标签 */}
              <Chip
                key="criticism"
                label="点名批评选中这里👎"
                onClick={() => {
                  setNewIncident({
                    ...newIncident,
                    scenario: {
                      ...newIncident.scenario,
                      showCriticism: !newIncident.scenario.showCriticism,
                      // 如果取消选中，清空批评内容
                      criticism: !newIncident.scenario.showCriticism ? newIncident.scenario.criticism : ''
                    }
                  });
                }}
                color={newIncident.scenario.showCriticism ? "error" : "default"}
              />
              
              <Chip
                key="praise"
                label="点名表扬选中这里👍"
                onClick={() => {
                  setNewIncident({
                    ...newIncident,
                    scenario: {
                      ...newIncident.scenario,
                      showPraise: !newIncident.scenario.showPraise,
                      // 如果取消选中，清空表扬内容
                      praise: !newIncident.scenario.showPraise ? newIncident.scenario.praise : ''
                    }
                  });
                }}
                color={newIncident.scenario.showPraise ? "success" : "default"}
              />
            </Box>
          </Box>

          {/* 只有当showCriticism为true时才显示点名批评输入框 */}
          {newIncident.scenario.showCriticism && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="点名批评"
                value={newIncident.scenario.criticism}
                onChange={(e) => setNewIncident({
                  ...newIncident,
                  scenario: {...newIncident.scenario, criticism: e.target.value}
                })}
                size="small"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          
          {/* 只有当showPraise为true时才显示点名表扬输入框 */}
          {newIncident.scenario.showPraise && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="点名表扬"
                value={newIncident.scenario.praise}
                onChange={(e) => setNewIncident({
                  ...newIncident,
                  scenario: {...newIncident.scenario, praise: e.target.value}
                })}
                size="small"
              />
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
            <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
          </Box>
        </Box>
      )}

      <FilterBar />
      <RecentHarms incidents={incidents} />
      <Resources />
    </div>
  );
}

export default Map;