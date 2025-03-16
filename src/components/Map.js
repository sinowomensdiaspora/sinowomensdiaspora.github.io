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

function Map({ supabase }) {
  const [incidents, setIncidents] = useState([]);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const [newIncident, setNewIncident] = useState({
    lat: null,
    lng: null,
    incident_type: '',
    story: '',
    feel_level: '',
    harm_level: ''
  });

  const harmTypes = [
    { value: 1, label: '肢体暴力' },
    { value: 2, label: '语言暴力' },
    { value: 3, label: '冷暴力' },
    { value: 4, label: '其他' }
  ];

  const feelingLevels = [
    { value: 1, label: 'Good' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Bad' }
  ];

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*');
    if (data) setIncidents(data);
  };

  const MapEvents = () => {
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

  const handleSubmit = async () => {
    if (!newIncident.lat || !newIncident.lng) {
      setError('Invalid location selected');
      return;
    }

    const region = getRegionFromCoordinates(newIncident.lat, newIncident.lng);
    
    const { error: submitError } = await supabase
      .from('submissions')
      .insert([{
        ...newIncident,
        created_at: new Date().toISOString()
      }]);
    
    if (submitError) {
      setError(submitError.message);
      return;
    }

    setSuccessMessage(`已提交 ${newIncident.incident_type}，谢谢你`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    
    fetchIncidents();
    handleCancel();
  };

  const handleCancel = () => {
    setIsAddingMode(false);
    setTempMarker(null);
    setShowForm(false);
    setNewIncident({
      lat: null,
      lng: null,
      incident_type: '',
      story: '',
      feel_level: '',
      harm_level: ''
    });
  };
  const SubmitButton = styled(Button)(({theme, isAddingMode}) => ({
    background: isAddingMode 
      ? 'white'
      : 'linear-gradient(45deg, #FF1493, #FF69B4, #FFB6C1, #FFC0CB)',
    backgroundSize: '300% 300%',
    animation: isAddingMode 
      ? 'none' 
      : 'gradient 2s ease infinite',
    '@keyframes gradient': {
      '0%': {
        backgroundPosition: '0% 50%'
      },
      '50%': {
        backgroundPosition: '100% 50%'
      },
      '100%': {
        backgroundPosition: '0% 50%'
      }
    },
    color: isAddingMode ? 'primary' : 'white',
    '&:hover': {
      background: isAddingMode 
        ? 'white' 
        : 'linear-gradient(45deg, #FF69B4, #FFB6C1, #FFC0CB, #FF1493)',
    }
  }));
  return (
    <div style={{ position: 'relative' }}>
      {showSuccess && (
        <Alert 
          severity="success" 
          style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
        >
          {successMessage}
        </Alert>
      )}

      <SubmitButton 
        variant={isAddingMode ? "outlined" : "contained"}
        onClick={() => setIsAddingMode(!isAddingMode)}
        isAddingMode={isAddingMode}
        style={{ position: 'absolute', left: '20px', top: '20px', zIndex: 1000 }}
      >
        {isAddingMode ? 'Drop your pin' : 'Submit'}
      </SubmitButton>

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
            width: '300px'
          }}
        >
          <TextField
            fullWidth
            label="Incident Type"
            value={newIncident.incident_type}
            onChange={(e) => setNewIncident({...newIncident, incident_type: e.target.value})}
            margin="normal"
          />
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Story"
            value={newIncident.story}
            onChange={(e) => setNewIncident({...newIncident, story: e.target.value})}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Feeling Level</InputLabel>
            <Select
              value={newIncident.feel_level}
              onChange={(e) => setNewIncident({...newIncident, feel_level: e.target.value})}
            >
              {feelingLevels.map(level => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Harm Type</InputLabel>
            <Select
              value={newIncident.harm_level}
              onChange={(e) => setNewIncident({...newIncident, harm_level: e.target.value})}
            >
              {harmTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
            <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
          </Box>
        </Box>
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <MapContainer
        center={[35, 105]}
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
        <MapEvents />
        
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
            >
              <Popup>
                <h3>{incident.incident_type}</h3>
                <p>{incident.story}</p>
                <p>感受程度: {feelingLevels.find(f => f.value === incident.feel_level)?.label}</p>
                <p>伤害类型: {harmTypes.find(h => h.value === incident.harm_level)?.label}</p>
                <p>地区: {incident.region}</p>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
      
      <FilterBar />
      <RecentHarms incidents={incidents} />
      <Resources />
    </div>
  );
}

export default Map;