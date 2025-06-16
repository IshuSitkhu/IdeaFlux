const express = require("express");
const router = require("./router.config");

const app = express();

//Global Middleware***********
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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



module.exports = app;

