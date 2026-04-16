const amqp = require('amqplib');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Hemanth1102@',
    database: process.env.DB_NAME || 'hackathon_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const simulateAIPrediction = async (payload) => {
    // Demo use case: AI Prediction simulation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`AI Processing completed for: ${JSON.stringify(payload)}. Score: 0.98`);
        }, 3000); 
    });
};

const initWorker = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();
        
        await channel.assertQueue('task_queue', { durable: true });
        
        // Parallelism - prefetch 2 (allows processing 2 messages concurrently)
        channel.prefetch(2);
        
        console.log("Worker started. Listening for messages...");

        channel.consume('task_queue', async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                const { task_id, payload } = data;
                
                console.log(`[WORKER] Received task: ${task_id}`);
                
                try {
                    // Update DB to Processing
                    await pool.execute("UPDATE tasks SET status = 'processing' WHERE task_id = ?", [task_id]);
                    
                    // Idempotency: Process AI task
                    const result = await simulateAIPrediction(payload);
                    
                    // Update DB to Completed
                    await pool.execute("UPDATE tasks SET status = 'completed', result = ? WHERE task_id = ?", [result, task_id]);
                    
                    console.log(`[WORKER] Task ${task_id} completed successfully.`);
                    channel.ack(msg); // Acknowledgement
                } catch (error) {
                    console.error(`[WORKER] Task ${task_id} failed:`, error);
                    await pool.execute("UPDATE tasks SET status = 'failed' WHERE task_id = ?", [task_id]);
                    channel.nack(msg, false, false); // Do not requeue, or true to retry
                }
            }
        });
    } catch (error) {
        console.error("Worker failed to start", error);
        setTimeout(initWorker, 5000);
    }
};

initWorker();
