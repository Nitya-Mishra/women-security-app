const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema (structure of user data in database)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // This field is mandatory
    trim: true // Removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have same email
    lowercase: true, // Converts email to lowercase
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Password must be at least 6 characters
  },
  emergencyContacts: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now // Automatically set to current date
  }
});

// Hash password before saving user to database
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt (extra random data for security)
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;