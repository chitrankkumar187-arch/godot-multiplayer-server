const http = require("http");
const WebSocket = require("ws");

// Create HTTP server (required for Render)
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Server running");
});

// Attach WebSocket to HTTP server
const wss = new WebSocket.Server({ server });

// Store all connected clients
let clients = [];

wss.on("connection", (ws) => {
    console.log("New player connected");

    clients.push(ws);

    ws.on("message", (message) => {
        console.log("Received:", message.toString());

        // Send message to ALL OTHER players
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on("close", () => {
        console.log("Player disconnected");
        clients = clients.filter(c => c !== ws);
    });
});

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log("Server started on port", PORT);
});
