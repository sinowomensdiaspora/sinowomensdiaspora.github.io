import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl, useMap } from 'react-leaflet';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import './Map.css';
import L from 'leaflet';
import styled from 'styled-components';
import { getRegionFromCoordinates, getAddressFromCoordinates } from '../utils/locationUtils';
import FilterBar from './FilterBar';
import RecentHarms from './RecentHarms';
import Contributors from './Contributors';
import { Slider, Chip, Typography, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import { useIncident } from '../context/IncidentContext';
import html2canvas from 'html2canvas';
import { Container } from 'react-bootstrap';


// 地图事件组件
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

// 地图控制组件，用于外部控制地图缩放
const MapController = ({ regionToFocus }) => {
  const map = useMap();

  React.useEffect(() => {
    if (regionToFocus && regionToFocus.center && regionToFocus.zoom) {
      map.flyTo(regionToFocus.center, regionToFocus.zoom, {
        duration: 1.0, // 动画持续时间（秒）
        easeLinearity: 0.25
      });
    }
  }, [map, regionToFocus]);

  return null;
};

// Move SubmitButton definition to the top, outside of any component
const StyledSubmitButton = styled(Button)(({ $isAddingMode }) => ({
  background: 'transparent',
  backgroundSize: '300% 300%',
  backgroundImage: $isAddingMode
    ? 'none'
    : `url(${require('../assets/map_marker/add-story.png')})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'contain',
  animation: 'none',
  position: 'static',
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  },
  color: $isAddingMode ? 'primary' : 'transparent',
  '&:hover': {
    background: 'transparent',
    backgroundImage: $isAddingMode
      ? 'none'
      : `url(${require('../assets/map_marker/add-story.png')})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
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
  // 添加地图区域状态
  const [mapRegionToFocus, setMapRegionToFocus] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const { setSelectedIncident } = useIncident();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const mapHeight = isMobile && showForm ? '60vh' : '70vh';

  // 添加回执弹窗状态
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const receiptRef = useRef(null);
  const [locationAddress, setLocationAddress] = useState('获取地址中...');
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

  // 添加气球ID搜索状态
  const [balloonIdSearch, setBalloonIdSearch] = useState('');
  const [searchError, setSearchError] = useState('');

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

  const handleCloseReceiptDialog = () => {
    setOpenReceiptDialog(false);
    handleCancel();
  };

  const [isLoading, setIsLoading] = useState(false);
  const [showNearbyStories, setShowNearbyStories] = useState(false);

  // Load incidents when component mounts
  useEffect(() => {
    refreshIncidents();
  }, []);

  const fetchNearbyStories = async (lat, lng) => {
    try {
      console.log('Fetching nearby stories for coordinates:', lat, lng);
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      let filteredData = data || [];
      if (lat && lng && filteredData.length > 0) {
        filteredData = filteredData.filter(story => {
          if (!story.lat || !story.lng) return false;
          const distance = Math.sqrt(
            Math.pow(story.lat - lat, 2) +
            Math.pow(story.lng - lng, 2)
          );
          return distance < 5; // 大约500公里左右
        });
      }

      console.log('Fetched nearby stories:', filteredData);
      setNearbyStories(filteredData);
      setShowNearbyStories(true);
    } catch (err) {
      console.error('获取附近故事失败:', err);
    }
  };

  // 添加刷新地图数据的函数
  const refreshIncidents = async () => {
    setIsLoading(true);
    try {
      console.log('Refreshing all incidents');
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incidents:', error);
        return;
      }

      console.log('Fetched incidents:', data?.length || 0);
      setIncidents(data || []);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newIncident.lat || !newIncident.lng) {
      setError('请在地图上选择一个位置');
      return;
    }

    try {
      const { error: submitError } = await supabase
        .from('submissions')
        .insert([{
          ...newIncident
        }]);

      if (submitError) throw submitError;

      setSuccessMessage('🕊️ 谢谢你的分享，它将推动改变发生。');
      setShowSuccess(true);
      // 确保tempMarker已设置，这样回执中可以显示地图
      if (!tempMarker && newIncident.lat && newIncident.lng) {
        setTempMarker({
          latitude: newIncident.lat,
          longitude: newIncident.lng
        });
      }
      // 获取地址信息
      setLocationAddress('获取地址中...'); // 重置地址状态
      try {
        const address = await getAddressFromCoordinates(newIncident.lat, newIncident.lng);
        setLocationAddress(address);
      } catch (addressError) {
        console.error('获取地址失败:', addressError);
        setLocationAddress('未知地址');
      }

      setOpenReceiptDialog(true); // 打开回执弹窗
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

      // 不要在这里调用handleCancel，因为它会重置newIncident
      // 等待用户关闭回执对话框后再重置表单
    } catch (err) {
      setError(err.message);
    }
  };

  // 下载回执为PNG图片
  const downloadReceipt = async () => {
    if (receiptRef.current) {
      try {
        const originalTransform = receiptRef.current.style.transform;
        receiptRef.current.style.transform = 'scale(1)';

        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ff0000',
          width: receiptRef.current.offsetWidth,
          height: receiptRef.current.offsetWidth
        });
        receiptRef.current.style.transform = originalTransform;

        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `离散地图回执_${new Date().getTime()}.png`;
        link.click();
        setTimeout(() => {
          handleCloseReceiptDialog();
        }, 2000);
      } catch (err) {
        console.error('下载回执失败:', err);
      }
    }
  };

  return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Dialog
        open={openReceiptDialog}
        onClose={handleCloseReceiptDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent style={{ padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8b7c9' }}>
          <div style={{ padding: '10px', backgroundColor: '#f8b7c9' }}>
            <h1 style={{ margin: '0', fontSize: '22px', fontFamily: '"Hei"', color: 'black' }}> 我们收到啦！等待后台审核上线！</h1>
          </div>
          <div style={{ width: '100%', maxWidth: '500px', overflow: 'hidden', padding: '8px' }}>
            <div ref={receiptRef} style={{ backgroundColor: '#ff0000', color: 'black', textAlign: 'center', width: '100%', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', transform: 'scale(1)', transformOrigin: 'top left', overflow: 'hidden' }}>
              <div style={{ height: '80%', position: 'relative', overflow: 'hidden', padding: 0 }}>
                <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                  {newIncident.lat && newIncident.lng && (
                    <MapContainer
                      center={[newIncident.lat, newIncident.lng]}
                      zoom={25}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                      attributionControl={false}
                    >
                      <TileLayer
                        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[newIncident.lat, newIncident.lng]}
                        icon={new L.Icon({
                          iconUrl: require('../assets/map_marker/regular-marker.png'),
                          iconSize: [80, 120],
                          iconAnchor: [20, 35]
                        })}
                      />
                    </MapContainer>
                  )}
                  </div>
              </div>
              <div style={{ margin: '0 0', padding: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '5px' }}>
                <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4', fontFamily: '"Hei"', color: '#333', textAlign: 'center' }}>
                  {locationAddress}
                </p>
              </div>
              <div style={{ height: '45%', backgroundColor: '#ff0000', color: 'black', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ margin: '0', fontSize: '20px', fontFamily: '"Hei"', textAlign: 'center' }}>这里发生了：</h2>
                <h3 style={{ margin: '10px 0', fontSize: '28px', fontFamily: '"Hei"', fontWeight: 'bold', textAlign: 'center', color: 'black' }}>{newIncident.here_happened}</h3>
                <p style={{ margin: '0 10px', fontSize: '16px', lineHeight: '1.3', fontFamily: '"Hei"', color: 'black' }}>
                  {newIncident.description}
                </p>
              </div>
              <div style={{ marginTop: 'auto', padding: '5px 0', backgroundColor: '#ff0000' }}>
                <p style={{ margin: 0, fontSize: '14px', fontFamily: '"balloon"', fontWeight: 'bold', color: 'white' }}>www.Archive of the Chinese Women's Diaspora.com</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', maxWidth: '400px', marginTop: '20px', marginBottom: '20px' }}>
            <Button
              variant="outlined"
              style={{
                borderRadius: '20px',
                borderColor: '#333',
                color: '#333',
                padding: '8px 20px',
                fontFamily: '"Hei"',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onClick={handleCloseReceiptDialog}
            >
              浏览更多
            </Button>

            <Button
              variant="contained"
              style={{
                borderRadius: '20px',
                backgroundColor: '#d32f2f',
                color: 'white',
                padding: '8px 30px',
                fontFamily: '"Hei"',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onClick={downloadReceipt}
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Box
        sx={{
          position: 'absolute',
          top: '20px',
          left: '80px',
          zIndex: 1000,
          backgroundColor: 'transparent',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '700px'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"balloon", sans-serif',
            color: 'red',
            fontSize: isMobile ? '2em' : '4em',
            lineHeight: 0.9,
            marginBottom: '15px'
          }}
        >
          Archive of<br />Sino Women <br /> in Diaspora
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="🎈你在找的那只气球的编码是？"
            size="small"
            value={balloonIdSearch}
            onChange={(e) => {
              setBalloonIdSearch(e.target.value);
              setSearchError('');
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(5px)',
                '&:hover fieldset': {
                  borderColor: 'red',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'red',
                },
              },
            }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: 'red',
              '&:hover': { backgroundColor: '#c70000' },
              minWidth: '40px',
              height: '40px'
            }}
            onClick={() => {
              if (!balloonIdSearch.trim()) {
                setSearchError('请输入气球ID');
                return;
              }

              // 查找对应ID的气球

              <Box sx={{ position: 'absolute', top: isMobile ? 'auto' : '150px', bottom: isMobile ? '20px' : 'auto', left: isMobile ? '50%' : 'auto', transform: isMobile ? 'translateX(-50%)' : 'none', right: isMobile ? 'auto' : '20px', zIndex: 1000, width: isMobile ? '90%' : 'auto' }}>
                <FilterBar
                  onRegionChange={(e) => {
                    const region = e.target.value;
                    if (region) {
                      const mapRegions = {
                        'china': { center: [35.8617, 104.1954], zoom: 4 },
                        'usa': { center: [37.0902, -95.7129], zoom: 4 },
                        'france': { center: [46.2276, 2.2137], zoom: 5 },
                        'uk': { center: [55.3781, -3.4360], zoom: 5 },
                        'japan': { center: [36.2048, 138.2529], zoom: 5 }
                      };
                      if (mapRegions[region]) {
                        setMapRegionToFocus(mapRegions[region]);
                      }
                    } else {
                      // Optional: Reset view if no region is selected
                      setMapRegionToFocus({ center: [20, 0], zoom: 2 });
                    }
                  }}
                  onMoodChange={(e) => {
                    // Implement mood filtering logic here
                    console.log('Selected mood:', e.target.value);
                  }}
                />
              </Box>
              const foundIncident = incidents.find(inc => inc.id.toString() === balloonIdSearch.trim());

              if (foundIncident) {
                // 找到了气球，设置地图中心并打开气球的弹出窗口
                if (foundIncident.lat && foundIncident.lng) {
                  setMapRegionToFocus({
                    center: [foundIncident.lat, foundIncident.lng],
                    zoom: 10
                  });
                  setSelectedIncident(foundIncident);
                }
              } else {
                setSearchError('我们没有找到这只气球 :(');
              }
            }}
          >
            🔍
          </Button>
        </Box>
        {searchError && (
          <Typography variant="caption" sx={{ color: 'red', mt: 1 }}>
            {searchError}
          </Typography>
        )}
      </Box>
      <MapContainer
        center={[46.2276, 2.2137]}
        zoom={8}
        style={{
          height: '80vh',
          backgroundColor: '#ffffff'
        }}
        minZoom={3}
        maxBounds={[[-90, -180], [90, 180]]}
        zoomControl={false}
      >
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
          className="map-tiles"
        />
        <ZoomControl position="bottomleft" />
        <MapEvents
          isAddingMode={isAddingMode}
          setTempMarker={setTempMarker}
          setNewIncident={setNewIncident}
          setShowForm={setShowForm}
        />
        <MapController regionToFocus={mapRegionToFocus} />

        {!openReceiptDialog && <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          pointerEvents: 'auto',
          width: '250px',
          height: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {!isAddingMode ? (
            <img
              src={require('../assets/map_marker/add-story.png')}
              alt="Add Story"
              onClick={() => setIsAddingMode(!isAddingMode)}
              style={{
                width: '100px',
                height: 'auto',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setIsAddingMode(!isAddingMode)}
                sx={{
                  width: '280px',
                  height: '60px',
                  borderRadius: '30px',
                  color: 'red',
                  fontWeight: 'bold',
                  borderColor: 'red',
                  backgroundColor: 'white',
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#fff0f0',
                    borderColor: 'red',
                  }
                }}
              >
                选择一个原点，放飞你的气球
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  width: '280px',
                  height: '60px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s'
                  },
                }}
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("获取到位置:", latitude, longitude);
                        setTempMarker({ latitude, longitude });
                        setMapRegionToFocus({
                          center: [latitude, longitude],
                          zoom: 10
                        });
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
                定位气球到我的城市 🌆
              </Button>
            </Box>
          )}
        </div>}
        {tempMarker && tempMarker.latitude && tempMarker.longitude && !openReceiptDialog && (
          <Marker
            position={[tempMarker.latitude, tempMarker.longitude]}
            icon={new L.Icon({
              iconUrl: require('../assets/map_marker/regular-marker.png'),
              iconSize: [55, 90],
              iconAnchor: [27, 45],
              className: 'marker-icon'
            })}
          />
        )}

        {incidents.map((incident) => (
          incident.lat && incident.lng ? (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={new L.Icon({
                // Use our custom marker
                iconUrl: require('../assets/map_marker/regular-marker.png'),
                iconSize: [55, 90],
                iconAnchor: [27, 45]
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
                  sx={{ color: 'red' }}
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
                    window.open(`#/incident?id=${incident.id}`, '_blank');
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
            position: isMobile ? 'absolute' : 'absolute',
            top: isMobile ? '60vh' : 60,
            right: isMobile ? 0 : 10,
            left: isMobile ? 0 : 'auto',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: isMobile ? '25px 25px 0 0' : 25,
            width: isMobile ? '100%' : '400px',
            mt: 0,
            boxShadow: 3,
            height: isMobile ? '40vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}
        >
          <div style={{ padding: '15px' }}>
            <Box sx={{ margin: 1 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  width: '100%',
                  justifyContent: 'space-between',
                  backgroundColor: '#9e0000',
                  '&:hover': { backgroundColor: '#7b0000' }
                }}
                onClick={() => {
                  const infoElement = document.getElementById('info-content');
                  if (infoElement) {
                    infoElement.style.display = infoElement.style.display === 'none' ? 'block' : 'none';
                  }
                }}
              >
                <Typography variant="button" sx={{ fontWeight: 'bold' }}>⚠️ 小提示</Typography>
                <span>+</span>
              </Button>
              <Box
                id="info-content"
                sx={{
                  display: 'none',
                  mt: 1,
                  p: 1.5,
                  backgroundColor: '#ffebee',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              >
                填写完毕后可以下载你的气球，分享到自己的社交媒体:)
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography sx={{ whiteSpace: 'nowrap' }}>这里发生了...</Typography>
              <TextField
                fullWidth
                size="small"
                value={newIncident.here_happened}
                onChange={(e) => setNewIncident({ ...newIncident, here_happened: e.target.value })}
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography gutterBottom fontFamily={'Hei'}>我的感受是</Typography>
                <Typography variant="body2" fontFamily={'Hei'} color={newIncident.feeling_score < 0 ? "error" : "success"}>
                  {newIncident.feeling_score}
                </Typography>
              </Box>
              <Slider
                value={newIncident.feeling_score}
                onChange={(e, value) => setNewIncident({ ...newIncident, feeling_score: value })}
                min={-100}
                max={100}
                marks={[
                  { value: -100 },
                  { value: 0 },
                  { value: 100 }
                ]}
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                  },
                  '& .MuiSlider-track': {
                    height: 10,
                    background: 'transparent',
                  },
                  '& .MuiSlider-rail': {
                    height: 10,
                    background: 'linear-gradient(90deg, #FF00C3, #8D0505)',
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
                      setNewIncident({ ...newIncident, violence_type: newTypes });
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
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
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
                        scenario: { ...newIncident.scenario, tags: newTags }
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
                        praise: !newIncident.scenario.showPraise ? newIncident.scenario.praise : ''
                      }
                    });
                  }}
                  color={newIncident.scenario.showPraise ? "success" : "default"}
                />
              </Box>
            </Box>
            {newIncident.scenario.showCriticism && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="点名批评"
                  value={newIncident.scenario.criticism}
                  onChange={(e) => setNewIncident({
                    ...newIncident,
                    scenario: { ...newIncident.scenario, criticism: e.target.value }
                  })}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
            {newIncident.scenario.showPraise && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="点名表扬"
                  value={newIncident.scenario.praise}
                  onChange={(e) => setNewIncident({
                    ...newIncident,
                    scenario: { ...newIncident.scenario, praise: e.target.value }
                  })}
                  size="small"
                />
              </Box>
            )}

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="transparent" onClick={handleSubmit} sx={{ color: 'red', backgroundColor: 'transparent', fontFamily: 'balloon', fontSize: '2vh' }}>Submit</Button>
              <Button variant="grey" onClick={handleCancel} sx={{ color: 'grey', fontFamily: 'balloon', fontSize: '2vh' }}>Cancel</Button>
            </Box>
          </div>
        </Box>
      )}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <FilterBar
          onRegionChange={(e) => {
            const region = e.target.value;
            if (region) {
              const mapRegions = {
                'china': { center: [35.8617, 104.1954], zoom: 4 },
                'usa': { center: [37.0902, -95.7129], zoom: 4 },
                'france': { center: [46.2276, 2.2137], zoom: 5 },
                'uk': { center: [55.3781, -3.4360], zoom: 5 },
                'japan': { center: [36.2048, 138.2529], zoom: 5 }
              };
              if (mapRegions[region]) {
                setMapRegionToFocus(mapRegions[region]);
              }
            } else {
              // Optional: Reset view if no region is selected
              setMapRegionToFocus({ center: [20, 0], zoom: 2 });
            }
          }}
          onMoodChange={(e) => {
            // Implement mood filtering logic here
            console.log('Selected mood:', e.target.value);
          }}
        />
        <RecentHarms incidents={incidents} />
        <Contributors />
      </div>
    </div>
  );
}

export default Map;