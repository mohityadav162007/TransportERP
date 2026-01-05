import express from "express";
import { pool } from "../db.js";
import ExcelJS from "exceljs";

const router = express.Router();

/* ================================
   GET ALL PAYMENT HISTORY
================================ */
router.get("/", async (req, res) => {
    try {
        const { type, fromDate, toDate, vehicle } = req.query;

        let query = `
      SELECT 
        ph.*,
        t.party_name,
        t.from_location,
        t.to_location
      FROM payment_history ph
      LEFT JOIN trips t ON ph.trip_id = t.id
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;

        // Filter by transaction type
        if (type && type !== "ALL") {
            query += ` AND ph.transaction_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        // Filter by date range
        if (fromDate) {
            query += ` AND ph.transaction_date >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }

        if (toDate) {
            query += ` AND ph.transaction_date <= $${paramIndex}`;
            params.push(toDate + ' 23:59:59');
            paramIndex++;
        }

        // Filter by vehicle number
        if (vehicle) {
            query += ` AND ph.vehicle_number ILIKE $${paramIndex}`;
            params.push(`%${vehicle}%`);
            paramIndex++;
        }

        query += ` ORDER BY ph.transaction_date DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("GET PAYMENT HISTORY ERROR:", err);
        res.status(500).json({ message: "Failed to fetch payment history" });
    }
});

/* ================================
   EXPORT TO EXCEL
================================ */
router.get("/export", async (req, res) => {
    try {
        const { type, fromDate, toDate, vehicle } = req.query;

        let query = `
      SELECT 
        ph.*,
        t.party_name,
        t.from_location,
        t.to_location
      FROM payment_history ph
      LEFT JOIN trips t ON ph.trip_id = t.id
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;

        if (type && type !== "ALL") {
            query += ` AND ph.transaction_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        if (fromDate) {
            query += ` AND ph.transaction_date >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }

        if (toDate) {
            query += ` AND ph.transaction_date <= $${paramIndex}`;
            params.push(toDate + ' 23:59:59');
            paramIndex++;
        }

        if (vehicle) {
            query += ` AND ph.vehicle_number ILIKE $${paramIndex}`;
            params.push(`%${vehicle}%`);
            paramIndex++;
        }

        query += ` ORDER BY ph.transaction_date DESC`;

        const result = await pool.query(query, params);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Payment History");

        // Add headers
        worksheet.columns = [
            { header: "Date", key: "transaction_date", width: 15 },
            { header: "Trip Code", key: "trip_code", width: 15 },
            { header: "Vehicle Number", key: "vehicle_number", width: 15 },
            { header: "Type", key: "transaction_type", width: 10 },
            { header: "Payment Type", key: "payment_type", width: 25 },
            { header: "Amount", key: "amount", width: 12 },
            { header: "Party Name", key: "party_name", width: 20 },
            { header: "Route", key: "route", width: 30 },
        ];

        // Add rows
        result.rows.forEach((row) => {
            worksheet.addRow({
                transaction_date: new Date(row.transaction_date).toLocaleDateString("en-GB"),
                trip_code: row.trip_code,
                vehicle_number: row.vehicle_number,
                transaction_type: row.transaction_type,
                payment_type: row.payment_type,
                amount: parseFloat(row.amount),
                party_name: row.party_name,
                route: `${row.from_location} → ${row.to_location}`,
            });
        });

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" },
        };

        // Set response headers
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=payment-history-${new Date().toISOString().split("T")[0]}.xlsx`
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("EXPORT PAYMENT HISTORY ERROR:", err);
        res.status(500).json({ message: "Failed to export payment history" });
    }
});

export default router;
