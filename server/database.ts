import mariadb, { Connection, Pool } from "mariadb";

const pool: Pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.USER_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  connectionLimit: 5,
  acquireTimeout: 30000,
  idleTimeout: 60000,
});

//test db connection
export async function setupDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Error connecting to the database:", err);
  } 
}

export function getPool(): Pool {
  return pool;
}
