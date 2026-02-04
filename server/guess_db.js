const { Client } = require('pg');

const configs = [
    { user: 'postgres', password: '' },
    { user: 'postgres', password: 'password' },
    { user: 'postgres', password: 'admin' },
    { user: 'postgres', password: 'root' },
    { user: 'postgres', password: 'admin123' },
    { user: 'Administrator', password: '' }
];

async function tryConnect() {
    for (const config of configs) {
        const client = new Client({
            host: 'localhost',
            port: 5432,
            database: 'software_db',
            ...config
        });
        try {
            console.log(`Trying user: ${config.user}, password: ${config.password || '(empty)'}`);
            await client.connect();
            console.log('SUCCESS!');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed: ${err.code} - ${err.message}`);
        }
    }
    process.exit(1);
}

tryConnect();
