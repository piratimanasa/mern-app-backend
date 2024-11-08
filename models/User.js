const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensure username is unique
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'], // Email format validation
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Ensure a minimum length for password
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare the password for login validation
userSchema.methods.comparePassword = async function (candidatepassword) {
  console.log('Comparing provided password:',candidatepassword);
  console.log('Hashed password in DB:', this.password);
  try {
    return await bcrypt.compare(candidatepassword, this.password);
  } catch (err) {
    throw new Error('Error comparing password');
  }
};

module.exports = mongoose.model('User', userSchema);

