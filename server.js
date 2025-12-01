
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        products: [],
        orders: [],
        banners: [],
        settings: {},
        coupons: [],
        cart: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper to read DB
const readDb = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// API Routes
app.get('/api/data/:key', (req, res) => {
    const db = readDb();
    const key = req.params.key;
    res.json(db[key] || null);
});

app.post('/api/data/:key', (req, res) => {
    const db = readDb();
    const key = req.params.key;
    db[key] = req.body;
    writeDb(db);
    res.json({ success: true, message: `Updated ${key}` });
});

app.get('/api/full-sync', (req, res) => {
    res.json(readDb());
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Ahaa! Masala Backend Server Running!
    -------------------------------------------
    1. Ensure your device is on the same Wi-Fi.
    2. Frontend App will automatically detect this server
       if accessed via http://<YOUR_IP>:3000
    
    Listening on Port: ${PORT}
    Data File: ${DB_FILE}
    -------------------------------------------
    `);
});
