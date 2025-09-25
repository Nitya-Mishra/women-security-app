import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Warning,
  LocationOn,
  LocalHospital,
  Security,
  ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sosAPI } from '../services/api';
import MapComponent from '../components/MapComponent';
import SirenAudio from '../components/SirenAudio';
import LocationInfo from '../components/LocationInfo';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [nearbyDialogOpen, setNearbyDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userLocation, setUserLocation] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user's current location when component mounts
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // First try high accuracy with timeout
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toLocaleString(),
            source: 'gps'
          };
          
          setUserLocation(newLocation);
          console.log('High accuracy location:', newLocation);
          showSnackbar('📍 Accurate location accessed!', 'success');
        },
        (error) => {
          console.warn('High accuracy location failed:', error);
          
          // Show specific error message
          let errorMessage = 'Location access issue: ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in browser settings';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location unavailable. Check internet connection';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out';
              break;
            default:
              errorMessage += 'Please enable location services';
          }
          
          showSnackbar(errorMessage, 'warning');
          
          // Try IP-based location as fallback
          getIPBasedLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      showSnackbar('Geolocation not supported by your browser', 'error');
      getIPBasedLocation();
    }
  };

  // IP-based location fallback
  const getIPBasedLocation = () => {
    showSnackbar('Getting approximate location...', 'info');
    
    // Try multiple IP location services
    const ipServices = [
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://geolocation-db.com/json/'
    ];

    const tryIPService = async (index) => {
      if (index >= ipServices.length) {
        showSnackbar('Could not determine your location', 'error');
        return;
      }

      try {
        const response = await fetch(ipServices[index]);
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
          const ipLocation = {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            accuracy: 50000, // IP location is approximate (~50km accuracy)
            source: 'ip',
            city: data.city || data.region || '',
            timestamp: new Date().toLocaleString()
          };
          
          setUserLocation(ipLocation);
          console.log('IP-based location:', ipLocation);
          showSnackbar(`📍 Approximate location: ${data.city || data.region || 'Unknown'}`, 'info');
        } else if (data.loc) {
          // Handle ipinfo.io format
          const [lat, lng] = data.loc.split(',');
          const ipLocation = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            accuracy: 50000,
            source: 'ip',
            city: data.city || data.region || '',
            timestamp: new Date().toLocaleString()
          };
          
          setUserLocation(ipLocation);
          console.log('IP-based location:', ipLocation);
          showSnackbar(`📍 Approximate location: ${data.city || data.region || 'Unknown'}`, 'info');
        } else {
          tryIPService(index + 1);
        }
      } catch (error) {
        console.error('IP location service failed:', error);
        tryIPService(index + 1);
      }
    };

    tryIPService(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSOS = async () => {
    setSosDialogOpen(true);
  };

  const confirmSOS = async () => {
    setLoading(true);
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            
            // Send SOS alert to backend
            const response = await sosAPI.sendSOS(
              currentUser.id,
              location.lat,
              location.lng
            );
            
            // Show success message
            showSnackbar('SOS alert sent to your emergency contacts!', 'success');
            setSosDialogOpen(false);
            setLoading(false);
          },
          (error) => {
            console.error('Error getting location for SOS:', error);
            
            // Use existing location if available, even if it's IP-based
            if (userLocation) {
              sosAPI.sendSOS(
                currentUser.id,
                userLocation.lat,
                userLocation.lng
              ).then(response => {
                showSnackbar('SOS alert sent with approximate location!', 'warning');
              }).catch(sosError => {
                showSnackbar('Failed to send SOS alert. Please try again.', 'error');
              });
            } else {
              showSnackbar('Could not get your location. Please enable location services.', 'error');
            }
            
            setSosDialogOpen(false);
            setLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      showSnackbar(error.message || 'Failed to send SOS alert. Please try again.', 'error');
      setSosDialogOpen(false);
      setLoading(false);
    }
  };

  const handleViewLocation = () => {
    if (userLocation) {
      setLocationDialogOpen(true);
    } else {
      showSnackbar('Location not available. Getting location...', 'info');
      getCurrentLocation();
    }
  };

  const handleFindNearby = () => {
    if (userLocation) {
      setNearbyDialogOpen(true);
    } else {
      showSnackbar('Location not available. Getting location...', 'info');
      getCurrentLocation();
    }
  };

  const handleSiren = () => {
    setSirenPlaying(!sirenPlaying);
    if (!sirenPlaying) {
      showSnackbar('Siren activated!', 'warning');
    } else {
      showSnackbar('Siren deactivated', 'info');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    showSnackbar('Logged out successfully', 'info');
  };

  const features = [
    {
      icon: <Warning sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'SOS Alert',
      description: 'Send emergency alert with your location to trusted contacts',
      action: handleSOS,
      color: 'error'
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'My Location',
      description: 'View your current location on the map',
      action: handleViewLocation,
      color: 'primary'
    },
    {
      icon: <LocalHospital sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Nearby Help',
      description: 'Find nearby police stations and hospitals',
      action: handleFindNearby,
      color: 'secondary'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Siren',
      description: 'Activate loud siren to alert people nearby',
      action: handleSiren,
      color: sirenPlaying ? 'success' : 'warning'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,250,0.9) 100%)',
        p: 3,
        borderRadius: 3
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {currentUser?.name}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your safety is our priority. Stay connected and stay safe.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{ borderRadius: 2 }}
        >
          Logout
        </Button>
      </Box>

      {/* Safety Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ 
                flexGrow: 1, 
                textAlign: 'center',
                pb: 1
              }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant={sirenPlaying && feature.title === 'Siren' ? 'contained' : 'outlined'}
                  color={feature.color}
                  onClick={feature.action}
                  sx={{ borderRadius: 2 }}
                  disabled={loading && feature.title === 'SOS Alert'}
                >
                  {loading && feature.title === 'SOS Alert' ? (
                    <CircularProgress size={24} />
                  ) : sirenPlaying && feature.title === 'Siren' ? (
                    'Deactivate'
                  ) : (
                    'Activate'
                  )}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Emergency Contacts */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Emergency Contacts
          </Typography>
          <Grid container spacing={2}>
            {currentUser?.emergencyContacts?.map((contact, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body1" fontWeight="medium">
                    {contact.name || `Contact ${index + 1}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contact.email}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* SOS Confirmation Dialog */}
      <Dialog open={sosDialogOpen} onClose={() => !loading && setSosDialogOpen(false)}>
        <DialogTitle>
          <Warning color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirm SOS Alert
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send an emergency alert to your contacts?
            This will share your current location with them.
          </Typography>
          {userLocation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Location accuracy:</strong> {userLocation.source === 'ip' ? 'Approximate (IP-based)' : 'GPS Accurate'}
              </Typography>
              {userLocation.city && (
                <Typography variant="body2">
                  <strong>Detected area:</strong> {userLocation.city}
                </Typography>
              )}
            </Box>
          )}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Sending alert...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSosDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmSOS} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send SOS'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Dialog */}
      <Dialog 
        open={locationDialogOpen} 
        onClose={() => setLocationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Your Current Location</DialogTitle>
        <DialogContent>
          {userLocation && (
            <>
              <LocationInfo location={userLocation} />
              <MapComponent 
                center={userLocation} 
                zoom={userLocation.source === 'ip' ? 10 : 15}
                markers={[{ position: userLocation, title: 'Your Location' }]}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {userLocation.source === 'ip' 
                  ? 'Note: This is an approximate location based on your IP address. For better accuracy, enable GPS in your browser settings.'
                  : 'GPS location accuracy: ~' + Math.round(userLocation.accuracy) + ' meters'
                }
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>Close</Button>
          <Button onClick={getCurrentLocation} variant="outlined">
            Refresh Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nearby Places Dialog */}
      <Dialog 
        open={nearbyDialogOpen} 
        onClose={() => setNearbyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nearby Safe Places</DialogTitle>
        <DialogContent>
          {userLocation && (
            <>
              <LocationInfo location={userLocation} />
              <MapComponent 
                center={userLocation} 
                zoom={userLocation.source === 'ip' ? 8 : 13}
                markers={[
                  { position: userLocation, title: 'Your Location' },
                  // Mock nearby places - will be replaced with actual API data
                  { 
                    position: { 
                      lat: userLocation.lat + 0.005, 
                      lng: userLocation.lng + 0.005 
                    }, 
                    title: 'Police Station' 
                  },
                  { 
                    position: { 
                      lat: userLocation.lat - 0.003, 
                      lng: userLocation.lng + 0.007 
                    }, 
                    title: 'Hospital' 
                  }
                ]}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNearbyDialogOpen(false)}>Close</Button>
          <Button onClick={getCurrentLocation} variant="outlined">
            Refresh Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Siren Audio Component */}
      <SirenAudio playing={sirenPlaying} onEnd={() => setSirenPlaying(false)} />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;