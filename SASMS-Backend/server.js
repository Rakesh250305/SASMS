import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbconfig.js";

dotenv.config();
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// CORS middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/provider", providerRoutes);
app.use("/user", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Smart Asset & Service Management System Backend is Running",
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// export default app;
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});