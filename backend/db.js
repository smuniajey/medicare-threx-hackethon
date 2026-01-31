const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Muni@382546",
  database: "medicare_db",
});

module.exports = db;
