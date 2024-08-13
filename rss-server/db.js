import mariadb from 'mariadb';
import 'dotenv/config';

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.USER_PW,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),
    connectionLimit: 5
});

const asyncFunction = async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT 1 as val');
        console.log(rows); // [ { val: 1 } ]
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
};

export { asyncFunction };
// asyncFunction();