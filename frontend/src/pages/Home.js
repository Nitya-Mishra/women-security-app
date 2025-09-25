import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { 
  LocationOn, 
  Warning, 
  LocalHospital, 
  Security 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Warning sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'SOS Alert',
      description: 'Send emergency alerts with your live location to trusted contacts'
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Live Location',
      description: 'View and share your real-time location on an interactive map'
    },
    {
      icon: <LocalHospital sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Nearby Help',
      description: 'Find nearby police stations, hospitals, and safe places'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Siren Sound',
      description: 'Activate a loud siren to alert people nearby in case of emergency'
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,250,0.9) 100%)',
        borderRadius: 4,
        px: 4,
        mb: 6
      }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Stay Safe, Stay Connected
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph sx={{ mb: 4 }}>
          Your personal safety app designed to help women in emergency situations
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/signup')}
          sx={{ 
            px: 4, 
            py: 1.5, 
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #d81b60 30%, #ff5c8d 90%)'
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4 }}>
        How It Works
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 6,
        background: 'linear-gradient(135deg, rgba(216,27,96,0.1) 0%, rgba(255,92,141,0.1) 100%)',
        borderRadius: 4,
        px: 4
      }}>
        <Typography variant="h5" gutterBottom>
          Ready to take control of your safety?
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/signup')}
          sx={{ 
            mt: 2,
            px: 4, 
            py: 1.5,
            background: 'linear-gradient(45deg, #d81b60 30%, #ff5c8d 90%)'
          }}
        >
          Sign Up Now
        </Button>
      </Box>
    </Container>
  );
};

export default Home;