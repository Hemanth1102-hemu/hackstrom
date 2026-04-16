const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Hemanth1102@',
    database: process.env.DB_NAME || 'hackathon_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

exports.query = async (sql, values) => {
    return pool.execute(sql, values);
};

exports.init = async () => {
    try {
        await pool.getConnection();
        console.log("MySQL Database connected successfully.");
    } catch (err) {
        console.error("Database connection failed", err);
    }
};
