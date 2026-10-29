
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: './shrav.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve index.html and other static files
app.use(express.static(__dirname));

// Weather Schema
const weatherSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Weather = mongoose.model('Weather', weatherSchema);

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB Atlas successfully!');

        // Insert sample records only when the collection is empty
        const count = await Weather.countDocuments();

        if (count === 0) {
            await Weather.insertMany([
                {
                    temperature: 30,
                    humidity: 65,
                    status: 'Sunny',
                    timestamp: new Date('2026-10-27T08:00:00Z')
                },
                {
                    temperature: 28,
                    humidity: 70,
                    status: 'Partly Cloudy',
                    timestamp: new Date('2026-10-27T09:00:00Z')
                },
                {
                    temperature: 26,
                    humidity: 78,
                    status: 'Cloudy',
                    timestamp: new Date('2026-10-27T10:00:00Z')
                },
                {
                    temperature: 24,
                    humidity: 85,
                    status: 'Rainy',
                    timestamp: new Date('2026-10-27T11:00:00Z')
                },
                {
                    temperature: 27,
                    humidity: 72,
                    status: 'Windy',
                    timestamp: new Date('2026-10-27T12:00:00Z')
                },
                {
                    temperature: 31,
                    humidity: 60,
                    status: 'Hot',
                    timestamp: new Date('2026-10-27T13:00:00Z')
                },
                {
                    temperature: 29,
                    humidity: 68,
                    status: 'Partly Cloudy',
                    timestamp: new Date('2026-10-27T14:00:00Z')
                },
                {
                    temperature: 25,
                    humidity: 82,
                    status: 'Rainy',
                    timestamp: new Date('2026-10-27T15:00:00Z')
                },
                {
                    temperature: 23,
                    humidity: 88,
                    status: 'Foggy',
                    timestamp: new Date('2026-10-27T16:00:00Z')
                },
                {
                    temperature: 28,
                    humidity: 66,
                    status: 'Clear',
                    timestamp: new Date('2026-10-27T17:00:00Z')
                }
            ]);

            console.log('Sample weather data inserted.');
        }
    })
    .catch((error) => {
        console.error(
            'MongoDB Atlas connection error:',
            error.message
        );
    });

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Save new weather data
app.post('/weather/update', async (req, res) => {
    try {
        const { temperature, humidity, status, timestamp } = req.body;

        if (
            temperature === undefined ||
            humidity === undefined ||
            !status
        ) {
            return res.status(400).json({
                message: 'Provide temperature, humidity, and status.'
            });
        }

        const savedReport = await Weather.create({
            temperature,
            humidity,
            status,
            ...(timestamp ? { timestamp: new Date(timestamp) } : {})
        });

        res.status(201).json({
            message: 'Weather data saved successfully!',
            data: savedReport
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to save weather data.',
            error: error.message
        });
    }
});

// Get the latest weather record
app.get('/weather/now', async (req, res) => {
    try {
        const latestWeather = await Weather.findOne()
            .sort({ timestamp: -1 });

        if (!latestWeather) {
            return res.status(404).json({
                message: 'No weather data found yet.'
            });
        }

        res.json(latestWeather);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve weather data.',
            error: error.message
        });
    }
});

// Get all weather records
app.get('/weather/all', async (req, res) => {
    try {
        const records = await Weather.find()
            .sort({ timestamp: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve weather records.',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
