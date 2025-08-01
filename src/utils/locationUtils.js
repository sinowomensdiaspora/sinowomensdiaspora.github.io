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

/**
 * Get address from latitude and longitude using OpenStreetMap Nominatim API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Promise that resolves to address string
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9', // Prefer English results
          'User-Agent': 'ChineseWomenDiaspora/1.0' // Required by Nominatim usage policy
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    // Format the address based on available data
    if (data && data.display_name) {
      return data.display_name;
    } else {
      return '未知地址'; // Unknown address
    }
  } catch (error) {
    console.error('Error getting address:', error);
    return '未知地址'; // Unknown address
  }
};