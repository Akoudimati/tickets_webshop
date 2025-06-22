const mysql = require('mysql2');

// Create database connection pool
const pool = mysql.createPool({
    host: 'mysql-3dfa6410-student-b14a.h.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_YybduGVk3kmayJuZByo',
    database: 'defaultdb',
    port: 15421
});

// Get a promise-based interface to use async/await
const promisePool = pool.promise();

// Check database connection and log tables
pool.query('SHOW TABLES', (err, results) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log('Successfully connected to the database!');
        console.log('Available tables:');
        results.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`- ${tableName}`);
        });
    }
});

module.exports = {
    // For traditional callback style
    query: (sql, params, callback) => {
        return pool.query(sql, params, callback);
    },
    
    // For promise-based/async-await style
    execute: async (sql, params) => {
        try {
            const [rows] = await promisePool.execute(sql, params);
            return rows;
        } catch (error) {
            // Only log detailed errors in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Database error:', error);
            }
            throw error;
        }
    },
    
    // Get the pool for direct access if needed
    getPool: () => pool,
    
    // Get the promise pool
    getPromisePool: () => promisePool
}; 