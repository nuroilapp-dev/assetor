const bcrypt = require('bcryptjs');

const hash = '$2b$10$6tAhZLOGhp46CmFc/7h72OJ5FQFCNxt3kXYrAGOs06IzEGuJjcm56';
const candidates = ['admin123', 'user123', 'password123', 'Trakio1234', 'admin', '12345678'];

async function check() {
    console.log('Checking hash against common candidates...');
    for (const p of candidates) {
        const match = await bcrypt.compare(p, hash);
        if (match) {
            console.log(`MATCH FOUND: "${p}"`);
            return;
        }
    }
    console.log('No match found in common candidates.');
}

check();
