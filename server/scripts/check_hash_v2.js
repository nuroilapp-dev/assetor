const bcrypt = require('bcryptjs');

const hash = '$2b$10$6tAhZLOGhp46CmFc/7h72OJ5FQFCNxt3kXYrAGOs06IzEGuJjcm56';
const candidates = [
    'admin123', 'Admin123', 'admin@123', 'Admin@123',
    'user123', 'User123', 'password', 'Password',
    'Trakio1234', 'trakio1234', '12345678', '123456',
    'ansar123', 'ansar@123', 'assas123', 'assas@123'
];

async function check() {
    for (const p of candidates) {
        if (await bcrypt.compare(p, hash)) {
            console.log(`MATCH: ${p}`);
            return;
        }
    }
    console.log('No common matches.');
}
check();
