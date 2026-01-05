import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * Helper: build WHERE clause for filters
 */
function buildFilters({ startDate, endDate, party_payment_status, pod_status }) {
  const conditions = ["is_deleted = false"];
  const values = [];
  let idx = 1;

  if (startDate) {
    conditions.push(`loading_date >= $${idx++}`);
    values.push(startDate);
  }

  if (endDate) {
    conditions.push(`loading_date <= $${idx++}`);
    values.push(endDate);
  }

  if (party_payment_status) {
    conditions.push(`party_payment_status = $${idx++}`);
    values.push(party_payment_status);
  }

  if (pod_status) {
    conditions.push(`pod_status = $${idx++}`);
    values.push(pod_status);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values
  };
}

/**
 * PARTY-WISE OUTSTANDING
 */
router.get("/party-outstanding", async (req, res) => {
  try {
    const { where, values } = buildFilters(req.query);

    const result = await pool.query(
      `
      SELECT
        party_name,
        SUM(party_freight + himmali) AS total_freight,
        SUM(party_advance) AS total_advance,
        SUM(tds) AS total_tds,
        SUM(party_balance) AS outstanding
      FROM trips
      ${where}
      GROUP BY party_name
      ORDER BY outstanding DESC
      `,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load party analytics" });
  }
});

/**
 * MOTOR OWNER (GAADI) PAYOUT
 */
router.get("/gaadi-payout", async (req, res) => {
  try {
    const { where, values } = buildFilters(req.query);

    const result = await pool.query(
      `
      SELECT
        vehicle_number,
        motor_owner_name,
        SUM(gaadi_freight) AS total_freight,
        SUM(gaadi_advance) AS total_advance,
        SUM(gaadi_balance) AS payable
      FROM trips
      ${where}
      GROUP BY vehicle_number, motor_owner_name
      ORDER BY payable DESC
      `,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load gaadi analytics" });
  }
});

/**
 * PROFIT — DAILY / MONTHLY / YEARLY
 * ?group=daily|monthly|yearly
 */
router.get("/profit", async (req, res) => {
  try {
    const group = req.query.group || "monthly";
    let groupExpr;

    if (group === "daily") groupExpr = "DATE(loading_date)";
    else if (group === "yearly") groupExpr = "DATE_TRUNC('year', loading_date)";
    else groupExpr = "DATE_TRUNC('month', loading_date)";

    const { where, values } = buildFilters(req.query);

    const result = await pool.query(
      `
      SELECT
        ${groupExpr} AS period,
        SUM(profit) AS profit
      FROM trips
      ${where}
      GROUP BY period
      ORDER BY period
      `,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profit analytics" });
  }
});

/**
 * OPERATIONAL STATS
 */
router.get("/operations", async (req, res) => {
  try {
    const { where, values } = buildFilters(req.query);

    const result = await pool.query(
      `
      SELECT
        COUNT(*) AS total_trips,
        COUNT(*) FILTER (WHERE pod_status = 'PENDING') AS pod_pending,
        COUNT(*) FILTER (WHERE party_payment_status = 'UNPAID') AS payment_pending
      FROM trips
      ${where}
      `,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load operational stats" });
  }
});

export default router;
