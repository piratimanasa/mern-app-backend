const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/emailservice');

// Middleware to check if user is authenticated
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.userId = decoded.userId;
        next();
    });
};

// Helper function to get user email
const getUserEmail = async (userId) => {
    const user = await User.findById(userId);
    return user ? user.email : null;
};

// CRUD Routes

// Add Product
router.post('/', authenticate, async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
        return res.status(400).json({ error: 'All fields (name, description, price) are required' });
    }

    try {
        const newProduct = new Product({ name, description, price, userId: req.userId });
        await newProduct.save();

        // Retrieve user's email and send email notification for product creation
        const userEmail = await getUserEmail(req.userId);
        if (userEmail) {
            try {
                await sendEmail(userEmail, 'Product Created', `Your product "${name}" has been created successfully.`);
            } catch (emailErr) {
                console.error('Error sending product creation email:', emailErr);
            }
        }

        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error adding product' });
    }
});

// Get Products
router.get('/', authenticate, async (req, res) => {
    try {
        const products = await Product.find({ userId: req.userId });
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// Update Product
router.put('/:id', authenticate, async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
        return res.status(400).json({ error: 'All fields (name, description, price) are required' });
    }

    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Retrieve user's email and send email notification for product update
        const userEmail = await getUserEmail(req.userId);
        if (userEmail) {
            try {
                await sendEmail(userEmail, 'Product Updated', `Your product "${name}" has been updated successfully.`);
            } catch (emailErr) {
                console.error('Error sending product update email:', emailErr);
            }
        }

        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating product' });
    }
});

// Delete Product
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Retrieve user's email and send email notification for product deletion
        const userEmail = await getUserEmail(req.userId);
        if (userEmail) {
            try {
                await sendEmail(userEmail, 'Product Deleted', `Your product "${product.name}" has been deleted.`);
            } catch (emailErr) {
                console.error('Error sending product deletion email:', emailErr);
            }
        }

        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting product' });
    }
});

module.exports = router;
