const amqp = require('amqplib');

let channel = null;

exports.init = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('task_queue', { durable: true });
        console.log("RabbitMQ connected successfully.");
    } catch (error) {
        console.error("RabbitMQ Connection Failed", error);
        setTimeout(this.init, 5000);
    }
};

exports.publishToQueue = async (queueName, data) => {
    if (!channel) throw new Error("Channel not initialized");
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};
