const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 10000 });

let clients = [];

console.log("🚀 Server started on port 10000");

server.on("connection", (ws) => {
	console.log("🟢 New client connected");

	clients.push(ws);

	ws.on("message", (message) => {
		console.log("📩 Received:", message.toString());

		// 🔥 BROADCAST TO ALL PLAYERS
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message.toString());
			}
		});
	});

	ws.on("close", () => {
		console.log("🔴 Client disconnected");

		clients = clients.filter(c => c !== ws);
	});
});
