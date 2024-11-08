const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../services/emailservice'); // Import the email service

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if all required fields are provided
  if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields (username, email, password) are required' });
  }

  // Password strength validation (example regex)
  const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and include a letter, number, and special character.' });
  }

  try {
      // Check if the email or username is already registered
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
          return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Create and save the new user (password will be hashed automatically by the model)
      const newUser = new User({ username, email, password });  // No need to hash the password manually
      await newUser.save();

      // Send registration email
      try {
          await sendEmail(email, 'Welcome!', 'Thanks for registering with our app!');
      } catch (emailErr) {
          console.error('Error sending registration email:', emailErr);
          return res.status(500).json({ error: 'User registration succeeded, but failed to send welcome email' });
      }

      res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
      console.error(err); // Log error for debugging
      res.status(500).json({ error: 'User registration failed' });
  }
});

// Login route (backend)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    console.log('User found:', user);

    // Compare provided password with the hashed password in the database
    const isPasswordValid = await user.comparePassword(password);
    console.log('Provided password:', password);
    console.log('Hashed password in DB:', user.password);
    console.log('Password is valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Send login confirmation email to user
    try {
      await sendEmail(
        email, 
        'Login Successful', 
        'You have successfully logged into your account!'
      );
    } catch (emailErr) {
      console.error('Error sending login confirmation email:', emailErr);
      return res.status(500).json({ error: 'Login succeeded, but failed to send confirmation email' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;


