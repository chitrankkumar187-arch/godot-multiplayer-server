const http = require("http");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Server is running");
});

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", function connection(ws) {
    console.log("New player connected");
    clients.push(ws);

    ws.on("message", function incoming(message) {
        console.log("Received:", message.toString());

        clients.forEach(client => {
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

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
