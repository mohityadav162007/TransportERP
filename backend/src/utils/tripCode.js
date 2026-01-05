import { pool } from "../db.js";

export async function generateTripCode(loading_date) {
  const date = new Date(loading_date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM trips
    WHERE
      EXTRACT(YEAR FROM loading_date) = $1
      AND EXTRACT(MONTH FROM loading_date) = $2
    `,
    [year, month]
  );

  const next = String(result.rows[0].count + 1).padStart(3, "0");

  return `${year}_${month}_${next}`;
}
