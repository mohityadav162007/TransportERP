import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Get Expenses
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM daily_expenses ORDER BY date DESC, created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("GET EXPENSES ERROR:", err);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// Create Expense
router.post("/", async (req, res) => {
    try {
        const { date, category, amount, vehicle_number, notes } = req.body;

        const result = await pool.query(
            `INSERT INTO daily_expenses (date, category, amount, vehicle_number, notes) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [date, category, amount, vehicle_number, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("CREATE EXPENSE ERROR:", err);
        res.status(500).json({ error: "Failed to create expense" });
    }
});

// Delete Expense
router.delete("/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM daily_expenses WHERE id = $1", [req.params.id]);
        res.json({ message: "Expense deleted" });
    } catch (err) {
        console.error("DELETE EXPENSE ERROR:", err);
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

export default router;
