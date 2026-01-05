import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import tripsRouter from "./routes/trips.js";
import analyticsRouter from "./routes/analytics.js";
import dashboardRouter from "./routes/dashboard.js";
import reportsRouter from "./routes/reports.js";
import authRouter from "./routes/auth.js";
import paymentHistoryRouter from "./routes/paymentHistory.js";
import authenticateToken from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use("/api/auth", authRouter);

// Protected routes
app.use("/api/trips", authenticateToken, tripsRouter);
app.use("/api/analytics", authenticateToken, analyticsRouter);
app.use("/api/dashboard", authenticateToken, dashboardRouter);
app.use("/api/reports", authenticateToken, reportsRouter);
app.use("/api/payment-history", authenticateToken, paymentHistoryRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
// Render and local environments need app.listen. 
// Vercel handles the execution itself.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

export default app;
