const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

let clients = [];

wss.on("connection", function connection(ws) {
    clients.push(ws);

    ws.on("message", function incoming(message) {
        // send message to all players
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
    });
});

console.log("Server running...");
