import mariadb, { Connection, Pool } from "mariadb";

let connection: Connection | null = null;
const pool: Pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.USER_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  connectTimeout: 10000,
});

export async function setupDatabase() {
  try {
    connection = await pool.getConnection();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

export async function getConnection(): Promise<Connection> {
  if (!connection) {
    try {
      connection = await pool.getConnection();
    } catch (error) {
      console.error("Error getting database connection: ", error);
      throw error;
    }
  }
  return connection;
}
export async function query(sql: string, params?: any[]): Promise<any> {
  let conn: Connection;
  try {
    conn = await getConnection();
    const result = await conn.query(sql, params);

    //return connection to pool
    try { conn.end(); } 
    catch (err) { console.error("Error releasing connection: ", err); }
    
    return result;
  } catch (err) {
    console.error("Error executing database query:", err);
  }
}
