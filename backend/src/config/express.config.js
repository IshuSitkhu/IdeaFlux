const express = require("express");
const cors = require("cors");
const router = require("./router.config");
const http = require("http");

const app = express();

//Global Middleware***********
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // ✅ Allow frontend origin


app.get('/',(req, res, next) => {
    res.send("Welcome to the Express Server!");
});

//Mount API Routes
app.use(router);




// Central Error Handling Middleware (must be AFTER routes)
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message:message,
    options: null,
  });
});

const server = http.createServer(app);

// ✅ Export app and server (socket.io will be initialized separately)
module.exports = { app, server };



