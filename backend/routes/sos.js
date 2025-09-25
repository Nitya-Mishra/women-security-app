const express = require('express');
const User = require('../models/User');
const { sendSOSEmail } = require('../services/emailService');
const router = express.Router();

// SOS ALERT ENDPOINT - NOW WITH REAL EMAIL
router.post('/send', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    // Validation
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({
        message: 'User ID and location coordinates are required'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has emergency contacts
    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      return res.status(400).json({ 
        message: 'No emergency contacts found. Please add emergency contacts in your profile.' 
      });
    }

    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    let emailsSent = 0;
    let failedEmails = [];

    // Send email to each emergency contact
    for (const contact of user.emergencyContacts) {
      try {
        const result = await sendSOSEmail(
          contact.email,
          user.name,
          latitude,
          longitude
        );
        
        if (result.success) {
          emailsSent++;
          console.log(`✅ Email sent to: ${contact.email}`);
        } else {
          failedEmails.push({ email: contact.email, error: result.error });
          console.log(`❌ Failed to send to: ${contact.email}`, result.error);
        }
      } catch (emailError) {
        failedEmails.push({ email: contact.email, error: emailError.message });
        console.log(`❌ Error sending to: ${contact.email}`, emailError);
      }
    }

    // Prepare response
    const response = {
      message: 'SOS alert processed successfully',
      alertSent: emailsSent > 0,
      emailsSent,
      failedEmails,
      totalContacts: user.emergencyContacts.length,
      location: { latitude, longitude },
      mapsLink: mapsLink,
      timestamp: new Date().toISOString()
    };

    // If no emails were sent successfully
    if (emailsSent === 0) {
      return res.status(500).json({
        ...response,
        message: 'SOS alert failed: Could not send emails to any contacts',
        alertSent: false
      });
    }

    // If some emails failed
    if (failedEmails.length > 0) {
      response.message = `SOS alert partially successful. ${emailsSent} of ${user.emergencyContacts.length} emails sent.`;
    }

    res.json(response);

  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ 
      message: 'Server error during SOS alert processing',
      error: error.message 
    });
  }
});

// GET USER'S EMERGENCY CONTACTS
router.get('/contacts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      emergencyContacts: user.emergencyContacts
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching contacts' 
    });
  }
});

module.exports = router;

