const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

let clients = [];

wss.on("connection", function connection(ws) {
    console.log("New player connected");
    clients.push(ws);

    ws.on("message", function incoming(message) {
        console.log("Received:", message.toString());

        // 🔥 SEND TO ALL OTHER PLAYERS (NOT SELF)
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

console.log("Server running...");
