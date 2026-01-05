import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addColumn() {
    try {
        await pool.query(`
      ALTER TABLE trips 
      ADD COLUMN IF NOT EXISTS gaadi_balance_status VARCHAR(50) DEFAULT 'UNPAID'
    `);
        console.log('✅ Added gaadi_balance_status column');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

addColumn();
