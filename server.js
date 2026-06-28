const http = require('http');
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

function startServer(port) {
  const server = http.createServer((req, res) => {
    if (req.url === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    fs.readFile(indexPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.log(`Port ${port} is busy, trying ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer(Number(process.env.PORT) || 3000);
