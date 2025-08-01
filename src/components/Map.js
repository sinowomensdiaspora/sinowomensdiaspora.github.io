import React, { useState, useEffect, useRef } from 'react';
import Stack from '@mui/material/Stack';
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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { getRegionFromCoordinates, getAddressFromCoordinates } from '../utils/locationUtils';
import FilterBar from './FilterBar';
import CustomButton from './CustomButton';
import RecentHarms from './RecentHarms';
import Contributors from './Contributors';
import { Slider, Chip, Typography, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import { useIncident } from '../context/IncidentContext';
import html2canvas from 'html2canvas';
import { Container } from 'react-bootstrap';
import zIndex from '@mui/material/styles/zIndex';


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
  const [spaces, setSpaces] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const { setSelectedIncident } = useIncident();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  useEffect(() => {
    refreshIncidents();
    refreshSpaces();
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

  // 添加刷新援助空间数据的函数
  const refreshSpaces = async () => {
    try {
      console.log('Refreshing all spaces');
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching spaces:', error);
        return;
      }

      console.log('Fetched spaces:', data?.length || 0);
      setSpaces(data || []);
    } catch (err) {
      console.error('Failed to fetch spaces:', err);
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
      if (!tempMarker && newIncident.lat && newIncident.lng) {
        setTempMarker({
          latitude: newIncident.lat,
          longitude: newIncident.lng
        });
      }
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
          height: receiptRef.current.offsetHeight
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
            <h1 style={{ margin: '0', fontSize: '22px', fontFamily: '"Avenir"', color: 'black' }}> 🕊️ 谢谢你分享，它将推动改变发生。</h1>
          </div>
          <div style={{ width: '100%', maxWidth: '500px', maxHeight: '70vh', overflow: 'auto', padding: '8px' }}>
            <div ref={receiptRef} style={{ backgroundColor: '#ff0000', color: 'black', textAlign: 'center', width: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column', transform: 'scale(1)', transformOrigin: 'top left', overflow: 'hidden' }}>
              <div style={{ height: '300px', position: 'relative', overflow: 'hidden', padding: 0 }}>
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
              <div style={{ flex: '1', backgroundColor: '#ff0000', color: 'black', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 10px', minHeight: '200px' }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontFamily: '"Hei"', textAlign: 'center' }}>这里发生了：</h2>
                <h3 style={{ margin: '10px 0', fontSize: '28px', fontFamily: '"Hei"', fontWeight: 'bold', textAlign: 'center', color: 'black', wordWrap: 'break-word' }}>{newIncident.here_happened}</h3>
                <p style={{ margin: '10px 0 0 0', fontSize: '16px', lineHeight: '1.4', fontFamily: '"Hei"', color: 'black', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {newIncident.description}
                </p>
              </div>
              <div style={{ marginTop: 'auto', padding: '5px 0', backgroundColor: '#ff0000' }}>
                <p style={{ margin: 0, fontSize: '14px', fontFamily: '"balloon"', fontWeight: 'bold', color: 'white' }}>www.Archive of the Chinese Women's Diaspora.com</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', maxWidth: '400px', marginTop: '20px', marginBottom: '20px' }}>
            <CustomButton
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
            </CustomButton>

            <CustomButton
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
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>
      
      <Box
        sx={{
          position: 'absolute',
          top: '10vh',
          left: 0,
          right: 0,
          zIndex: 1200,
          padding: '16px',
          backgroundColor: 'transparent'
        }}
      >
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
              setMapRegionToFocus({ center: [20, 0], zoom: 2 });
            }
          }}
          onMoodChange={(e) => {
            console.log('Selected mood:', e.target.value);
          }}
        />
      </Box>

      <MapContainer
        center={[46.2276, 2.2137]}
        zoom={8}
        style={{
          height: '100vh',
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
          zIndex: 999,
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
                zIndex: 10,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CustomButton
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
                点选一个原点，放飞你的气球
              </CustomButton>
              <CustomButton
                variant="contained"
                sx={{
                  width: '280px',
                  height: '60px',
                  backgroundColor: "rgba(0,0,0,0.2)",
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
                定位气球到我的城市
              </CustomButton>
            </Box>
          )}
        </div>}
        {tempMarker && tempMarker.latitude && tempMarker.longitude && !openReceiptDialog && (
          <Marker
            position={[tempMarker.latitude, tempMarker.longitude]}
            icon={new L.Icon({
              iconUrl: require('../assets/map_marker/regular-marker.png'),
              iconSize: [60, 90],
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
              <Popup
                className="custom-popup"
                options={{
                  zIndexOffset: 1000
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: 'red' }}
                >
                  {incident.here_happened}
                </Typography>
                <Typography variant="body2">{incident.description}</Typography>
                <CustomButton
                  size="small"
                  sx={{ mt: 1, outline:'0.5px solid', color:'black'}}
                  onClick={() => {
                    localStorage.setItem(`selectedIncident_${incident.id}`, JSON.stringify(incident));
                    setSelectedIncident(incident);
                    window.open(`#/incident?id=${incident.id}`, '_blank');
                  }}
                >
                  关于这则故事...
                </CustomButton>
              </Popup>
            </Marker>
          ) : null
        ))}

        {spaces.map((space) => (
          space.lat && space.lng ? (
            <Marker
              key={`space-${space.id}`}
              position={[space.lat, space.lng]}
              icon={new L.Icon({
                iconUrl: require('../assets/map_marker/resource-marker.png'),
                iconSize: [25, 70],
                iconAnchor: [27, 45]
              })}
              eventHandlers={{
                click: () => {
                  setSelectedSpace(space);
                }
              }}
            >
              <Popup
                className="custom-popup"
                options={{
                  zIndexOffset: 1000
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: '#2196f3' }}
                >
                  {space.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {space.address}
                </Typography>
                {space.contact_phone && (
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    电话: {space.contact_phone}
                  </Typography>
                )}
                {space.email && (
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    邮箱: {space.email}
                  </Typography>
                )}
                {space.tags && (
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 1 }}>
                    标签: {space.tags}
                  </Typography>
                )}
                <CustomButton
                  size="small"
                  sx={{ mt: 1, outline:'0.5px solid', color:'black'}}
                  onClick={() => {
                    window.open(`#/resources`, '_blank');
                  }}
                >
                  查看更多资源...
                </CustomButton>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
      {showForm && (
        <Stack spacing={1}
          sx={{
            position: isMobile ? 'absolute' : 'absolute',
            top: isMobile ? '60vh' : '50%',
            right: isMobile ? 0 : 20,
            left: isMobile ? 0 : 'auto',
            transform: isMobile ? 'none' : 'translateY(-50%)',
            zIndex: 1200,
            width: isMobile ? '100%' : '400px',
            mt: 0,
            height: isMobile ? '40vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}
        >
          <div style={{ padding: '5px'}}>
            <Accordion>
              <AccordionSummary   
                  expandIcon={<ArrowDownwardIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  width: '100%',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 0, 17, 0.45)'
                }}
                >
                <Typography component="span">📝 信息</Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 0, 17, 0.25)'
                }}>
                <Typography>
                  填写完毕后可以下载你的气球，分享到自己的社交媒体
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
          <div 
          style={{ padding: '15px', position: 'relative',
            backgroundColor: isMobile? 'white': 'rgba(204, 204, 204, 0.75)',
            padding: 25,
            borderRadius: isMobile ? 30 : 70, }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography sx={{ whiteSpace: 'nowrap' }}>这里发生了...</Typography>
              <TextField
                fullWidth
                size="small"
                value={newIncident.here_happened}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 40) {
                    setNewIncident({ ...newIncident, here_happened: value });
                  }
                }}
                slotProps={{ input: { maxLength: 40 } }}
                helperText={`${newIncident.here_happened.length}/40`}
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 2000) {
                    setNewIncident({ ...newIncident, description: value });
                  }
                }}
                placeholder="在这里描述你的经历"
                slotProps={{ input: { maxLength: 2000 } }}
                helperText={`${newIncident.description.length}/2000`}
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
              <Button variant="transparent" onClick={handleSubmit} sx={{ color: 'red', backgroundColor: 'transparent', fontFamily: 'balloon', fontSize: '1.5vh' }}>Submit</Button>
              <Button variant="grey" onClick={handleCancel} sx={{ color: 'grey', fontFamily: 'balloon', fontSize: '1.5vh' }}>Cancel</Button>
            </Box>
          </div>
        </Stack>
      )}

    </div>
  );
}

export default Map;