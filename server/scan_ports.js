const net = require('net');

const ports = [5432, 5433, 5434];
const host = 'localhost';

ports.forEach(port => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
        console.log(`Port ${port} is open`);
        socket.destroy();
    });
    socket.on('timeout', () => {
        console.log(`Port ${port} timed out`);
        socket.destroy();
    });
    socket.on('error', (err) => {
        console.log(`Port ${port} error: ${err.message}`);
    });
    socket.connect(port, host);
});
