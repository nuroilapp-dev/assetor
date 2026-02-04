const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

console.log(`Database configuration: Connecting to ${process.env.DB_NAME} as ${process.env.DB_USER} on port ${process.env.DB_PORT || 5432}`);

// Helper to convert MySQL '?' to PostgreSQL '$1, $2, ...'
const convertPlaceholders = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

const db = {
    // Keep the same 'execute' signature used in controllers
    execute: async (sql, params = []) => {
        try {
            const pgSql = convertPlaceholders(sql);
            const result = await pool.query(pgSql, params);
            // MySQL returns [rows, fields]. pg returns result object.
            // Returning [result.rows] to match the [rows] = wait db.execute() pattern.
            return [result.rows];
        } catch (error) {
            console.error('PostgreSQL Execute Error:', error.message);
            throw error;
        }
    },
    query: async (sql, params = []) => {
        const pgSql = convertPlaceholders(sql);
        return pool.query(pgSql, params);
    },
    getConnection: async () => {
        const client = await pool.connect();
        // Mocking the MySQL 'execute' and 'beginTransaction' methods for the client
        const originalQuery = client.query.bind(client);
        client.execute = async (sql, params = []) => {
            const pgSql = convertPlaceholders(sql);
            const res = await originalQuery(pgSql, params);
            return [res.rows];
        };
        client.beginTransaction = () => client.query('BEGIN');
        client.commit = () => client.query('COMMIT');
        client.rollback = () => client.query('ROLLBACK');
        return client;
    },
    pool
};

console.log('Database configuration loaded: Using PostgreSQL');

module.exports = db;
