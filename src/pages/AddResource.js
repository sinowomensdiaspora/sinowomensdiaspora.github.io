import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { RESOURCE_CONFIGS } from '../config/tags';
import { getAddressFromCoordinates } from '../utils/locationUtils';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function AddResource({ supabase }) {
  const [formData, setFormData] = useState({
    name: '',
    contact_phone: '',
    email: '',
    address: '',
    additional_note: '',
    tags: '',
    lat: null,
    lng: null
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTagChange = (tagLabel) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagLabel)
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel];

      // Update formData.tags with comma-separated string
      setFormData(prevData => ({
        ...prevData,
        tags: newTags.join(', ')
      }));

      return newTags;
    });
  };

  const handleLocationSelect = async (latlng) => {
    setSelectedLocation(latlng);
    setFormData(prev => ({
      ...prev,
      lat: latlng.lat,
      lng: latlng.lng
    }));

    // 自动获取地址
    setIsGettingAddress(true);
    try {
      const address = await getAddressFromCoordinates(latlng.lat, latlng.lng);
      setFormData(prev => ({
        ...prev,
        address: address
      }));
    } catch (error) {
      console.error('获取地址失败:', error);
      // 此处不设置错误，让用户手动输入地址
    } finally {
      setIsGettingAddress(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.name || !formData.address || !formData.lat || !formData.lng) {
      setError('请填写必填字段并在地图上选择位置');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('spaces')
        .insert([{
          ...formData,
          status: 'active'
        }]);

      if (submitError) throw submitError;

      setShowSuccess(true);
      // Reset form
      setFormData({
        name: '',
        contact_phone: '',
        email: '',
        address: '',
        additional_note: '',
        tags: '',
        lat: null,
        lng: null
      });
      setSelectedTags([]);
      setSelectedLocation(null);
      setIsGettingAddress(false);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/resources');
      }, 2000);

    } catch (err) {
      setError(err.message || '提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 8,
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            color: '#000',
            mb: 4,
            fontWeight: 'bold'
          }}
        >
          添加援助空间
        </Typography>

        <Grid container spacing={4}>
                    {/* Map Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                height: '500px',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <MapContainer
                center={[46.2276, 2.2137]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                {selectedLocation && (
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={new L.Icon({
                      iconUrl: require('../assets/map_marker/resource-marker.png'),
                      iconSize: [25, 70],
                      iconAnchor: [20, 60]
                    })}
                  />
                )}
              </MapContainer>
            </Paper>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                textAlign: 'center',
                color: '#666'
              }}
            >
              点击地图选择位置
            </Typography>
          </Grid>
          {/* Form Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 2
              }}
            >
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="空间名称"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="联系电话"
                  value={formData.contact_phone}
                  onChange={handleInputChange('contact_phone')}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="邮箱"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="地址"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  margin="normal"
                  required
                  multiline
                  rows={2}
                  disabled={isGettingAddress}
                  helperText={isGettingAddress ? "正在获取地址..." : "点击地图自动填入地址，或手动输入"}
                  InputProps={{
                    endAdornment: isGettingAddress ? <CircularProgress size={20} /> : null
                  }}
                />
                
                {/* Support Type Tags */}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                    支持类型 (可多选)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {RESOURCE_CONFIGS.supportTypes.map((tag) => (
                      <Chip
                        key={tag.value}
                        label={tag.label}
                        onClick={() => handleTagChange(tag.label)}
                        variant={selectedTags.includes(tag.label) ? "filled" : "outlined"}
                        sx={{
                          backgroundColor: selectedTags.includes(tag.label) ? '#000' : 'transparent',
                          color: selectedTags.includes(tag.label) ? '#fff' : '#000',
                          border: '1px solid #000',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: selectedTags.includes(tag.label) ? '#333' : 'rgba(0,0,0,0.1)',
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                
                <TextField
                  fullWidth
                  label="附加说明"
                  value={formData.additional_note}
                  onChange={handleInputChange('additional_note')}
                  margin="normal"
                  multiline
                  rows={3}
                />

                {selectedLocation && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    已选择位置: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    mt: 3,
                    backgroundColor: '#000',
                    '&:hover': {
                      backgroundColor: '#333'
                    }
                  }}
                >
                  {isSubmitting ? '提交中...' : '提交 :D'}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert onClose={() => setShowSuccess(false)} severity="success">
            资源添加成功！正在跳转...
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default AddResource;
