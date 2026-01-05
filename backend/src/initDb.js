import { pool } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, "sql", "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");

        console.log("Running schema...");
        await pool.query(schema);
        console.log("Schema applied successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Failed to init DB:", err);
        process.exit(1);
    }
};

initDB();
