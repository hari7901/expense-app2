import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import expenseRoutes from "./routes/expenseRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://client-expense-aqk8.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Received ${req.method} request to ${
      req.path
    }`
  );
  next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/expenses", expenseRoutes);

// Root route for health check with more detailed information
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Expense Tracker Backend is ALIVE and RUNNING! 💪",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: ["/api/expenses - Expense-related operations"],
  });
});

// Server Readiness Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    message: "Server is running smoothly!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.stack}`);
  res.status(500).json({
    message: "🚨 Oops! Something went wrong internally 🚨",
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 8000;
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`
    ===================================
    🌟 SERVER SUCCESSFULLY LAUNCHED 🌟
    -----------------------------------
    🔹 Port: ${PORT}
    🔹 Environment: ${process.env.NODE_ENV || "development"}
    🔹 Timestamp: ${new Date().toISOString()}
    🚀 Ready to track those expenses! 💰
    ===================================
    `);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log(`
    ⚠️ SIGTERM RECEIVED
    Shutting down server gracefully...
    Timestamp: ${new Date().toISOString()}
    `);
    server.close(() => {
      console.log("Server terminated successfully. Goodbye! 👋");
      process.exit(0);
    });
  });
};

startServer();

export default app;
