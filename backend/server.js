// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT users.id, user_roles.role
    FROM users
    JOIN user_roles ON users.id = user_roles.user_id
    WHERE users.email = ? AND users.password = ?
  `;

  db.execute(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
      userId: results[0].id,
      role: results[0].role
    });
  });
});

app.listen(process.env.PORT, () => {
  console.log("Backend running on port 5000");
});
