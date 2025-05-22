const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Store active WebSocket connections
const clients = new Set();

class RequestHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  sendJsonResponse(statusCode, data) {
    this.res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    this.res.end(JSON.stringify(data));
  }

  handleGet() {
    // Serve static files like SimpleHTTPRequestHandler
    const url = new URL(this.req.url, `http://${this.req.headers.host}`);
    const filePath = path.join(process.cwd(), url.pathname === '/' ? 'index.html' : url.pathname);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          this.sendJsonResponse(404, { error: 'Not Found' });
        } else {
          this.sendJsonResponse(500, { error: 'Internal Server Error' });
        }
        return;
      }

      // Determine content type based on file extension
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (ext) {
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
          contentType = 'image/jpg';
          break;
      }

      this.res.writeHead(200, { 'Content-Type': contentType });
      this.res.end(data);
    });
  }

  handlePost() {
    if (this.req.url === '/answers') {
      let body = '';
      
      this.req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      this.req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const formattedData = JSON.stringify(data, null, 2);
          
          fs.writeFile('answers.json', formattedData, (err) => {
            if (err) {
              this.sendJsonResponse(500, { error: 'Failed to write file' });
              return;
            }
            this.sendJsonResponse(200, { status: 'success' });
          });
        } catch (e) {
          this.sendJsonResponse(400, { error: 'Invalid JSON' });
        }
      });
    } else if (this.req.url === '/validate') {
      // Send message to all connected WebSocket clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'validate' }));
        }
      });
      
      this.sendJsonResponse(200, { 
        status: 'success', 
        message: 'Validation message sent to all connected clients',
        clientCount: clients.size
      });
    } else {
      this.sendJsonResponse(404, { error: 'Not Found' });
    }
  }
}

function runServer(port = 3000) {
  try {
    const server = http.createServer((req, res) => {
      const handler = new RequestHandler(req, res);
      
      if (req.method === 'GET') {
        handler.handleGet();
      } else if (req.method === 'POST') {
        handler.handlePost();
      } else if (req.method === 'OPTIONS') {
        // Handle CORS preflight requests
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
      } else {
        handler.sendJsonResponse(405, { error: 'Method Not Allowed' });
      }
    });
    
    // Create WebSocket server using the ws module
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws, req) => {
      // Add new client to the Set
      clients.add(ws);
      console.log('WebSocket connection established, total clients:', clients.size);
      
      // Handle WebSocket connection close
      ws.on('close', () => {
        clients.delete(ws);
        console.log('WebSocket connection closed, remaining clients:', clients.size);
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
      });
    });
    
    server.listen(port, () => {
      console.log(`Server running on port ${port}...`);
      console.log(`WebSocket server available at ws://localhost:${port}`);
    });
    
    server.on('error', (e) => {
      console.error(`Failed to start server: ${e.message}`);
      process.exit(1);
    });
  } catch (e) {
    console.error(`Failed to start server: ${e.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runServer();
}

module.exports = { runServer }; 
