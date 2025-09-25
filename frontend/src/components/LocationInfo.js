import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { LocationOn, GpsFixed, GpsNotFixed } from '@mui/icons-material';

const LocationInfo = ({ location }) => {
  if (!location) return null;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocationOn color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Location Information</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Chip 
          icon={location.source === 'ip' ? <GpsNotFixed /> : <GpsFixed />}
          label={location.source === 'ip' ? 'Approximate (IP)' : 'GPS Accurate'}
          color={location.source === 'ip' ? 'default' : 'primary'}
          size="small"
        />
        
        {location.accuracy && (
          <Chip 
            label={`Accuracy: ~${Math.round(location.accuracy)} meters`}
            color={location.accuracy > 1000 ? 'warning' : 'success'}
            size="small"
          />
        )}
      </Box>

      <Typography variant="body2">
        <strong>Coordinates:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
      </Typography>
      
      {location.city && (
        <Typography variant="body2">
          <strong>Detected Area:</strong> {location.city}
        </Typography>
      )}
      
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        Last updated: {location.timestamp}
      </Typography>
    </Paper>
  );
};

export default LocationInfo;