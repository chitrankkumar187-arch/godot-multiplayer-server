const WebSocket = require("ws");
const fs = require("fs");

const server = new WebSocket.Server({ port: 10000 });

let clients = [];

// 🔥 DATABASE FILE
const DB_FILE = "accounts.json";

// 🔥 LOAD DB
function loadDB() {
	if (!fs.existsSync(DB_FILE)) return {};
	return JSON.parse(fs.readFileSync(DB_FILE));
}

// 🔥 SAVE DB
function saveDB(data) {
	fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

console.log("🚀 Server started on port 10000");

server.on("connection", (ws) => {
	console.log("🟢 New client connected");

	clients.push(ws);

	ws.on("message", (message) => {
		let msg = message.toString();
		console.log("📩 Received:", msg);

		let data;
		try {
			data = JSON.parse(msg);
		} catch {
			return;
		}

		let db = loadDB();

		// 🔐 SIGNUP
		if (data.type === "signup") {
			if (db[data.username]) {
				ws.send(JSON.stringify({
					type: "error",
					message: "User already exists"
				}));
				return;
			}

			db[data.username] = {
				password: data.password,
				gc: 0
			};

			saveDB(db);

			ws.send(JSON.stringify({
				type: "signup_success"
			}));
			return;
		}

		// 🔐 LOGIN
		if (data.type === "login") {
			if (!db[data.username]) {
				ws.send(JSON.stringify({
					type: "error",
					message: "User not found"
				}));
				return;
			}

			if (db[data.username].password !== data.password) {
				ws.send(JSON.stringify({
					type: "error",
					message: "Wrong password"
				}));
				return;
			}

			ws.send(JSON.stringify({
				type: "login_success",
				gc: db[data.username].gc
			}));
			return;
		}

		// 💬 CHAT → BROADCAST
		if (data.type === "chat") {
			clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(msg);
				}
			});
			return;
		}

		// 🎮 PLAYER DATA → BROADCAST
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(msg);
			}
		});
	});

	ws.on("close", () => {
		console.log("🔴 Client disconnected");
		clients = clients.filter(c => c !== ws);
	});
});
