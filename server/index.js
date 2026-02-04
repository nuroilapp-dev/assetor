const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5021;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.use((req, res, next) => {
    const fs = require('fs');
    const logMsg = `${new Date().toISOString()} [REQ] ${req.method} ${req.url}\n`;
    fs.appendFileSync('requests_debug.log', logMsg);
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static('uploads'));

// Health Check (Public - Moved to Top)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        version: '2.0.1-builder',
        timestamp: new Date()
    });
});

// Temporary DELETE Test
app.delete('/api/test-delete', (req, res) => {
    res.json({ success: true, message: 'DELETE method is working on this server!' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const assetRoutes = require('./routes/assets');
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');
const categoryRoutes = require('./routes/categories');
const requestRoutes = require('./routes/requests');
const maintenanceRoutes = require('./routes/maintenance');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const officeRoutes = require('./routes/office');
const moduleBuilderRoutes = require('./routes/moduleBuilder');

// API Routes
app.use('/api/auth', authRoutes);

// Specific paths FIRST to avoid collision
app.use('/api/module-builder', moduleBuilderRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/module-sections', require('./routes/moduleSections'));


// Greedy /api routes LAST
app.use('/api', require('./routes/companyModules'));
app.use('/api', require('./routes/erpTemplates'));

app.get('/', (req, res) => {
    res.json({ message: 'TRakio API is running', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
