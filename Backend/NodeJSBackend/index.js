require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Order = require('./models/Orders');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const SALT_ROUNDS = 10;
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { dbName: 'BlockCart' })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ message: 'No Authorization header' });

    const token = authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Malformed token' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// 3️⃣ Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, userType, name, phone } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        await new User({ email, password: hashed, userType, name, phone }).save();
        const payload = { email, userType };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { email: user.email, userType: user.userType };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
    if (req.user.userType === 'admin') {
        return res.json({ message: 'Welcome Admin! Here is your sensitive data.' });
    } else if (req.user.userType === 'seller') {
        return res.json({ message: 'Welcome Seller! Here are your products.' });
    } else {
        return res.json({ message: `Hello ${req.user.userType}, welcome to your dashboard.` });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { orderId, productId, destination, orderStatus, email, quantity } = req.body;
        const order = new Order({ orderId, productId, destination, orderStatus, email, quantity });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/orders/:orderId', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: 'Not found' });
        // only admin or the owner can view
        if (req.user.userType !== 'admin' && order.email !== req.user.email) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/orderedProductsByIds', async (req, res) => { // seller gets ordered products by ids
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ message: 'productIds must be an array' });
        }
        const existingOrders = await Order.find({
            productId: { $in: productIds }
        });
        res.status(200).json({ existingOrders });
    } catch (err) {
        console.error('Error fetching product IDs:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/myOrders', async (req, res) => {      // user gets all orders by email
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is invalid' });
        }
        const userOrders = await Order.find({ email });
        res.status(200).json({ userOrders });
    } catch (err) {
        console.error('Error fetching product IDs:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/orders/:orderId', async (req, res) => {   // seller updates order amount and status
    try {
        const { orderId } = req.params;
        const { updatedAmount } = req.body;
        const { orderStatus } = req.body;
        const { distance } = req.body;
        const { distancePrice } = req.body;
        const { logisticsProviderEmail } = req.body;
        const { pickup } = req.body;

        const order = await Order.findOneAndUpdate(
            { orderId },
            { updatedAmount, orderStatus, distance, distancePrice, logisticsProviderEmail, pickup },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

app.put('/api/updateOrderStatus/:orderId', async (req, res) => {   // seller updates order amount and status
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId },
            { orderStatus },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

app.get("/api/assignedOrders", async (req, res) => { // admin gets all orders
    const logisticsProviderEmail = req.query.logisticsProviderEmail;
    try {
        const orders = await Order.find({ logisticsProviderEmail });
        res.status(200).json({ orders });
    } catch (err) {
        console.error('Error fetching product IDs:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
});