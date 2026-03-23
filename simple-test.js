// Simple test for cPanel
const http = require("http");
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      {
        message: "Node.js is working!",
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        port: PORT,
      },
      null,
      2,
    ),
  );
});

server.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

module.exports = server;
