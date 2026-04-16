const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');
const auth = require('./auth');
const queue = require('./queue');

const app = express();
app.use(cors());
app.use(express.json());

// Request Tracing Middleware
app.use((req, res, next) => {
    req.request_id = uuidv4();
    console.log(`[${new Date().toISOString()}] REQ: ${req.request_id} | ${req.method} ${req.url}`);
    res.setHeader('X-Request-Id', req.request_id);
    next();
});

// Auth Routes
app.post('/api/auth/register', auth.register);
app.post('/api/auth/login', auth.login); // Step 1
app.post('/api/auth/verify-otp', auth.verifyOtp); // Step 2
app.post('/api/auth/google', auth.googleSignIn);

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const requireRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        console.log(`[${req.request_id}] RBAC Denied. User role: ${req.user.role}, Required: ${role}`);
        return res.status(403).json({ error: "Access Denied" });
    }
    next();
};

// Task Processing Route
app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { payload } = req.body;
        const task_id = uuidv4();
        
        // Insert DB
        await db.query(
            "INSERT INTO tasks (id, user_id, task_id, status) VALUES (?, ?, ?, 'pending')",
            [uuidv4(), req.user.id, task_id]
        );
        
        // Push to Queue
        await queue.publishToQueue('task_queue', { task_id, user_id: req.user.id, payload });
        
        res.json({ message: "Task queued successfully", task_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Error" });
    }
});

// Admin Route example
app.get('/api/admin/tasks', authenticateToken, requireRole('admin'), async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks");
    res.json(rows);
});

// Check status
app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks WHERE task_id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
});

app.listen(3000, () => {
    console.log('Backend API running on port 3000');
    db.init();
    queue.init();
});
