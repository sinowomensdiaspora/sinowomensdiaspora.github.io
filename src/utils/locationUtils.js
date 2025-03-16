export const getRegionFromCoordinates = (lat, lng) => {
  // Basic region calculation based on coordinates
  let region = '';
  
  // North America
  if (lat >= 15 && lat <= 72 && lng >= -168 && lng <= -50) {
    region = 'North America';
  }
  // Europe
  else if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
    region = 'Europe';
  }
  // East Asia
  else if (lat >= 20 && lat <= 46 && lng >= 95 && lng <= 145) {
    region = 'East Asia';
  }
  // Southeast Asia
  else if (lat >= -10 && lat <= 29 && lng >= 95 && lng <= 141) {
    region = 'Southeast Asia';
  }
  // Australia
  else if (lat >= -44 && lat <= -10 && lng >= 113 && lng <= 154) {
    region = 'Australia';
  }
  // Other regions can be added as needed
  else {
    region = 'Other';
  }
  
  return region;
};