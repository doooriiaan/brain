import mysql from "mysql2/promise";

const requiredEnvKeys = [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
];

const hasDatabaseConfig = requiredEnvKeys.every(
  (key) => Boolean(process.env[key]),
);

let pool = null;

if (hasDatabaseConfig) {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
  });
}

export const isDatabaseConfigured = hasDatabaseConfig;

export function getPool() {
  return pool;
}
