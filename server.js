const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 10000;

const httpServer = http.createServer((req, res) => {
	res.writeHead(200);
	res.end("Server running");
});

httpServer.listen(PORT, "0.0.0.0");

const wss = new WebSocket.Server({ server: httpServer });

let players = [];

wss.on("connection", (ws) => {
	console.log("🟢 Player connected");

	if (players.length >= 2) {
		ws.send(JSON.stringify({ type: "full" }));
		ws.close();
		return;
	}

	players.push(ws);

	// Assign role
	if (players.length == 1) {
		ws.send(JSON.stringify({ type: "role", role: "host" }));
	} else if (players.length == 2) {
		ws.send(JSON.stringify({ type: "role", role: "guest" }));

		// Start match for both
		players.forEach(p => {
			p.send(JSON.stringify({ type: "start_match" }));
		});
	}

	ws.on("message", (msg) => {
		// Relay message to other player
		players.forEach(p => {
			if (p !== ws && p.readyState === WebSocket.OPEN) {
				p.send(msg.toString());
			}
		});
	});

	ws.on("close", () => {
		console.log("🔴 Player disconnected");
		players = players.filter(p => p !== ws);
	});
});
