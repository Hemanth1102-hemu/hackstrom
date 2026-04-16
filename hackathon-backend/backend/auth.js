const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const db = require('./db');
const { encrypt } = require('./crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
    try {
        const { name, email, password, ssn_data } = req.body;
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) return res.status(400).json({ error: "Email exists" });

        const hash = await bcrypt.hash(password, 10);
        const encryptedPii = encrypt(ssn_data || ""); // E2E Encryption dummy field
        
        const id = uuidv4();
        await db.query(
            "INSERT INTO users (id, name, email, password_hash, encrypted_pii) VALUES (?, ?, ?, ?, ?)",
            [id, name, email, hash, encryptedPii]
        );
        res.status(201).json({ message: "Registered", target: "Must verify via OTP in real system" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(401).json({ error: "Invalid credentials" });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await db.query("INSERT INTO otp_verification (id, user_id, otp_hash, expires_at) VALUES (?, ?, ?, ?)", [uuidv4(), user.id, otpHash, expiresAt]);
        
        console.log(`[MOCK EMAIL to ${email}] Your OTP is: ${otp}`);
        
        res.json({ message: "OTP sent to email. Verify to continue.", user_id: user.id });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { user_id, otp } = req.body;
        const [records] = await db.query("SELECT * FROM otp_verification WHERE user_id = ? ORDER BY expires_at DESC LIMIT 1", [user_id]);
        if (records.length === 0) return res.status(400).json({ error: "No OTP found" });

        const record = records[0];
        if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: "OTP expired" });

        const isValid = await bcrypt.compare(otp, record.otp_hash);
        if (!isValid) return res.status(400).json({ error: "Invalid OTP" });

        // Mark verified
        await db.query("UPDATE users SET is_verified = TRUE WHERE id = ?", [user_id]);
        
        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [user_id]);
        
        // Generate tokens
        const accessToken = jwt.sign({ id: user_id, role: users[0].role }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user_id }, JWT_SECRET, { expiresIn: '7d' });

        await db.query(
            "INSERT INTO auth_tokens (id, user_id, access_token, refresh_token) VALUES (?, ?, ?, ?)",
            [uuidv4(), user_id, accessToken, refreshToken]
        );

        res.json({ access_token: accessToken, refresh_token: refreshToken });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.googleSignIn = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        let user;
        if (users.length === 0) {
            const id = uuidv4();
            await db.query("INSERT INTO users (id, name, email, is_verified) VALUES (?, ?, ?, TRUE)", [id, name, email]);
            const [newUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            user = newUsers[0];
        } else {
            user = users[0];
        }

        const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ access_token: accessToken, refresh_token: refreshToken });
    } catch (err) {
        res.status(401).json({ error: "Invalid Google token" });
    }
};
