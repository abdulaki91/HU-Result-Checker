require("dotenv").config();

console.log("=== Environment Variables Test ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD ? "***HIDDEN***" : "NOT SET",
);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "***HIDDEN***" : "NOT SET");
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("===================================");
