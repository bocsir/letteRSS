import mariadb, { Connection, Pool } from "mariadb";

let connection: Connection | null = null;
const pool: Pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.USER_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
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
    connection = await pool.getConnection();
  }
  return connection;
}