import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

let query;

if (process.env.NODE_ENV === 'production') {
  const { neon } = await import('@neondatabase/serverless');
  const neonClient = neon(process.env.DATABASE_URL);

  query = async (text, params = []) => {
    const prepared = text.replace(/\$\d+/g, '?');
    const result = await neonClient.unsafe(prepared, params);
    return result;
  };
} else {
  const pool = new pg.Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'Minedu',
    database: process.env.DB_NAME || 'Biblioteca',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  });

  query = async (text, params = []) => {
    const result = await pool.query(text, params);
    return result.rows;
  };
}

export { query };
