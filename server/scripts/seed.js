const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
    try {
        console.log('Starting database seeding...');
        const seedSql = fs.readFileSync(path.join(__dirname, '../../db/seed.sql'), 'utf8');

        // Split by semicolon but ignore semicolons inside quotes
        // This is a simple split, for complex SQL files it might need a better parser
        const queries = seedSql
            .split(/;\s*$/m)
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (let query of queries) {
            await db.query(query);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
