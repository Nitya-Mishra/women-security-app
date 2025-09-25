// services/emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send SOS alert email
const sendSOSEmail = async (toEmail, userName, latitude, longitude) => {
  try {
    const transporter = createTransporter();
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `🚨 EMERGENCY ALERT: ${userName} needs help!`,
      text: `
EMERGENCY SOS ALERT

${userName} has activated the emergency SOS feature.

CURRENT LOCATION:
Latitude: ${latitude}
Longitude: ${longitude}

VIEW LOCATION ON GOOGLE MAPS:
${mapsLink}

TIME OF ALERT: ${new Date().toLocaleString()}

Please check on ${userName} immediately and contact local authorities if needed.

This is an automated message from Women Security App.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d81b60; text-align: center;">🚨 EMERGENCY SOS ALERT</h2>
          <div style="background-color: #fff8f8; padding: 20px; border-radius: 10px; border-left: 4px solid #d81b60;">
            <p><strong>${userName}</strong> has activated the emergency SOS feature.</p>
            <h3 style="color: #d81b60;">CURRENT LOCATION:</h3>
            <p>Latitude: ${latitude}<br>Longitude: ${longitude}</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${mapsLink}" style="background-color: #d81b60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                📍 VIEW LOCATION ON GOOGLE MAPS
              </a>
            </div>
            <p><strong>Time of Alert:</strong> ${new Date().toLocaleString()}</p>
            <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0; color: #c62828;">
                <strong>⚠️ URGENT:</strong> Please check on ${userName} immediately and contact local authorities if needed.
              </p>
            </div>
          </div>
          <p style="text-align: center; color: #666; margin-top: 20px; font-size: 12px;">This is an automated message from Women Security App.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

module.exports = { sendSOSEmail };
