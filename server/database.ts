import mariadb, { Connection, Pool } from "mariadb";

const pool: Pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.USER_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  connectTimeout: 10000,
  connectionLimit: 100,
});

export const getPool = () => pool;

export async function setupDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

export async function getConnection(): Promise<Connection> {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error("Error getting database connection: ", error);
    throw error;
  }
}

export async function query(sql: string, params?: any[]): Promise<any> {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (err) {
    console.error("Error executing database query:", err);
    throw err;
  } finally {
    if (conn) {
      try {
        conn.end();
      } catch (err) {
        console.error("Error releasing connection: ", err);
      }
    }
  }
}
