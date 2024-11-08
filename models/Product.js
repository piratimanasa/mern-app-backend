const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name is required
    },
    description: {
      type: String,
      required: false, // Optional field
    },
    price: {
      type: Number,
      required: true, // Price is required
      min: [0, 'Price cannot be negative'], // Ensures price is not negative
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Make sure to export the Product model
module.exports = mongoose.model('Product', productSchema);
